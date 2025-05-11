import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 缓存 Supabase 客户端实例
let supabaseClientInstance: SupabaseClient | null = null;

// 连接池大小
const POOL_SIZE = 10;

// 连接池
const connectionPool: SupabaseClient[] = [];

/**
 * 获取 Supabase 客户端实例
 * 使用连接池管理数据库连接，提高性能
 *
 * 注意：此函数只应在服务器端组件或API路由中使用
 */
export function getSupabaseClient() {
  // 确保只在服务器端运行
  if (typeof window !== 'undefined') {
    console.error('getSupabaseClient should only be used on the server side');
    // 返回一个空的客户端，避免应用崩溃
    return createClient('', '');
  }

  // 如果连接池为空，初始化连接池
  if (connectionPool.length === 0 && !supabaseClientInstance) {
    try {
      initConnectionPool();
    } catch (error) {
      console.error('Failed to initialize Supabase connection pool:', error);
      // 返回一个空的客户端，避免应用崩溃
      return createClient('', '');
    }
  }

  // 如果连接池有可用连接，从连接池获取
  if (connectionPool.length > 0) {
    return connectionPool.pop()!;
  }

  // 如果没有可用连接，返回共享实例
  return supabaseClientInstance || createClient('', '');
}

/**
 * 初始化连接池
 */
function initConnectionPool() {
  // 使用与客户端相同的URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  // 优先使用服务角色密钥，如果没有则使用匿名密钥
  let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseKey) {
    supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or key is not set");
    throw new Error("Supabase URL or key is not set");
  }

  try {
    // 创建共享实例
    supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // 创建连接池
    for (let i = 0; i < POOL_SIZE; i++) {
      connectionPool.push(
        createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
          },
        })
      );
    }
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    throw error;
  }
}

/**
 * 释放 Supabase 客户端实例
 * 将连接放回连接池，而不是关闭连接
 */
export function releaseSupabaseClient(client: SupabaseClient) {
  // 如果连接池未满，将连接放回连接池
  if (connectionPool.length < POOL_SIZE) {
    connectionPool.push(client);
  }
}
