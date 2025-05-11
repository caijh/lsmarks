import NextAuth from "next-auth";
import { authOptions } from "./config";

// 确保使用正确的环境变量
const nextAuthConfig = {
  ...authOptions,
  secret: process.env.NEXTAUTH_SECRET,
  // 使用NEXT_PUBLIC_SITE_URL作为NextAuth URL，开发环境使用localhost
  url: process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined),
  trustHost: true,
  debug: false, // 禁用调试日志
};

export const { handlers, signIn, signOut, auth } = NextAuth(nextAuthConfig);
