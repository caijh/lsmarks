import { Metadata } from "next";
import { HeroBanner } from "@/components/bookmark/home/hero-banner";
import { HexagramSection } from "@/components/bookmark/home/hexagram-section";
import { BookmarkletSection } from "@/components/bookmark/home/bookmarklet-section";
import { CtaSection } from "@/components/bookmark/home/cta-section";

export const metadata: Metadata = {
  title: "雷水书签 - 组织和分享您的书签",
  description: "使用雷水书签组织、分类和分享您的书签，创建公开或私有的网站收藏集合，灵感源自《周易》解卦。",
};

export default async function HomePage() {
  // 在 Next.js 15.2.3 中，不再需要获取请求头
  // 移除获取请求头的代码，避免类型错误

  // 移除国际化重定向逻辑

  return (
    <div className="flex flex-col seamless-background relative">
      {/* 统一的背景装饰 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] -z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-30 -z-10"></div>

      <div className="space-y-4">
        {/* 英雄区域 */}
        <HeroBanner />

        {/* 解卦解释 */}
        <HexagramSection />

        {/* Bookmarklet功能介绍 */}
        <BookmarkletSection />

        {/* 号召性用语 */}
        <CtaSection />
      </div>
    </div>
  );
}
