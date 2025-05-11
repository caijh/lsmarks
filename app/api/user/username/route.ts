import { NextRequest, NextResponse } from "next/server";
import { auth, signOut } from "@/auth";
import { updateUserUsername } from "@/models/user";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
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

    // 获取请求体中的用户名
    const { username } = await request.json();

    // 验证用户名
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { message: "用户名不能为空" },
        { status: 400 }
      );
    }

    // 用户名格式验证
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { message: "用户名只能包含小写字母、数字、下划线和连字符，长度为3-20个字符" },
        { status: 400 }
      );
    }

    try {
      // 更新用户名
      await updateUserUsername(session.user.uuid, username);

      // 更新会话中的用户名
      if (session.user) {
        session.user.username = username;
      }

      // 在响应中添加清除会话cookie的标志，让前端处理
      // 注意：服务器端无法直接操作客户端的cookie，所以我们通过响应告诉前端需要刷新

      // 如果没有抛出错误，则更新成功
    } catch (error) {
      console.error("Error updating username:", error);
      return NextResponse.json(
        { message: "修改用户名失败" },
        { status: 400 }
      );
    }

    // 返回成功响应
    return NextResponse.json(
      {
        message: "用户名修改成功",
        username,
        needsRefresh: true // 添加标志，告诉前端需要刷新页面
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { message: "服务器错误，请稍后再试" },
      { status: 500 }
    );
  }
}
