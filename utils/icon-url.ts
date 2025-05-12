/**
 * 从URL生成图标URL
 * @param url 网站URL
 * @param size 图标尺寸
 * @returns 图标URL
 */
export function generateIconUrl(url: string, size: number = 64): string {
  try {
    // 确保URL有协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // 解析URL以获取域名
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // 使用 toicons.pages.dev 服务获取图标
    // 这个服务在国内访问速度更快，并且提供了多种尺寸和格式的图标
    // 使用正确的链接格式，并添加大小参数
    return `https://toicons.pages.dev/api/favicon?domain=${domain}&size=${size}`;

    // 以下是备选方案，如果上面的服务不可用，可以取消注释使用：

    // 备选方案1: 使用 DuckDuckGo 的图标服务
    // return `https://icons.duckduckgo.com/ip3/${domain}.ico`;

    // 备选方案2: 使用 Google 的 favicon 服务
    // return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    // 备选方案3: 直接使用网站的 favicon.ico
    // return `https://${domain}/favicon.ico`;
  } catch (error) {
    // 如果URL无效，返回默认图标
    console.error("Invalid URL, cannot generate icon URL:", error);
    return "/images/icon/loading-bookmark-icon.svg";
  }
}

/**
 * 从URL生成多个备选图标URL
 * @param url 网站URL
 * @param size 图标尺寸
 * @returns 图标URL数组
 */
export function generateFallbackIconUrls(url: string, size: number = 64): string[] {
  try {
    // 确保URL有协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // 解析URL以获取域名
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // 返回多个备选图标URL，优先使用 toicons.pages.dev 服务
    return [
      // 首选 toicons.pages.dev 服务，标准模式
      `https://toicons.pages.dev/api/favicon?domain=${domain}&size=${size}`,

      // 备选 favicon.im 服务
      `https://favicon.im/${domain}?larger=true`,

      // 备选 Google 的 FaviconV2 服务
      `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${domain}&size=${size}`,

      // 备选 toicons.pages.dev 服务，使用Google源
      `https://toicons.pages.dev/api/favicon?domain=${domain}&google&size=${size}`,

      // 备选 toicons.pages.dev 服务，使用favicon源
      `https://toicons.pages.dev/api/favicon?domain=${domain}&favicon&size=${size}`,

      // 备选 toicons.pages.dev 服务，直接从网站获取
      `https://toicons.pages.dev/api/favicon?domain=${domain}&true&size=${size}`,

      // 直接使用网站的 favicon.ico
      `https://${domain}/favicon.ico`,

      // 默认图标
      "/images/icon/loading-bookmark-icon.svg"
    ];
  } catch (error) {
    // 如果URL无效，返回默认图标
    console.error("Invalid URL, cannot generate fallback icon URLs:", error);
    return ["/images/icon/loading-bookmark-icon.svg"];
  }
}
