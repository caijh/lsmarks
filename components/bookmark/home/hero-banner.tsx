"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Droplets, BookmarkPlus } from "@/components/ui/icons";
import { motion } from "framer-motion";

export function HeroBanner() {
  // 硬编码中文翻译
  const t = (key: string) => {
    // 为常用键提供默认值
    if (key === "home.hero.title") return "雷水解卦 · 书签整理";
    if (key === "home.hero.subtitle") return "组织、分类和分享您的网络书签";
    if (key === "home.hero.description") return "雷水书签帮助您整理网络资源，创建个性化的书签集合，并轻松分享给他人。灵感源自《周易》解卦，象征解脱和新生。";
    if (key === "home.hero.cta_primary") return "开始使用";
    if (key === "home.hero.cta_secondary") return "了解更多";
    if (key === "bookmark.header.site_name") return "雷水书签";
    return key;
  };

  return (
    <div className="relative overflow-hidden py-16 md:py-20">

      {/* 雷电效果 */}
      <motion.div
        className="absolute top-10 right-[20%] w-px h-20 bg-blue-400/70"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 7 }}
      />
      <motion.div
        className="absolute top-10 right-[20%] w-px h-40 bg-blue-400/40 rotate-12 origin-top"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
        transition={{ duration: 0.5, delay: 0.1, repeat: Infinity, repeatDelay: 7 }}
      />

      {/* 水滴效果 */}
      <motion.div
        className="absolute bottom-20 left-[30%] w-2 h-2 rounded-full bg-blue-400/70"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 20, opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
      />
      <motion.div
        className="absolute bottom-10 left-[35%] w-1.5 h-1.5 rounded-full bg-blue-400/50"
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 15, opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, delay: 0.5, repeat: Infinity, repeatDelay: 4 }}
      />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">雷水解卦</span>
              <Droplets className="h-4 w-4" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
          >
            {t("bookmark.header.site_name")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8"
          >
            解卦：象征解脱、解除险难。坎为雨，震为雷，雷雨兴起，万物当春，纷纷舒发生机，为解。
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-foreground/80 mb-10 max-w-2xl mx-auto"
          >
            如同雷雨化解严冬，雷水书签帮您解除数字混乱，
            <br className="hidden md:inline" />
            整理知识，开启高效有序的网络生活。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth/signin">
              <Button size="lg" className="rounded-full px-8 gap-2">
                <BookmarkPlus className="h-5 w-5" />
                开始收藏
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* 解卦图示 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 max-w-md mx-auto bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2 text-primary">震 ☳</div>
              <div className="text-sm text-muted-foreground">上卦：雷</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2 text-primary">坎 ☵</div>
              <div className="text-sm text-muted-foreground">下卦：水</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="text-3xl font-bold mb-2">解 ䷧</div>
            <div className="text-sm text-muted-foreground">第四十卦：解卦</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
