import "./globals.css";

import { AppContextProvider } from "@/contexts/app";
import localFont from "next/font/local";
import { Metadata } from "next";

import { ThemeProvider } from "@/contexts/theme-context";
import { DataProvider } from "@/providers/data-provider";
import { CollectionProvider } from "@/contexts/collection-context";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { IconInterceptorProvider } from "@/components/providers/icon-interceptor-provider";
import { MobilePerformanceProvider } from "@/components/providers/mobile-performance-provider";
import { cn } from "@/lib/utils";
import { NavigationWrapper } from "@/components/bookmark/layout/navigation-wrapper";
import { auth } from "@/auth";

// 使用系统字体，避免加载外部字体可能导致的问题
const fontSans = {
  variable: "--font-sans"
};

export const metadata: Metadata = {
  title: "雷水书签 - 组织和分享您的书签",
  description: "使用雷水书签组织、分类和分享您的书签。创建公开或私有的网站收藏集合，灵感源自《周易》解卦。",
  keywords: "雷水书签, 书签集合, 书签管理, 书签分享, 网络书签, 书签整理, 周易",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 获取当前用户会话
  const session = await auth();

  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden touch-optimized mobile-scroll safe-area-inset",
          fontSans.variable
        )}
      >
        <DataProvider>
          <AppContextProvider>
            <ThemeProvider>
              <MobilePerformanceProvider>
                <IconInterceptorProvider>
                  <CollectionProvider>
                    <EditModeProvider>
                      <NavigationWrapper user={session?.user}>
                        {children}
                      </NavigationWrapper>
                    </EditModeProvider>
                  </CollectionProvider>
                </IconInterceptorProvider>
              </MobilePerformanceProvider>
            </ThemeProvider>
          </AppContextProvider>
        </DataProvider>
      </body>
    </html>
  );
}
