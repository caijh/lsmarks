"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useMobilePerformanceOptimization } from "@/hooks/use-mobile-performance";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobilePerformanceContextType {
  shouldReduceAnimations: boolean;
  shouldReduceImageQuality: boolean;
  shouldLimitConcurrentRequests: boolean;
  shouldUseReducedMotion: boolean;
  performanceMode: 'low' | 'normal';
  isMobile: boolean;
}

const MobilePerformanceContext = createContext<MobilePerformanceContextType | undefined>(undefined);

export function useMobilePerformance() {
  const context = useContext(MobilePerformanceContext);
  if (context === undefined) {
    throw new Error('useMobilePerformance must be used within a MobilePerformanceProvider');
  }
  return context;
}

interface MobilePerformanceProviderProps {
  children: ReactNode;
}

export function MobilePerformanceProvider({ children }: MobilePerformanceProviderProps) {
  const isMobile = useIsMobile();
  const performanceOptimization = useMobilePerformanceOptimization();

  // 应用性能优化设置到DOM
  useEffect(() => {
    const body = document.body;
    
    // 根据性能模式添加CSS类
    if (performanceOptimization.shouldUseReducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }

    // 设置CSS自定义属性用于条件样式
    document.documentElement.style.setProperty(
      '--performance-mode',
      performanceOptimization.performanceMode
    );

    document.documentElement.style.setProperty(
      '--reduce-animations',
      performanceOptimization.shouldReduceAnimations ? '1' : '0'
    );

    document.documentElement.style.setProperty(
      '--reduce-image-quality',
      performanceOptimization.shouldReduceImageQuality ? '1' : '0'
    );

  }, [performanceOptimization]);

  // 移动端视口设置
  useEffect(() => {
    if (isMobile) {
      // 设置视口元标签
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );

      // 添加移动端专用meta标签
      const metas = [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'msapplication-tap-highlight', content: 'no' }
      ];

      metas.forEach(({ name, content }) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });
    }
  }, [isMobile]);

  const contextValue: MobilePerformanceContextType = {
    shouldReduceAnimations: performanceOptimization.shouldReduceAnimations,
    shouldReduceImageQuality: performanceOptimization.shouldReduceImageQuality,
    shouldLimitConcurrentRequests: performanceOptimization.shouldLimitConcurrentRequests,
    shouldUseReducedMotion: performanceOptimization.shouldUseReducedMotion,
    performanceMode: performanceOptimization.performanceMode as 'low' | 'normal',
    isMobile
  };

  return (
    <MobilePerformanceContext.Provider value={contextValue}>
      {children}
    </MobilePerformanceContext.Provider>
  );
}
