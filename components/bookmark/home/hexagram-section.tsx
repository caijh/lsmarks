"use client";

import { motion } from "framer-motion";
import { Zap, Droplets } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HexagramSection() {
  // 硬编码中文文本
  const hexagramData = {
    title: "解 ䷧",
    subtitle: "第四十卦：雷水解",
    upper_trigram: {
      title: "震 ☳",
      description: "上卦：雷"
    },
    lower_trigram: {
      title: "坎 ☵",
      description: "下卦：水"
    },
    description: "象征解脱、解除险难。坎为雨，震为雷，雷雨兴起，万物当春，纷纷舒发生机，为解。",
    wisdom: {
      title: "解卦的智慧",
      shao_yong: {
        title: "北宋易学家邵雍解",
        text: "艰难化散，排难解纷；把握时机，趁早进行。",
        advice: "得此卦者，能解脱先前之困难，宜把握良机，求谋事业，出外谋事者更佳。"
      },
      duan_yi: {
        title: "《断易天机》解",
        text: "解卦震上坎下，为震宫二世卦。震为动，坎为险，遇险而动，为即将脱险走出困境之兆，因此多主吉。"
      }
    }
  };

  return (
    <section className="py-12 relative overflow-hidden">

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* 左侧：卦象图示 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-card/65 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-lg h-full">
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold mb-2 text-primary">{hexagramData.title}</div>
                  <div className="text-lg text-muted-foreground">{hexagramData.subtitle}</div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2 text-primary">{hexagramData.upper_trigram.title}</div>
                    <div className="text-sm text-muted-foreground mb-3">{hexagramData.upper_trigram.description}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2 text-primary">{hexagramData.lower_trigram.title}</div>
                    <div className="text-sm text-muted-foreground mb-3">{hexagramData.lower_trigram.description}</div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <div className="px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 mb-4 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">解卦</span>
                      <Droplets className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-center">
                      {hexagramData.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 右侧：解卦的智慧 */}
            <div className="h-full flex flex-col">
              {/* 标题居中 - 放在右边内容容器上面 */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-6"
              >
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground">
                  {hexagramData.wisdom.title}
                </h2>
              </motion.div>

              {/* 解卦内容 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-grow"
              >
                <Card className="bg-card/65 backdrop-blur-sm border border-border/50 shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="text-primary">{hexagramData.wisdom.shao_yong.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-base text-foreground/90">
                      {hexagramData.wisdom.shao_yong.text}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hexagramData.wisdom.shao_yong.advice}
                    </p>

                    <div className="pt-2">
                      <h3 className="text-lg font-semibold mb-2 text-primary">{hexagramData.wisdom.duan_yi.title}</h3>
                      <p className="text-base text-foreground/90">
                        {hexagramData.wisdom.duan_yi.text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
