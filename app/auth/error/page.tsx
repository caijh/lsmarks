"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

// 错误类型映射
const errorMessages: Record<string, { title: { zh: string, en: string }, description: { zh: string, en: string } }> = {
  "Configuration": {
    title: {
      zh: "配置错误",
      en: "Configuration Error"
    },
    description: {
      zh: "服务器配置出现问题。这可能是由于 OAuth 提供商配置不正确或环境变量设置错误导致的。",
      en: "There is a problem with the server configuration. This might be due to incorrect OAuth provider configuration or environment variable settings."
    }
  },
  "AccessDenied": {
    title: {
      zh: "访问被拒绝",
      en: "Access Denied"
    },
    description: {
      zh: "您没有访问此资源的权限。这可能是因为您的账户没有足够的权限或者您拒绝了授权请求。",
      en: "You do not have permission to access this resource. This might be because your account does not have sufficient permissions or you denied the authorization request."
    }
  },
  "Verification": {
    title: {
      zh: "验证错误",
      en: "Verification Error"
    },
    description: {
      zh: "验证链接无效或已过期。请尝试重新登录或联系管理员获取帮助。",
      en: "The verification link is invalid or has expired. Please try signing in again or contact an administrator for help."
    }
  },
  "Default": {
    title: {
      zh: "登录错误",
      en: "Sign In Error"
    },
    description: {
      zh: "登录过程中发生错误。请稍后再试或尝试其他登录方式。",
      en: "An error occurred during the sign in process. Please try again later or try a different sign in method."
    }
  }
};

export default function AuthErrorPage() {
  // 硬编码为中文
  const locale = 'zh';
  const searchParams = useSearchParams();
  const [errorType, setErrorType] = useState<string>("Default");
  const [errorDetails, setErrorDetails] = useState<string>("");

  useEffect(() => {
    if (searchParams) {
      // 从 URL 获取错误类型
      const error = searchParams.get("error");
      if (error) {
        setErrorType(error);
      }

      // 尝试获取更多错误详情
      const errorDescription = searchParams.get("error_description");
      if (errorDescription) {
        setErrorDetails(errorDescription);
      }
    }
  }, [searchParams]);

  // 获取错误消息
  const errorMessage = errorMessages[errorType] || errorMessages["Default"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <Card className="w-full max-w-md border-destructive/20 shadow-lg">
        <CardHeader className="space-y-1 border-b pb-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>{errorMessage.title[locale]}</CardTitle>
          </div>
          <CardDescription>
            {errorMessage.description[locale]}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {errorDetails && (
            <div className="bg-muted p-3 rounded-md text-xs font-mono mb-4 overflow-x-auto">
              {errorDetails}
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-2">
            您可以尝试以下操作：
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>检查您的网络连接</li>
            <li>清除浏览器缓存和Cookie</li>
            <li>使用其他登录方式</li>
            <li>稍后再试</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <Button size="sm" onClick={() => window.location.href = "/"}>
            <Home className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
