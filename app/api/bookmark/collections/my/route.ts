import { NextRequest, NextResponse } from "next/server";
import { getUserBookmarkCollections } from "@/services/bookmark/collection";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { getBookmarkCategoriesByCollection } from "@/services/bookmark/category";
import { getBookmarkSubcategoriesByCategory } from "@/services/bookmark/subcategory";

// GET /api/bookmark/collections/my
// 获取当前登录用户的所有集合
export async function GET(request: NextRequest) {
  try {
    const currentUserUuid = await getCurrentUserUuid();

    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 获取用户的所有集合
    const collections = await getUserBookmarkCollections(currentUserUuid);

    // 为每个集合添加分类和子分类信息
    const collectionsWithCategories = await Promise.all(
      collections.map(async (collection) => {
        // 获取集合的所有分类
        const categories = await getBookmarkCategoriesByCollection(collection.uuid);

        // 为每个分类添加子分类信息
        const categoriesWithSubcategories = await Promise.all(
          categories.map(async (category) => {
            const subcategories = await getBookmarkSubcategoriesByCategory(category.uuid);
            return {
              ...category,
              subcategories
            };
          })
        );

        return {
          ...collection,
          categories: categoriesWithSubcategories
        };
      })
    );

    return NextResponse.json(collectionsWithCategories);
  } catch (error) {
    console.error("Error in GET /api/bookmark/collections/my:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
