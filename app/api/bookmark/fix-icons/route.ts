import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, releaseSupabaseClient } from "@/models/db";
import { getCurrentUserUuid } from "@/services/bookmark/auth";

/**
 * 修复数据库中的图标URL，将Google的图标URL替换为toicons.pages.dev的URL
 */
export async function POST(request: NextRequest) {
  try {
    const currentUserUuid = await getCurrentUserUuid();

    if (!currentUserUuid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    try {
      // 查找用户的所有书签
      const { data: bookmarks, error: fetchError } = await supabase
        .from("bookmark_items")
        .select("uuid, url, icon_url")
        .eq("user_uuid", currentUserUuid);

      if (fetchError) {
        console.error("Error fetching bookmarks:", fetchError);
        return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
      }

      // 需要更新的书签
      const bookmarksToUpdate = bookmarks.filter(bookmark => 
        bookmark.icon_url && (
          bookmark.icon_url.includes('google.com/s2/favicons') ||
          bookmark.icon_url.includes('gstatic.com/faviconV2') ||
          bookmark.icon_url.includes('www.google.com')
        )
      );

      console.log(`Found ${bookmarksToUpdate.length} bookmarks with Google icon URLs`);

      // 更新每个书签的图标URL
      const updatePromises = bookmarksToUpdate.map(bookmark => {
        // 从URL中提取域名
        let domain = "";
        try {
          const url = new URL(bookmark.url);
          domain = url.hostname;
        } catch (e) {
          console.error(`Invalid URL for bookmark ${bookmark.uuid}:`, bookmark.url);
          return null;
        }

        // 使用toicons.pages.dev替换Google的图标URL
        const newIconUrl = `https://toicons.pages.dev/api/favicon?domain=${domain}&size=64`;

        return supabase
          .from("bookmark_items")
          .update({ icon_url: newIconUrl })
          .eq("uuid", bookmark.uuid);
      }).filter(Boolean); // 过滤掉null值

      // 执行所有更新
      const updateResults = await Promise.all(updatePromises);
      
      // 检查更新结果
      const errors = updateResults.filter(result => result.error);
      if (errors.length > 0) {
        console.error("Errors during icon URL updates:", errors);
        return NextResponse.json({ 
          message: "Some updates failed", 
          updated: bookmarksToUpdate.length - errors.length,
          failed: errors.length 
        }, { status: 207 });
      }

      return NextResponse.json({ 
        message: "Successfully updated all icon URLs", 
        updated: bookmarksToUpdate.length 
      });
    } finally {
      releaseSupabaseClient(supabase);
    }
  } catch (error) {
    console.error("Error fixing icon URLs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
