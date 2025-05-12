'use client';

import React from 'react';
import { getSafeImageSrc } from '@/utils/icon-interceptor';

/**
 * 安全的图片组件
 * 自动将Google图标URL转换为安全的图标URL
 */
export function SafeImage(props: React.ImgHTMLAttributes<HTMLImageElement>): React.ReactElement {
  const { src, ...otherProps } = props;
  
  // 获取安全的图片URL
  const safeSrc = getSafeImageSrc(src);
  
  // 返回带有安全src的图片元素
  return <img src={safeSrc} crossOrigin="anonymous" {...otherProps} />;
}
