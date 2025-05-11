"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookmarkCheck, Mail, Lock, User, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
// 国际化已移除
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  // 国际化相关代码已移除
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  // 注册状态相关状态已移除

  // 注册状态检查已移除

  // 处理注册
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // 清除之前的错误
    setError("");

    // 验证表单
    if (!name || !email || !password || !confirmPassword) {
      setError("请填写所有必填字段");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    // 验证密码强度
    if (password.length < 6) {
      setError("密码长度不能少于6个字符");
      return;
    }

    try {
      setIsLoading(true);

      // 调用注册API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      // 显示注册成功提示
      toast.success("注册成功", {
        description: "正在跳转到登录页面..."
      });

      // 延迟一下再跳转，让用户看到成功提示
      setTimeout(() => {
        // 注册成功，重定向到登录页面
        const message = data.message || '注册成功，请登录';
        router.push(`/auth/signin?message=${encodeURIComponent(message)}`);
      }, 1500);

    } catch (error) {
      console.error("注册失败:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "注册失败，请稍后再试";
      setError(errorMessage);
      toast.error("注册失败", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 第三方登录处理函数已移除

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {/* 注册卡片 - 更紧凑的设计 */}
      <Card className="border-primary/10 shadow-md bg-card/90 w-full max-w-sm overflow-hidden">
        {/* 卡片顶部装饰 - 保留但简化 */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>

        <CardHeader className="text-center pb-1 pt-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-sm">
            <BookmarkCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold">
            注册
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-3 px-6">
          {/* 注册表单 - 更紧凑 */}
          <div className="space-y-4">
            {/* 注册表单 */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-foreground/80">昵称</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="请输入昵称"
                    className="pl-9 h-9 text-xs sm:text-sm bg-background/50 border-muted-foreground/20 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-foreground/80">邮箱</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱"
                    className="pl-9 h-9 text-xs sm:text-sm bg-background/50 border-muted-foreground/20 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-foreground/80">密码</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    className="pl-9 h-9 text-xs sm:text-sm bg-background/50 border-muted-foreground/20 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-foreground/80">确认密码</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    className="pl-9 h-9 text-xs sm:text-sm bg-background/50 border-muted-foreground/20 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="text-xs text-red-500 text-center">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full h-10 mt-4 font-medium text-xs sm:text-sm relative overflow-hidden group"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? "注册中..." : "注册"}
                  <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></div>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* 登录提示 */}
      <div className="text-center text-xs mb-2">
        <span className="text-muted-foreground">已有账号？</span>{" "}
        <a href="/auth/signin" className="text-primary font-medium hover:underline transition-all duration-200">
          立即登录
        </a>
      </div>

      {/* 底部版权信息 */}
      <div className="text-balance text-center text-xs text-muted-foreground/60 max-w-xs mx-auto">
        © {new Date().getFullYear()} 雷水书签
      </div>
    </div>
  );
}
