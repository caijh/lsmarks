'use client';

/**
 * 图标URL拦截器
 * 用于在运行时拦截所有Google图标URL的请求，并将它们重定向到安全的图标服务
 */

// 注意：此文件不包含React组件，只包含工具函数

// 检查URL是否是Google图标URL
export function isGoogleIconUrl(url: string): boolean {
  if (!url) return false;

  return (
    url.includes('google.com/s2/favicons') ||
    url.includes('gstatic.com/faviconV2') ||
    url.includes('www.google.com/favicon')
  );
}

// 从Google图标URL中提取域名
export function extractDomainFromGoogleIconUrl(url: string): string | null {
  try {
    if (!isGoogleIconUrl(url)) return null;

    // 尝试从URL参数中提取域名
    const urlObj = new URL(url);

    // 处理Google的s2/favicons格式
    if (url.includes('google.com/s2/favicons')) {
      return urlObj.searchParams.get('domain');
    }

    // 处理gstatic的faviconV2格式
    if (url.includes('gstatic.com/faviconV2')) {
      // 从url参数中提取
      const urlParam = urlObj.searchParams.get('url');
      if (urlParam) {
        // 可能是完整URL或者只是域名
        try {
          return new URL(urlParam).hostname;
        } catch {
          // 如果不是有效URL，可能只是域名
          return urlParam;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting domain from Google icon URL:", error);
    return null;
  }
}

// 将Google图标URL转换为安全的图标URL
export function convertToSafeIconUrl(url: string, size: number = 64): string {
  if (!isGoogleIconUrl(url)) return url;

  const domain = extractDomainFromGoogleIconUrl(url);
  if (!domain) return url;

  // 使用toicons.pages.dev服务
  return `https://toicons.pages.dev/api/favicon?domain=${domain}&size=${size}`;
}

// 获取安全的图片URL
export function getSafeImageSrc(src: string | undefined): string {
  // 如果src是Google图标URL，转换为安全的URL
  return src ? (isGoogleIconUrl(src) ? convertToSafeIconUrl(src) : src) : '';
}

// 初始化图标拦截器，在全局范围内拦截所有图片请求
export function initIconInterceptor(): void {
  if (typeof window === 'undefined') return;

  // 创建一个MutationObserver来监视DOM变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // 检查新添加的节点
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 查找所有图片元素
          const images = (node as Element).querySelectorAll('img');
          images.forEach((img) => {
            const src = img.getAttribute('src');
            if (src && isGoogleIconUrl(src)) {
              // 替换为安全的URL
              img.setAttribute('src', convertToSafeIconUrl(src));
              // 添加crossOrigin属性
              img.setAttribute('crossOrigin', 'anonymous');
            }
          });
        }
      });
    });
  });

  // 开始观察整个文档
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // 立即处理当前页面上的所有图片
  setTimeout(() => {
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      const src = img.getAttribute('src');
      if (src && isGoogleIconUrl(src)) {
        // 替换为安全的URL
        img.setAttribute('src', convertToSafeIconUrl(src));
        // 添加crossOrigin属性
        img.setAttribute('crossOrigin', 'anonymous');
      }
    });
  }, 0);
}
