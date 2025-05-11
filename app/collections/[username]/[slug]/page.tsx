import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookmarkCollectionByUserAndSlug } from "@/services/bookmark/collection";
import { getBookmarkCategoriesWithSubcategories } from "@/services/bookmark/category";
import { getCurrentUserUuidClient } from "@/services/bookmark/auth";
import { CollectionDetailView } from "@/components/bookmark/views/collection-detail-view";

interface CollectionDetailPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;

  // 获取集合信息
  const collection = await getBookmarkCollectionByUserAndSlug(username, slug);

  if (!collection) {
    return {
      title: "集合不存在 | 书签集合导航",
      description: "找不到该书签集合。",
    };
  }

  return {
    title: `${collection.name} | ${username} 的书签集合`,
    description: collection.description || `${username} 创建的书签集合：${collection.name}`,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;

  // 获取集合信息
  const collection = await getBookmarkCollectionByUserAndSlug(username, slug);

  if (!collection) {
    notFound();
  }

  // 获取分类和子分类信息
  const categoriesWithSubcategories = await getBookmarkCategoriesWithSubcategories(collection.uuid);

  // 获取当前用户UUID（用于判断是否是集合所有者）
  const currentUserUuid = await getCurrentUserUuidClient();
  const isOwner = currentUserUuid === collection.user_uuid;

  // 如果集合是私有的，且当前用户不是所有者，则返回404
  if (!collection.is_public && !isOwner) {
    notFound();
  }

  return (
    <CollectionDetailView
      collection={collection}
      categoriesWithSubcategories={categoriesWithSubcategories}
      isOwner={isOwner}
      username={username}
      currentUserUuid={currentUserUuid}
    />
  );
}
