"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookmarkCheck, Mail, Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface SignFormProps extends React.ComponentPropsWithoutRef<"div"> {
  callbackUrl?: string;
}

export default function SignForm({
  className,
  callbackUrl = "/",
  ...props
}: SignFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  // 处理邮箱密码登录
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // 清除之前的错误
    setError("");

    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }

    try {
      setIsLoading(true);

      // 使用传入的回调URL或当前域名
      const finalCallbackUrl = callbackUrl || window.location.origin;
      console.log("Using callback URL:", finalCallbackUrl);
      console.log("Current origin:", window.location.origin);
      console.log("Current hostname:", window.location.hostname);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: finalCallbackUrl,
      });

      if (result?.error) {
        console.error("登录失败:", result.error);
        setError("登录失败，请检查邮箱和密码是否正确");
        toast.error("登录失败", {
          description: "请检查邮箱和密码是否正确"
        });
      } else if (result?.ok) {
        // 登录成功，显示提示
        toast.success("登录成功", {
          description: "正在跳转到首页..."
        });

        // 延迟一下再跳转，让用户看到成功提示
        setTimeout(() => {
          // 确保使用正确的URL进行重定向
          const redirectUrl = result.url || window.location.origin;
          console.log("Redirecting to:", redirectUrl);
          window.location.href = redirectUrl;
        }, 1000);
      }
    } catch (error) {
      console.error("登录失败:", error);
      setError("登录过程中出现错误，请稍后再试");
      toast.error("登录失败", {
        description: "登录过程中出现错误，请稍后再试"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 所有第三方登录处理函数已移除

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {/* 登录卡片 - 更紧凑的设计 */}
      <Card className="border-primary/10 shadow-md bg-card/90 w-full max-w-sm overflow-hidden">
        {/* 卡片顶部装饰 - 保留但简化 */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>

        <CardHeader className="text-center pb-1 pt-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20 shadow-sm">
            <BookmarkCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold">
            登录
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-3 px-6">
          {/* 账号密码登录表单 - 更紧凑 */}
          <div className="space-y-4">
            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
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

              {/* 错误提示 */}
              {error && (
                <div className="text-xs text-red-500 text-center">{error}</div>
              )}

              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "h-4 w-4 border rounded-sm flex items-center justify-center cursor-pointer transition-all duration-200",
                    rememberMe
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  )}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  {rememberMe && <div className="h-2 w-2 bg-primary rounded-sm" />}
                </div>
                <label
                  htmlFor="remember"
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200 text-xs"
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  记住我
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-10 mt-4 font-medium text-xs sm:text-sm relative overflow-hidden group"
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? "登录中..." : "登录"}
                  <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></div>
              </Button>
            </form>

            {/* 第三方登录分隔线 - 简化 */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/15"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground text-xs">
                  其他登录方式
                </span>
              </div>
            </div>

            {/* 第三方登录已全部移除 */}
          </div>
        </CardContent>
      </Card>

      {/* 注册提示 */}
      <div className="text-center text-xs mb-2">
        <span className="text-muted-foreground">还没有账号？</span>{" "}
        <a href="/auth/signup" className="text-primary font-medium hover:underline transition-all duration-200">
          立即注册
        </a>
      </div>

      {/* 底部版权信息 */}
      <div className="text-balance text-center text-xs text-muted-foreground/60 max-w-xs mx-auto">
        © {new Date().getFullYear()} 雷水书签
      </div>
    </div>
  );
}
