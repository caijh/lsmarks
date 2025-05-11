/**
 * 从URL生成图标URL
 * @param url 网站URL
 * @returns 图标URL
 */
export function generateIconUrl(url: string): string {
  try {
    // 确保URL有协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // 解析URL以获取域名
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // 使用 Google 的 favicon 服务
    // 注意：这里不使用 Next.js 的图片优化，直接返回原始 URL
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    // 如果 Google 服务不可用，可以考虑以下备选方案：

    // 备选方案1: 使用 DuckDuckGo 的图标服务
    // return `https://icons.duckduckgo.com/ip3/${domain}.ico`;

    // 备选方案2: 使用 Favicon Kit 服务
    // return `https://api.faviconkit.com/${domain}/64`;

    // 备选方案3: 直接使用网站的 favicon.ico
    // return `https://${domain}/favicon.ico`;
  } catch (error) {
    // 如果URL无效，返回默认图标
    console.error("Invalid URL, cannot generate icon URL:", error);
    return "/images/icon/loading-bookmark-icon.svg";
  }
}
