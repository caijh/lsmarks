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
import { PWAProvider } from "@/components/providers/pwa-provider";
import { cn } from "@/lib/utils";
import { NavigationWrapper } from "@/components/bookmark/layout/navigation-wrapper";
import { auth } from "@/auth";

// 使用系统字体，避免加载外部字体可能导致的问题
const fontSans = {
  variable: "--font-sans"
};

export const metadata: Metadata = {
  title: "LSMarks - 智能书签管理系统",
  description: "使用 LSMarks 智能管理、分类和分享您的书签。创建公开或私有的网站收藏集合，构建个人知识库。",
  keywords: "LSMarks, 书签管理, 书签集合, 书签分享, 网络书签, 书签整理, 知识管理",
  manifest: "/manifest.json",
  themeColor: "#f59e0b",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LSMarks"
  },
  openGraph: {
    title: "LSMarks - 智能书签管理系统",
    description: "智能管理、分类和分享您的书签，构建个人知识库",
    url: "https://lsmark.669696.xyz",
    siteName: "LSMarks",
    type: "website",
    locale: "zh_CN"
  },
  twitter: {
    card: "summary_large_image",
    title: "LSMarks - 智能书签管理系统",
    description: "智能管理、分类和分享您的书签，构建个人知识库"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
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
                  <PWAProvider>
                    <CollectionProvider>
                      <EditModeProvider>
                        <NavigationWrapper user={session?.user}>
                          {children}
                        </NavigationWrapper>
                      </EditModeProvider>
                    </CollectionProvider>
                  </PWAProvider>
                </IconInterceptorProvider>
              </MobilePerformanceProvider>
            </ThemeProvider>
          </AppContextProvider>
        </DataProvider>
      </body>
    </html>
  );
}
