# 雷水书签移动端测试指南

## 📱 测试设备和浏览器

### 推荐测试设备
- **iPhone**: iPhone 12/13/14/15 (iOS 15+)
- **Android**: Samsung Galaxy S21+, Google Pixel 6+ (Android 11+)
- **平板**: iPad Air, Samsung Galaxy Tab

### 推荐测试浏览器
- **iOS**: Safari, Chrome, Edge
- **Android**: Chrome, Samsung Internet, Firefox
- **桌面**: Chrome DevTools 移动模拟器

## 🧪 测试检查清单

### 1. 响应式布局测试
- [ ] 320px - 480px (小屏手机)
- [ ] 481px - 640px (大屏手机)
- [ ] 641px - 768px (小平板)
- [ ] 769px - 1024px (大平板)

### 2. 导航栏测试
- [ ] Logo 在小屏幕上正确显示
- [ ] 用户菜单按钮大小适中，易于点击
- [ ] 编辑模式工具栏在移动端正确折叠
- [ ] 排序按钮在小屏幕上合并为下拉菜单

### 2.1 分类导航滑动测试
- [ ] 大分类导航可以左右滑动
- [ ] 滑动时显示左右导航按钮
- [ ] 滑动提示文字正确显示
- [ ] 选中分类自动滚动到可视区域
- [ ] 滚动条在移动端被正确隐藏
- [ ] 滑动操作流畅无卡顿

### 2.2 子分类导航滑动测试
- [ ] 子分类标签可以左右滑动
- [ ] 滑动时显示渐变遮罩效果
- [ ] 添加按钮在移动端正确显示
- [ ] 编辑按钮在移动端适当缩小

### 3. 首页测试
- [ ] Hero banner 文字在移动端可读
- [ ] 按钮大小适合触摸操作
- [ ] 解卦图示在小屏幕上正确缩放
- [ ] 动画效果在移动端流畅

### 4. 集合页面测试
- [ ] 集合卡片在移动端正确排列
- [ ] 卡片内容在小屏幕上可读
- [ ] 长按手势触发菜单
- [ ] 分页控件在移动端易于操作

### 5. 书签项目测试
- [ ] 书签卡片在移动端紧凑显示
- [ ] 图标和文字大小适中
- [ ] 长按手势正常工作
- [ ] 访问按钮在移动端可用

### 6. 表单和对话框测试
- [ ] 添加书签对话框在移动端正确显示
- [ ] 表单字段在小屏幕上易于填写
- [ ] 下拉菜单在移动端正常工作
- [ ] 按钮大小适合触摸操作

### 7. 手势交互测试
- [ ] 长按手势 (600ms) 触发菜单
- [ ] 滑动手势响应正常
- [ ] 双击缩放被正确禁用
- [ ] 触摸反馈清晰

### 8. 性能测试
- [ ] 页面加载时间 < 3秒
- [ ] 滚动流畅，无卡顿
- [ ] 动画帧率稳定
- [ ] 内存使用合理

### 9. 网络适配测试
- [ ] 慢速网络下的加载体验
- [ ] 离线状态处理
- [ ] 图片懒加载正常工作
- [ ] 网络错误提示友好

### 10. 电池和性能优化测试
- [ ] 低电量模式下减少动画
- [ ] 高内存使用时的降级处理
- [ ] 慢速连接时的优化
- [ ] 减少动画偏好的支持

## 🔧 测试工具

### Chrome DevTools
```bash
# 打开移动设备模拟器
F12 -> Toggle device toolbar (Ctrl+Shift+M)

# 推荐测试尺寸
- iPhone SE: 375x667
- iPhone 12 Pro: 390x844
- Pixel 5: 393x851
- iPad Air: 820x1180
```

### 性能测试
```bash
# Lighthouse 移动端测试
lighthouse https://your-domain.com --preset=perf --form-factor=mobile

# 网络限制测试
# Chrome DevTools -> Network -> Throttling -> Slow 3G
```

### 真机测试
```bash
# iOS Safari 调试
# 设置 -> Safari -> 高级 -> Web检查器
# Mac Safari -> 开发 -> [设备名]

# Android Chrome 调试
# chrome://inspect/#devices
```

## 🐛 常见问题和解决方案

### 1. 触摸区域过小
```css
/* 确保触摸目标至少 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

### 2. 滚动性能问题
```css
/* 启用硬件加速 */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
}
```

### 3. 输入框缩放问题
```html
<!-- 防止输入时页面缩放 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

### 4. 长按选择文本问题
```css
/* 禁用文本选择 */
.no-select {
  -webkit-user-select: none;
  user-select: none;
}
```

## 📊 性能基准

### 加载性能目标
- **首次内容绘制 (FCP)**: < 1.5s
- **最大内容绘制 (LCP)**: < 2.5s
- **首次输入延迟 (FID)**: < 100ms
- **累积布局偏移 (CLS)**: < 0.1

### 运行时性能目标
- **滚动帧率**: 60fps
- **动画帧率**: 60fps
- **内存使用**: < 50MB
- **JavaScript 执行时间**: < 50ms

## 🚀 测试自动化

### Playwright 移动端测试
```javascript
// tests/mobile.spec.js
const { test, devices } = require('@playwright/test');

test.describe('Mobile Tests', () => {
  test.use({ ...devices['iPhone 12'] });
  
  test('mobile navigation works', async ({ page }) => {
    await page.goto('/');
    // 测试移动端导航
  });
});
```

### Jest 移动端单元测试
```javascript
// __tests__/mobile-gestures.test.js
import { useLongPress } from '@/hooks/use-mobile-gestures';

describe('Mobile Gestures', () => {
  test('long press triggers after delay', () => {
    // 测试长按手势
  });
});
```

## 📝 测试报告模板

### 测试环境
- 设备: [设备型号]
- 操作系统: [iOS/Android 版本]
- 浏览器: [浏览器版本]
- 网络: [WiFi/4G/5G]

### 测试结果
- ✅ 通过项目数: X/Y
- ❌ 失败项目数: X/Y
- ⚠️ 需要改进项目数: X/Y

### 问题记录
1. **问题描述**: [详细描述]
   - **重现步骤**: [步骤]
   - **期望结果**: [期望]
   - **实际结果**: [实际]
   - **严重程度**: [高/中/低]

### 性能数据
- **Lighthouse 分数**: [分数]
- **加载时间**: [时间]
- **内存使用**: [MB]
- **帧率**: [fps]

## 🎯 优化建议

### 立即修复 (高优先级)
- [ ] 修复触摸区域过小的问题
- [ ] 解决滚动卡顿问题
- [ ] 修复表单在移动端的可用性

### 短期优化 (中优先级)
- [ ] 优化图片加载策略
- [ ] 改进动画性能
- [ ] 增强手势交互

### 长期改进 (低优先级)
- [ ] 添加 PWA 支持
- [ ] 实现离线功能
- [ ] 优化电池使用
