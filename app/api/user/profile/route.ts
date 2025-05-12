import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { findUserByUuid } from "@/models/user";

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await auth();

    // 如果用户未登录，返回401错误
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "未授权，请先登录" },
        { status: 401 }
      );
    }

    // 获取用户UUID
    const userUuid = session.user.uuid || session.user.id;
    
    if (!userUuid) {
      return NextResponse.json(
        { message: "无效的用户会话" },
        { status: 400 }
      );
    }

    // 从数据库获取最新的用户信息
    const user = await findUserByUuid(userUuid);
    
    if (!user) {
      return NextResponse.json(
        { message: "用户不存在" },
        { status: 404 }
      );
    }

    // 返回用户信息
    return NextResponse.json({
      uuid: user.uuid,
      email: user.email,
      nickname: user.nickname,
      username: user.username,
      avatar_url: user.avatar_url,
      user_level: user.user_level,
      created_at: user.created_at
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "服务器错误，请稍后再试" },
      { status: 500 }
    );
  }
}
