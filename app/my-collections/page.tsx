import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserBookmarkCollections, getUserBookmarkCollectionCount } from "@/services/bookmark/collection";
import { MyCollectionsView } from "@/components/bookmark/views/my-collections-view";
import { UserInfoCard } from "@/components/bookmark/user/user-info-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "我的书签集合 | 书签集合导航",
  description: "管理你的书签集合，包括公开和私有集合。",
};

// 用户信息卡片骨架屏
function UserInfoCardSkeleton() {
  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    </Card>
  );
}

// 集合列表骨架屏
function MyCollectionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-6 w-[80%] mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[80px]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// 集合内容组件
async function CollectionsContent({
  userUuid,
  page,
  limit,
  locale,
}: {
  userUuid: string;
  page: number;
  limit: number;
  locale: string;
}) {
  // 获取用户的书签集合
  const collections = await getUserBookmarkCollections(userUuid, page, limit);

  // 获取用户的书签集合总数
  const totalCount = await getUserBookmarkCollectionCount(userUuid);

  // 计算总页数
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <MyCollectionsView
      collections={collections}
      currentPage={page}
      totalPages={totalPages}
      locale={locale}
      userUuid={userUuid}
    />
  );
}

export default async function MyCollectionsPage() {
  // 硬编码为中文
  const locale = 'zh';

  // 获取当前用户会话
  const session = await auth();

  // 如果用户未登录，重定向到登录页面
  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  // 获取当前页码
  const page = 1; // 默认为第一页
  const limit = 12; // 每页显示的集合数量

  return (
    <div>
      {/* 用户信息卡片和集合内容并行加载 */}
      <div className="mb-3">
        <Suspense fallback={<UserInfoCardSkeleton />}>
          <UserInfoCard />
        </Suspense>
      </div>

      {/* 集合内容 */}
      <Suspense fallback={<MyCollectionsSkeleton />}>
        <CollectionsContent
          userUuid={session.user.uuid}
          page={page}
          limit={limit}
          locale={locale}
        />
      </Suspense>
    </div>
  );
}
