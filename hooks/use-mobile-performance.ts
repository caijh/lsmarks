"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useIsMobile } from "./use-mobile";

// 移动端图片懒加载优化
export function useMobileLazyLoading() {
  const isMobile = useIsMobile();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        // 移动端提前加载距离更小，节省流量
        rootMargin: isMobile ? '50px' : '100px',
        threshold: 0.1
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [isMobile]);

  return { ref, isIntersecting };
}

// 移动端虚拟滚动优化
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  const isMobile = useIsMobile();

  // 移动端减少overscan数量以节省内存
  const actualOverscan = isMobile ? Math.max(1, overscan - 2) : overscan;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - actualOverscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + actualOverscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll
  };
}

// 移动端防抖优化
export function useMobileDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const isMobile = useIsMobile();
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // 移动端使用更长的防抖延迟
  const actualDelay = isMobile ? delay + 100 : delay;

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, actualDelay);
    },
    [callback, actualDelay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// 移动端节流优化
export function useMobileThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const isMobile = useIsMobile();
  const lastCallRef = useRef<number>(0);
  
  // 移动端使用更长的节流延迟
  const actualDelay = isMobile ? delay + 50 : delay;

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallRef.current >= actualDelay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, actualDelay]
  ) as T;

  return throttledCallback;
}

// 移动端内存监控
export function useMobileMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  }>({});

  useEffect(() => {
    // @ts-ignore
    if (!performance.memory) return;

    const updateMemoryInfo = () => {
      // @ts-ignore
      const memory = performance.memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      });
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  const memoryUsagePercent = memoryInfo.usedJSHeapSize && memoryInfo.jsHeapSizeLimit
    ? (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
    : 0;

  return {
    memoryInfo,
    memoryUsagePercent,
    isHighMemoryUsage: memoryUsagePercent > 80
  };
}

// 移动端网络状态监控
export function useMobileNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      // @ts-ignore
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      setNetworkStatus({
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0
      });
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  const isSlowConnection = networkStatus.effectiveType === 'slow-2g' || 
                          networkStatus.effectiveType === '2g' ||
                          networkStatus.downlink < 1;

  return {
    ...networkStatus,
    isSlowConnection
  };
}

// 移动端电池状态监控
export function useMobileBatteryStatus() {
  const [batteryStatus, setBatteryStatus] = useState({
    charging: true,
    level: 1,
    chargingTime: 0,
    dischargingTime: Infinity
  });

  useEffect(() => {
    // @ts-ignore
    if (!navigator.getBattery) return;

    // @ts-ignore
    navigator.getBattery().then((battery) => {
      const updateBatteryStatus = () => {
        setBatteryStatus({
          charging: battery.charging,
          level: battery.level,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        });
      };

      updateBatteryStatus();

      battery.addEventListener('chargingchange', updateBatteryStatus);
      battery.addEventListener('levelchange', updateBatteryStatus);
      battery.addEventListener('chargingtimechange', updateBatteryStatus);
      battery.addEventListener('dischargingtimechange', updateBatteryStatus);

      return () => {
        battery.removeEventListener('chargingchange', updateBatteryStatus);
        battery.removeEventListener('levelchange', updateBatteryStatus);
        battery.removeEventListener('chargingtimechange', updateBatteryStatus);
        battery.removeEventListener('dischargingtimechange', updateBatteryStatus);
      };
    });
  }, []);

  const isLowBattery = batteryStatus.level < 0.2 && !batteryStatus.charging;

  return {
    ...batteryStatus,
    isLowBattery
  };
}

// 移动端性能优化建议
export function useMobilePerformanceOptimization() {
  const isMobile = useIsMobile();
  const { isHighMemoryUsage } = useMobileMemoryMonitor();
  const { isSlowConnection } = useMobileNetworkStatus();
  const { isLowBattery } = useMobileBatteryStatus();

  const shouldReduceAnimations = isMobile && (isHighMemoryUsage || isLowBattery);
  const shouldReduceImageQuality = isMobile && (isSlowConnection || isHighMemoryUsage);
  const shouldLimitConcurrentRequests = isMobile && isSlowConnection;
  const shouldUseReducedMotion = shouldReduceAnimations || 
    (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  return {
    shouldReduceAnimations,
    shouldReduceImageQuality,
    shouldLimitConcurrentRequests,
    shouldUseReducedMotion,
    performanceMode: isHighMemoryUsage || isLowBattery || isSlowConnection ? 'low' : 'normal'
  };
}
