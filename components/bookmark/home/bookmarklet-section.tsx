"use client";

import { motion } from "framer-motion";
import { BookmarkIcon, Code2, ExternalLink, MousePointerClick, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function BookmarkletSection() {
  // 硬编码中文文本
  const bookmarkletTitle = "Bookmarklet 收藏工具";
  const bookmarkletSubtitle = "将此按钮拖动到您的浏览器书签栏，即可随时使用";
  const instructionsTitle = "使用方法：";
  const instructionsSteps = [
    "将按钮拖动到浏览器的书签栏",
    "浏览网页时，点击书签栏中的\"添加到 LSMarks\"",
    "在弹出的窗口中选择收藏集合并保存"
  ];
  const compatibility = "适用于所有主流浏览器";
  const oneClickTitle = "一键收藏，告别复制粘贴";
  const oneClickDescription = "无需复制网址、切换标签页或打开新窗口，只需点击书签栏中的按钮，即可将当前浏览的网页添加到您的 LSMarks 集合中。";
  const syncTitle = "跨设备同步，随处可用";
  const syncDescription = "所有通过 Bookmarklet 添加的书签都会自动同步到您的 LSMarks 账户，让您在任何设备上都能访问您的收藏。";

  // Bookmarklet JavaScript 代码
  const errorMsg = '请等待页面加载完成，或在普通网页中使用';

  const bookmarkletCode = `javascript:(function(){
    var d=document,
    z=d.createElement('script'),
    b=d.body,
    l=d.location;
    try{
      if(!b)throw(0);
      z.setAttribute('src','https://lsmark.669696.xyz/bookmarklet.js?'+(new Date().getTime()));
      b.appendChild(z);
    }catch(e){
      alert('${errorMsg}');
    }
  })();`;

  return (
    <section className="py-12 relative overflow-hidden">

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground">
              {bookmarkletTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {bookmarkletSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-card/65 backdrop-blur-sm border border-border/50 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookmarkIcon className="h-5 w-5 text-primary" />
                    <span>{bookmarkletTitle}</span>
                  </CardTitle>
                  <CardDescription>
                    {bookmarkletSubtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">{instructionsTitle}</p>
                    <ol className="list-decimal list-inside space-y-1">
                      {instructionsSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground border-t border-border/20 pt-4">
                  <div className="flex items-center gap-1">
                    <Code2 className="h-3.5 w-3.5" />
                    <span>{compatibility}</span>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="h-full"
            >
              <Card className="bg-card/65 backdrop-blur-sm border border-border/50 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5 text-primary" />
                    <span>{oneClickTitle}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base text-foreground/90">
                    {oneClickDescription}
                  </p>

                  <div className="pt-2">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-primary" />
                      <span>{syncTitle}</span>
                    </h3>
                    <p className="text-base text-foreground/90">
                      {syncDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
