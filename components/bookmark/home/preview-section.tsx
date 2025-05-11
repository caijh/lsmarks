"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Folder, Tag, Bookmark, Globe, Code, Video, Play, HelpCircle, MessageCircle } from "lucide-react";

export function PreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block bg-secondary/10 px-4 py-2 rounded-full text-secondary font-medium mb-4"
          >
            直观体验
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            简洁直观的界面设计
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            雷水书签提供清晰的分类结构和直观的操作界面，让您轻松管理海量书签
          </motion.p>
        </div>

        <motion.div
          style={{ y, opacity }}
          className="mt-8 w-full max-w-6xl mx-auto relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-16 bottom-0 top-auto"></div>
          <div className="rounded-xl border-2 shadow-2xl overflow-hidden">
            <div className="aspect-[16/9] relative bg-card">
              <div className="absolute inset-0 p-5">
                <div className="h-full flex flex-col rounded-lg border bg-background shadow">
                  {/* 模拟导航栏 */}
                  <div className="border-b p-4 flex items-center justify-between bg-card/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                        解
                      </div>
                      <span className="font-medium text-lg">雷水书签</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="h-5 w-5 text-primary/70">用</div>
                      </div>
                    </div>
                  </div>

                  {/* 模拟内容区域 */}
                  <div className="flex-1 p-5 flex flex-col gap-5">
                    {/* 模拟大分类 */}
                    <div className="flex justify-center gap-3 overflow-x-auto pb-3 bg-muted/50 p-3 rounded-lg">
                      {["科技资讯", "学习资源", "工具软件", "娱乐休闲"].map((name, i) => (
                        <div key={i} className={`px-4 py-2 rounded-md flex items-center gap-2 text-base font-medium ${i === 0 ? 'bg-background text-primary shadow-sm' : ''}`}>
                          <Folder className="h-4 w-4" />
                          <span>{name}</span>
                        </div>
                      ))}
                    </div>

                    {/* 模拟内容布局 */}
                    <div className="flex-1 grid grid-cols-4 gap-5 mt-5">
                      {/* 左侧子分类 */}
                      <div className="col-span-1 border rounded-xl p-4 bg-card/50 shadow-sm">
                        <h3 className="font-medium mb-4 flex items-center gap-2 text-base">
                          <Tag className="h-4 w-4 text-primary" />
                          子分类
                        </h3>
                        <ul className="space-y-2">
                          {["新闻媒体", "科技博客", "产品评测", "数码前沿"].map((name, i) => (
                            <li key={i} className={`flex items-center gap-2 p-2 rounded-md text-sm ${i === 0 ? 'bg-accent hover:bg-accent' : 'hover:bg-accent/50'} cursor-pointer transition-colors`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/70"></div>
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 右侧书签 */}
                      <div className="col-span-3 border rounded-xl p-4 bg-card/50 shadow-sm">
                        <h3 className="font-medium mb-4 flex items-center gap-2 text-base">
                          <Bookmark className="h-4 w-4 text-primary" />
                          书签
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { title: "Google", url: "google.com", icon: Globe },
                            { title: "GitHub", url: "github.com", icon: Code },
                            { title: "YouTube", url: "youtube.com", icon: Video },
                            { title: "Bilibili", url: "bilibili.com", icon: Play },
                            { title: "知乎", url: "zhihu.com", icon: HelpCircle },
                            { title: "微博", url: "weibo.com", icon: MessageCircle }
                          ].map((item, i) => (
                            <div key={i} className="border hover:border-primary/30 rounded-lg overflow-hidden transition-colors shadow-sm">
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-10 h-10 relative bg-background rounded-md p-1.5 border flex items-center justify-center">
                                    <item.icon className="h-5 w-5 text-primary/70" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate text-sm">{item.title}</h4>
                                    <div className="flex items-center gap-1 mt-1.5">
                                      <span className="text-xs text-muted-foreground truncate">
                                        {item.url}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
