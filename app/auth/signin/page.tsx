"use client";

import SignForm from "@/components/sign/form";
import { BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function SignInPage() {
  // 不再需要locale变量
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams ? searchParams.get("callbackUrl") || "/" : "/";
  const message = searchParams ? searchParams.get("message") : null;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查是否有错误消息
    if (message) {
      toast.error(message);
    }

    // 模拟加载完成
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-grid-pattern relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Logo和标题 */}
      <div className="mb-8 text-center relative">
        <div className="flex items-center justify-center mb-2 relative">
          <BookmarkCheck className="h-10 w-10 text-primary" />
          <div className="absolute w-16 h-16 bg-primary/10 rounded-full animate-pulse"></div>
        </div>
        <h1 className="text-2xl font-bold">雷水书签</h1>
        <p className="text-muted-foreground mt-1">登录您的账号</p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          25% { transform: translateY(-30px) translateX(15px) rotate(5deg); }
          50% { transform: translateY(5px) translateX(25px) rotate(0deg); }
          75% { transform: translateY(20px) translateX(-10px) rotate(-5deg); }
        }

        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(100, 100, 100, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(100, 100, 100, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      <div className="flex w-full max-w-sm flex-col gap-4 z-10">
        <SignForm callbackUrl={callbackUrl} />
      </div>

      {/* 页面底部装饰 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-muted-foreground/50">
        <div className="w-1 h-1 rounded-full bg-primary/30"></div>
        <span>雷水书签 © {new Date().getFullYear()}</span>
        <div className="w-1 h-1 rounded-full bg-primary/30"></div>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
}
