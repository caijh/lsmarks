import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/models/db";
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from "@/lib/password";
import { getIsoTimestr } from "@/lib/time";

export async function POST(request: Request) {
  try {
    // 获取请求数据
    const { name, email, password } = await request.json();

    console.log("注册请求:", { name, email, passwordLength: password?.length });

    // 验证必填字段
    if (!name || !email || !password) {
      console.log("缺少必填字段");
      return NextResponse.json({
        success: false,
        error: "请填写所有必填字段"
      }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("邮箱格式不正确:", email);
      return NextResponse.json({
        success: false,
        error: "邮箱格式不正确"
      }, { status: 400 });
    }

    // 验证密码强度
    if (password.length < 6) {
      console.log("密码长度不足");
      return NextResponse.json({
        success: false,
        error: "密码长度不能少于6个字符"
      }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    console.log("Supabase 客户端已创建");

    // 注册限制检查已移除

    // 检查邮箱是否已存在
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("uuid")
        .eq("email", email)
        .eq("signin_provider", "credentials")
        .maybeSingle();

      if (checkError) {
        console.error("检查用户时出错:", checkError);
        return NextResponse.json({
          success: false,
          error: "检查用户时出错",
          details: checkError.message
        }, { status: 500 });
      }

      if (existingUser) {
        console.log("邮箱已被注册:", email);
        return NextResponse.json({
          success: false,
          error: "该邮箱已被注册"
        }, { status: 409 });
      }

      console.log("邮箱检查通过，可以注册");
    } catch (checkError) {
      console.error("检查用户时发生异常:", checkError);
      return NextResponse.json({
        success: false,
        error: "检查用户时发生异常",
        details: checkError instanceof Error ? checkError.message : String(checkError)
      }, { status: 500 });
    }

    // 生成用户UUID
    const userUuid = uuidv4();
    console.log("生成用户UUID:", userUuid);

    // 生成用户名（基于昵称）
    const username = name.toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .substring(0, 30) || 'user_' + Math.random().toString(36).substring(2, 10);
    console.log("生成用户名:", username);

    // 获取当前时间
    const currentTime = getIsoTimestr();

    // 尝试对密码进行哈希处理
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
      console.log("密码哈希成功");
    } catch (hashError) {
      console.error("密码哈希失败:", hashError);
      return NextResponse.json({
        success: false,
        error: "密码处理失败",
        details: hashError instanceof Error ? hashError.message : String(hashError)
      }, { status: 500 });
    }

    // 创建用户记录
    try {
      const { error: createUserError } = await supabase
        .from("users")
        .insert({
          uuid: userUuid,
          email: email,
          nickname: name,
          username: username,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
          created_at: currentTime,
          updated_at: currentTime,
          signin_type: "email",
          signin_provider: "credentials",
          signin_ip: "127.0.0.1", // 使用默认IP，避免服务器端函数问题
          user_level: "free"
        });

      if (createUserError) {
        console.error("创建用户时出错:", createUserError);
        return NextResponse.json({
          success: false,
          error: "创建用户失败",
          details: createUserError.message
        }, { status: 500 });
      }

      console.log("用户记录创建成功");
    } catch (createUserError) {
      console.error("创建用户时发生异常:", createUserError);
      return NextResponse.json({
        success: false,
        error: "创建用户时发生异常",
        details: createUserError instanceof Error ? createUserError.message : String(createUserError)
      }, { status: 500 });
    }

    // 创建用户凭证记录
    try {
      const { error: createCredError } = await supabase
        .from("user_credentials")
        .insert({
          user_uuid: userUuid,
          credential_type: "password",
          identifier: email,
          secret: hashedPassword,
          created_at: currentTime,
          updated_at: currentTime
        });

      if (createCredError) {
        console.error("创建用户凭证时出错:", createCredError);
        // 如果凭证创建失败，删除已创建的用户
        await supabase
          .from("users")
          .delete()
          .eq("uuid", userUuid);

        return NextResponse.json({
          success: false,
          error: "创建用户凭证失败",
          details: createCredError.message
        }, { status: 500 });
      }

      console.log("用户凭证创建成功");
    } catch (createCredError) {
      console.error("创建用户凭证时发生异常:", createCredError);
      // 如果凭证创建失败，删除已创建的用户
      try {
        await supabase
          .from("users")
          .delete()
          .eq("uuid", userUuid);
      } catch (deleteError) {
        console.error("删除用户失败:", deleteError);
      }

      return NextResponse.json({
        success: false,
        error: "创建用户凭证时发生异常",
        details: createCredError instanceof Error ? createCredError.message : String(createCredError)
      }, { status: 500 });
    }

    // 注册成功
    console.log("注册成功:", { email, username });
    return NextResponse.json({
      success: true,
      message: "注册成功，请登录"
    });

  } catch (error) {
    console.error("注册过程中出现错误:", error);
    return NextResponse.json({
      success: false,
      error: "注册过程中出现错误",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
