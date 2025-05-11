'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// 创建一个服务器端的Supabase客户端
export const createServerClient = () => {
  const cookieStore = cookies()

  // 使用与客户端相同的环境变量，避免重复设置
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or key is not set in server client')
    // 返回一个空的客户端，避免应用崩溃
    return createClient('', '')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  })
}
