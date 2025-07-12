// LSMarks Service Worker
const CACHE_NAME = 'lsmarks-v1.0.0';
const STATIC_CACHE_NAME = 'lsmarks-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'lsmarks-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/images/icon/default-icon.svg'
];

// 需要缓存的API路径
const API_CACHE_PATTERNS = [
  /^\/api\/bookmark\/collections$/,
  /^\/api\/bookmark\/categories$/,
  /^\/api\/bookmark\/items$/
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('lsmarks-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activated');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }

  // 静态资源 - 缓存优先策略
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/images/')) {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
        .catch(() => {
          // 离线时返回默认图标
          if (url.pathname.includes('/images/icon/')) {
            return caches.match('/images/icon/default-icon.svg');
          }
        })
    );
    return;
  }

  // API请求 - 网络优先策略
  if (url.pathname.startsWith('/api/')) {
    const shouldCache = API_CACHE_PATTERNS.some(pattern => 
      pattern.test(url.pathname)
    );

    if (shouldCache && request.method === 'GET') {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request);
          })
      );
    }
    return;
  }

  // 页面请求 - 网络优先，缓存备用
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // 返回离线页面
              return caches.match('/');
            });
        })
    );
  }
});

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 这里可以添加后台同步逻辑
      Promise.resolve()
    );
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'LSMarks 有新的更新',
    icon: '/images/icon/icon-192.png',
    badge: '/images/icon/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看',
        icon: '/images/icon/action-explore.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/images/icon/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('LSMarks', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 错误处理
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
});
