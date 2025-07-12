"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, BookmarkPlus } from "@/components/ui/icons";
import { motion } from "framer-motion";

export function HeroBanner() {
  // 硬编码中文翻译
  const t = (key: string) => {
    // 为常用键提供默认值
    if (key === "home.hero.title") return "LSMarks · 智能书签管理";
    if (key === "home.hero.subtitle") return "组织、分类和分享您的网络书签";
    if (key === "home.hero.description") return "LSMarks 帮助您整理网络资源，创建个性化的书签集合，并轻松分享给他人。构建您的个人知识库。";
    if (key === "home.hero.cta_primary") return "开始使用";
    if (key === "home.hero.cta_secondary") return "了解更多";
    if (key === "bookmark.header.site_name") return "LSMarks";
    return key;
  };

  return (
    <div className="relative overflow-hidden py-12 sm:py-16 md:py-20">

      {/* 雷电效果 - 在移动端调整位置 */}
      <motion.div
        className="absolute top-8 sm:top-10 right-[15%] sm:right-[20%] w-px h-16 sm:h-20 bg-blue-400/70"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 7 }}
      />
      <motion.div
        className="absolute top-8 sm:top-10 right-[15%] sm:right-[20%] w-px h-32 sm:h-40 bg-blue-400/40 rotate-12 origin-top"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
        transition={{ duration: 0.5, delay: 0.1, repeat: Infinity, repeatDelay: 7 }}
      />

      {/* 水滴效果 - 在移动端调整位置 */}
      <motion.div
        className="absolute bottom-16 sm:bottom-20 left-[25%] sm:left-[30%] w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-400/70"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 20, opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
      />
      <motion.div
        className="absolute bottom-8 sm:bottom-10 left-[30%] sm:left-[35%] w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-blue-400/50"
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 15, opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, delay: 0.5, repeat: Infinity, repeatDelay: 4 }}
      />

      <div className="container relative z-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 sm:mb-6 flex justify-center"
          >
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              <BookmarkPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">智能书签管理</span>
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 leading-tight"
          >
            {t("bookmark.header.site_name")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 px-2 sm:px-4"
          >
            智能整理，高效管理，让您的网络资源井然有序
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm sm:text-base md:text-lg text-foreground/80 mb-8 sm:mb-10 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed"
          >
            告别杂乱无章的书签管理，LSMarks 帮您轻松整理网络资源，
            <br className="hidden sm:inline" />
            构建个人知识库，开启高效有序的数字生活。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <Link href="/auth/signin" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="rounded-full px-6 sm:px-8 gap-2 w-full sm:w-auto h-12 sm:h-auto text-base sm:text-lg"
              >
                <BookmarkPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                开始收藏
              </Button>
            </Link>
          </motion.div>
        </div>


      </div>
    </div>
  );
}
