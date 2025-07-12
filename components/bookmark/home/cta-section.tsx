"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, BookOpen, Sparkles, BookmarkPlus } from "lucide-react";
import Link from "next/link";

export function CtaSection() {

  return (
    <section className="py-12 relative overflow-hidden">



      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block bg-primary/10 px-4 py-2 rounded-full text-primary font-medium"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>开始使用</span>
              <BookmarkPlus className="h-4 w-4" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
          >
            立即开始使用 LSMarks
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground"
          >
            注册并开始组织您的网络世界，体验智能书签管理带来的高效数字生活
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-6 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth/signin">
              <Button size="lg" className="gap-2 text-lg px-8 rounded-full shadow-md hover:shadow-lg transition-all">
                <Heart className="h-5 w-5" />
                立即开始
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
