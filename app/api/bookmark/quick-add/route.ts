import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserUuid } from "@/services/bookmark/auth";
import { quickAddBookmark } from "@/services/bookmark/quick-add";

// POST /api/bookmark/quick-add
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户UUID
    const currentUserUuid = await getCurrentUserUuid();
    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 解析请求数据
    const formData = await request.json();

    // 验证必填字段
    if (!formData.title || !formData.url || !formData.collection_uuid) {
      return NextResponse.json({ error: "Title, URL, and collection_uuid are required" }, { status: 400 });
    }

    // 使用优化后的批处理函数
    console.time('quickAddBookmark'); // 添加性能计时
    const result = await quickAddBookmark(formData, currentUserUuid);
    console.timeEnd('quickAddBookmark'); // 输出执行时间

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 返回创建的书签
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/bookmark/quick-add:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
