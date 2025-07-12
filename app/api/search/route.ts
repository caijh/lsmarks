import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all";
    const dateRange = searchParams.get("date") || "all";
    const collection = searchParams.get("collection");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const supabase = createClient();
    const results: any[] = [];

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 搜索书签
    if (type === "all" || type === "bookmark") {
      let bookmarkQuery = supabase
        .from("bookmark_items")
        .select(`
          uuid,
          title,
          description,
          url,
          icon_url,
          created_at,
          subcategory_uuid,
          bookmark_subcategories!inner(
            name,
            category_uuid,
            bookmark_categories!inner(
              name,
              collection_uuid,
              bookmark_collections!inner(
                name,
                slug,
                is_public,
                user_uuid,
                users!inner(username)
              )
            )
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,url.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      // 如果用户未登录，只搜索公开集合
      if (!session?.user?.uuid) {
        bookmarkQuery = bookmarkQuery.eq("bookmark_subcategories.bookmark_categories.bookmark_collections.is_public", true);
      } else {
        // 如果用户已登录，搜索公开集合和用户自己的集合
        bookmarkQuery = bookmarkQuery.or(
          `bookmark_subcategories.bookmark_categories.bookmark_collections.is_public.eq.true,bookmark_subcategories.bookmark_categories.bookmark_collections.user_uuid.eq.${session.user.uuid}`
        );
      }

      // 按集合筛选
      if (collection) {
        bookmarkQuery = bookmarkQuery.eq("bookmark_subcategories.bookmark_categories.bookmark_collections.uuid", collection);
      }

      // 按分类筛选
      if (category) {
        bookmarkQuery = bookmarkQuery.eq("bookmark_subcategories.bookmark_categories.uuid", category);
      }

      // 按时间范围筛选
      if (dateRange !== "all") {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        bookmarkQuery = bookmarkQuery.gte("created_at", startDate.toISOString());
      }

      const { data: bookmarks, error: bookmarkError } = await bookmarkQuery
        .range(offset, offset + limit - 1);

      if (bookmarkError) {
        console.error("Bookmark search error:", bookmarkError);
      } else if (bookmarks) {
        results.push(...bookmarks.map((bookmark: any) => ({
          id: bookmark.uuid,
          type: "bookmark",
          title: bookmark.title,
          description: bookmark.description,
          url: bookmark.url,
          icon_url: bookmark.icon_url,
          created_at: bookmark.created_at,
          collection_name: bookmark.bookmark_subcategories?.bookmark_categories?.bookmark_collections?.name,
          category_name: bookmark.bookmark_subcategories?.bookmark_categories?.name,
          subcategory_name: bookmark.bookmark_subcategories?.name,
          username: bookmark.bookmark_subcategories?.bookmark_categories?.bookmark_collections?.users?.username,
          slug: bookmark.bookmark_subcategories?.bookmark_categories?.bookmark_collections?.slug
        })));
      }
    }

    // 搜索集合
    if (type === "all" || type === "collection") {
      let collectionQuery = supabase
        .from("bookmark_collections")
        .select(`
          uuid,
          name,
          description,
          slug,
          is_public,
          created_at,
          user_uuid,
          users!inner(username)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      // 如果用户未登录，只搜索公开集合
      if (!session?.user?.uuid) {
        collectionQuery = collectionQuery.eq("is_public", true);
      } else {
        // 如果用户已登录，搜索公开集合和用户自己的集合
        collectionQuery = collectionQuery.or(`is_public.eq.true,user_uuid.eq.${session.user.uuid}`);
      }

      // 按时间范围筛选
      if (dateRange !== "all") {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        collectionQuery = collectionQuery.gte("created_at", startDate.toISOString());
      }

      const { data: collections, error: collectionError } = await collectionQuery
        .range(offset, offset + limit - 1);

      if (collectionError) {
        console.error("Collection search error:", collectionError);
      } else if (collections) {
        results.push(...collections.map((collection: any) => ({
          id: collection.uuid,
          type: "collection",
          title: collection.name,
          description: collection.description,
          created_at: collection.created_at,
          username: collection.users?.username,
          slug: collection.slug,
          is_public: collection.is_public
        })));
      }
    }

    // 搜索分类
    if (type === "all" || type === "category") {
      let categoryQuery = supabase
        .from("bookmark_categories")
        .select(`
          uuid,
          name,
          description,
          created_at,
          collection_uuid,
          bookmark_collections!inner(
            name,
            slug,
            is_public,
            user_uuid,
            users!inner(username)
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      // 如果用户未登录，只搜索公开集合的分类
      if (!session?.user?.uuid) {
        categoryQuery = categoryQuery.eq("bookmark_collections.is_public", true);
      } else {
        // 如果用户已登录，搜索公开集合和用户自己集合的分类
        categoryQuery = categoryQuery.or(
          `bookmark_collections.is_public.eq.true,bookmark_collections.user_uuid.eq.${session.user.uuid}`
        );
      }

      // 按集合筛选
      if (collection) {
        categoryQuery = categoryQuery.eq("collection_uuid", collection);
      }

      // 按时间范围筛选
      if (dateRange !== "all") {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        categoryQuery = categoryQuery.gte("created_at", startDate.toISOString());
      }

      const { data: categories, error: categoryError } = await categoryQuery
        .range(offset, offset + limit - 1);

      if (categoryError) {
        console.error("Category search error:", categoryError);
      } else if (categories) {
        results.push(...categories.map((category: any) => ({
          id: category.uuid,
          type: "category",
          title: category.name,
          description: category.description,
          created_at: category.created_at,
          collection_name: category.bookmark_collections?.name,
          username: category.bookmark_collections?.users?.username,
          slug: category.bookmark_collections?.slug
        })));
      }
    }

    // 按创建时间排序
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 应用分页
    const paginatedResults = results.slice(0, limit);

    return NextResponse.json({
      results: paginatedResults,
      total: results.length,
      page,
      limit,
      hasMore: results.length > limit
    });

  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "搜索服务暂时不可用" },
      { status: 500 }
    );
  }
}
