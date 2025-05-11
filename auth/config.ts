import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthConfig } from "next-auth";
import { Provider } from "next-auth/providers/index";
import { User } from "@/types/user";
import { getClientIp } from "@/lib/ip";
import { getIsoTimestr } from "@/lib/time";
import { getUuid } from "@/lib/hash";
import { saveUser } from "@/services/user";
import { findUserByEmail } from "@/models/user";
import { getSupabaseClient } from "@/models/db";
import { verifyPassword } from "@/lib/password";

let providers: Provider[] = [];

// 添加账号密码登录
providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "账号密码",
    credentials: {
      email: { label: "邮箱", type: "email" },
      password: { label: "密码", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        // 确保 credentials 存在且有 email 属性
        if (!credentials || typeof credentials.email !== 'string') {
          console.log("Invalid credentials:", credentials);
          return null;
        }

        // 查找用户
        const user = await findUserByEmail(credentials.email);
        if (!user) {
          console.log("User not found:", credentials.email);
          return null;
        }

        // 验证密码 - 这里需要实现密码验证逻辑
        // 目前暂时使用简单验证，后续需要添加密码哈希存储和验证
        const supabase = getSupabaseClient();
        const { data: cred, error: credError } = await supabase
          .from("user_credentials")
          .select("secret")
          .eq("user_uuid", user.uuid)
          .eq("credential_type", "password")
          .maybeSingle();

        if (credError) {
          console.error("Error fetching credentials:", credError);
        }

        // 确保 credentials.password 是字符串
        if (typeof credentials.password !== 'string') {
          console.log("Invalid password format");
          return null;
        }

        // 如果有密码凭证，验证密码
        if (cred && cred.secret) {
          // 使用 bcrypt 验证密码
          const isPasswordValid = await verifyPassword(credentials.password, cred.secret);
          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }
        } else {
          // 管理员功能已移除
          console.log("No password credentials found");
          return null;
        }

        return {
          id: user.uuid,
          name: user.nickname || user.username,
          email: user.email,
          image: user.avatar_url
        };
      } catch (error) {
        console.error("Error in authorize:", error);
        return null;
      }
    }
  })
);

// 所有第三方登录提供者已移除

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "google-one-tap");

export const authOptions: NextAuthConfig = {
  providers,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // 添加 cookies 配置以解决 CSRF 问题
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async signIn() {
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    async redirect({ url }) {
      // 从环境变量获取站点 URL，如果未设置则根据环境使用默认值
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://lsmark.669696.xyz");

      // 使用配置的 URL
      const baseUrl = siteUrl;

      // 处理认证回调 URL
      if (url.includes("/api/auth/callback/") || url.includes("/api/auth/signin/")) {
        return url;
      }

      // 处理相对路径
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // 处理绝对路径
      if (url.startsWith("http")) {
        try {
          // 检查是否同源
          const urlObj = new URL(url);
          const baseUrlObj = new URL(baseUrl);

          if (urlObj.origin === baseUrlObj.origin) {
            return url;
          }

          // 开发环境特殊处理
          if (process.env.NODE_ENV === "development" && url.includes("localhost")) {
            return url;
          }
        } catch (error) {
          // 出错时静默处理
        }
      }

      // 默认重定向到首页
      return baseUrl;
    },
    async session({ session, token }) {
      if (token) {
        // 将 token 中的用户信息复制到 session 中
        session.user.id = token.sub;
        session.user.uuid = token.sub;

        if (token.user) {
          session.user = {
            ...session.user,
            ...token.user
          };
        }

        // 确保 uuid 字段存在
        if (!session.user.uuid && session.user.id) {
          session.user.uuid = session.user.id;
        }

        // 确保 id 字段存在
        if (!session.user.id && session.user.uuid) {
          session.user.id = session.user.uuid;
        }

        // 确保 user_level 字段存在
        if (!session.user.user_level) {
          session.user.user_level = "1"; // 默认为初级用户
        }

        // 确保 username 字段存在
        if (!session.user.username && session.user.email) {
          const username = session.user.email.split('@')[0].toLowerCase()
            .replace(/[^a-z0-9_-]/g, '')
            .substring(0, 20);
          session.user.username = username || `user_${Math.random().toString(36).substring(2, 8)}`;
        }
      }

      return session;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      try {
        // 如果是初次登录，user 参数会包含用户信息
        if (user) {
          // 设置 token 的 sub 为用户 UUID
          token.sub = user.id;



          // 第三方登录已移除，只保留账号密码登录
        }
        return token;
      } catch (e) {
        console.error("jwt callback error:", e);
        return token;
      }
    },
  },
};
