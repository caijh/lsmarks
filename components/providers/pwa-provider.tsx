"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // 检查更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 有新版本可用
                  toast.info('发现新版本', {
                    description: '点击刷新页面以获取最新功能',
                    action: {
                      label: '刷新',
                      onClick: () => window.location.reload()
                    },
                    duration: 10000
                  });
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });

      // 监听 SW 消息
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          toast.success('应用已更新', {
            description: '新功能已准备就绪'
          });
        }
      });
    }

    // PWA 安装提示
    let deferredPrompt: any;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      // 阻止默认的安装提示
      e.preventDefault();
      deferredPrompt = e;
      
      // 显示自定义安装提示
      toast.info('安装 LSMarks 应用', {
        description: '添加到主屏幕以获得更好的体验',
        action: {
          label: '安装',
          onClick: () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
                  toast.success('应用安装成功！');
                } else {
                  console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
              });
            }
          }
        },
        duration: 10000
      });
    });

    // 监听应用安装
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      toast.success('LSMarks 已安装到您的设备！');
      deferredPrompt = null;
    });

    // 检测是否在 PWA 模式下运行
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('Running in PWA mode');
      // 可以在这里添加 PWA 特定的功能
    }

    // 监听网络状态变化
    const handleOnline = () => {
      toast.success('网络已连接', {
        description: '您现在可以同步数据了'
      });
    };

    const handleOffline = () => {
      toast.warning('网络已断开', {
        description: '您仍可以浏览已缓存的内容'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return <>{children}</>;
}
