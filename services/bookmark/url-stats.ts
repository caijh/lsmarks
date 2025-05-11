import { BookmarkUrlStats } from "@/types/bookmark/url-stats";

// 发现页面相关函数已移除

/**
 * 标准化URL
 * @param url 原始URL
 * @param domainOnly 是否只保留域名部分
 * @returns 标准化后的URL
 */
export function normalizeUrl(url: string, domainOnly: boolean = false): string {
  try {
    // 基本标准化：移除协议、www前缀、查询参数、锚点和尾部斜杠
    let normalized = url.replace(/^https?:\/\/(www\.)?/i, "");
    normalized = normalized.replace(/\?.*$/, "");
    normalized = normalized.replace(/#.*$/, "");
    normalized = normalized.replace(/\/$/, "");

    // 如果只需要域名部分，移除路径
    if (domainOnly) {
      normalized = normalized.split('/')[0];
    }

    // 转为小写
    normalized = normalized.toLowerCase();

    return normalized;
  } catch (error) {
    console.error("URL标准化失败:", error);
    return url.toLowerCase();
  }
}
