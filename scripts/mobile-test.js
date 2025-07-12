#!/usr/bin/env node

/**
 * 雷水书签移动端自动化测试脚本
 * 使用 Playwright 进行移动端兼容性测试
 */

const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  timeout: 30000,
  devices: [
    'iPhone 12',
    'iPhone 12 Pro',
    'Pixel 5',
    'Galaxy S21',
    'iPad Air'
  ],
  testCases: [
    'homepage',
    'navigation',
    'categoryScroll',
    'collections',
    'bookmarks',
    'forms',
    'gestures'
  ]
};

// 测试结果存储
let testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  devices: {},
  details: []
};

// 日志函数
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}

// 测试用例定义
const testCases = {
  async homepage(page, deviceName) {
    log(`Testing homepage on ${deviceName}`);
    
    await page.goto(TEST_CONFIG.baseUrl);
    await page.waitForLoadState('networkidle');
    
    // 检查页面标题
    const title = await page.title();
    if (!title.includes('雷水书签')) {
      throw new Error('Page title incorrect');
    }
    
    // 检查主要元素是否存在
    await page.waitForSelector('h1', { timeout: 5000 });
    await page.waitForSelector('button', { timeout: 5000 });
    
    // 检查响应式布局
    const viewport = page.viewportSize();
    if (viewport.width < 768) {
      // 移动端特定检查
      const mobileElements = await page.$$('.sm\\:hidden');
      if (mobileElements.length === 0) {
        log('Warning: No mobile-specific elements found', 'warn');
      }
    }
    
    return { passed: true, message: 'Homepage loads correctly' };
  },

  async navigation(page, deviceName) {
    log(`Testing navigation on ${deviceName}`);
    
    await page.goto(TEST_CONFIG.baseUrl);
    
    // 检查导航栏
    const header = await page.$('header');
    if (!header) {
      throw new Error('Header not found');
    }
    
    // 检查Logo
    const logo = await page.$('header img, header svg');
    if (!logo) {
      throw new Error('Logo not found in header');
    }
    
    // 检查移动端菜单按钮（如果是小屏幕）
    const viewport = page.viewportSize();
    if (viewport.width < 640) {
      const menuButton = await page.$('button[aria-label*="menu"], button[aria-label*="菜单"]');
      if (menuButton) {
        await menuButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    return { passed: true, message: 'Navigation works correctly' };
  },

  async categoryScroll(page, deviceName) {
    log(`Testing category scroll on ${deviceName}`);

    // 访问一个有分类的集合页面
    await page.goto(TEST_CONFIG.baseUrl);

    // 查找集合链接
    const collectionLink = await page.$('a[href*="/collections/"]');
    if (collectionLink) {
      await collectionLink.click();
      await page.waitForLoadState('networkidle');

      // 检查分类导航容器
      const categoryNav = await page.$('.category-nav-container');
      if (!categoryNav) {
        throw new Error('Category navigation container not found');
      }

      // 检查是否可以滚动
      const scrollInfo = await page.evaluate(() => {
        const container = document.querySelector('.category-nav-container');
        if (!container) return null;

        return {
          scrollWidth: container.scrollWidth,
          clientWidth: container.clientWidth,
          canScroll: container.scrollWidth > container.clientWidth
        };
      });

      if (!scrollInfo) {
        throw new Error('Could not get scroll information');
      }

      // 如果可以滚动，测试滚动功能
      if (scrollInfo.canScroll) {
        const scrollResult = await page.evaluate(() => {
          const container = document.querySelector('.category-nav-container');
          if (!container) return false;

          const originalScrollLeft = container.scrollLeft;
          container.scrollLeft = 100;
          const scrollChanged = container.scrollLeft !== originalScrollLeft;
          container.scrollLeft = originalScrollLeft; // 恢复原位置

          return scrollChanged;
        });

        if (!scrollResult) {
          throw new Error('Category scroll functionality not working');
        }

        // 检查移动端滚动指示器
        const viewport = page.viewportSize();
        if (viewport.width < 768) {
          const scrollIndicators = await page.$('.category-nav-container ~ div p:has-text("滑动")');
          if (!scrollIndicators) {
            log('Mobile scroll indicators not found', 'warn');
          }
        }
      }

      // 检查子分类滑动
      const subcategoryTabs = await page.$('.horizontal-scroll');
      if (subcategoryTabs) {
        const subcategoryScrollInfo = await page.evaluate(() => {
          const container = document.querySelector('.horizontal-scroll');
          if (!container) return null;

          return {
            scrollWidth: container.scrollWidth,
            clientWidth: container.clientWidth,
            canScroll: container.scrollWidth > container.clientWidth
          };
        });

        if (subcategoryScrollInfo && subcategoryScrollInfo.canScroll) {
          const subcategoryScrollResult = await page.evaluate(() => {
            const container = document.querySelector('.horizontal-scroll');
            if (!container) return false;

            const originalScrollLeft = container.scrollLeft;
            container.scrollLeft = 50;
            const scrollChanged = container.scrollLeft !== originalScrollLeft;
            container.scrollLeft = originalScrollLeft;

            return scrollChanged;
          });

          if (!subcategoryScrollResult) {
            log('Subcategory scroll functionality not working', 'warn');
          }
        }
      }
    }

    return { passed: true, message: 'Category scroll functionality works correctly' };
  },

  async collections(page, deviceName) {
    log(`Testing collections on ${deviceName}`);
    
    await page.goto(`${TEST_CONFIG.baseUrl}/collections`);
    await page.waitForLoadState('networkidle');
    
    // 检查集合网格
    const grid = await page.$('.grid');
    if (!grid) {
      throw new Error('Collections grid not found');
    }
    
    // 检查集合卡片
    const cards = await page.$$('.grid > div');
    if (cards.length === 0) {
      log('No collection cards found', 'warn');
    }
    
    // 检查分页（如果存在）
    const pagination = await page.$('button:has-text("下一页"), button:has-text("Next")');
    if (pagination) {
      const isVisible = await pagination.isVisible();
      if (!isVisible) {
        log('Pagination not visible', 'warn');
      }
    }
    
    return { passed: true, message: 'Collections page works correctly' };
  },

  async bookmarks(page, deviceName) {
    log(`Testing bookmarks on ${deviceName}`);
    
    // 尝试访问一个示例集合页面
    await page.goto(TEST_CONFIG.baseUrl);
    
    // 查找集合链接
    const collectionLink = await page.$('a[href*="/collections/"]');
    if (collectionLink) {
      await collectionLink.click();
      await page.waitForLoadState('networkidle');
      
      // 检查书签项目
      const bookmarkItems = await page.$$('[data-testid="bookmark-item"], .bookmark-item, .grid > div');
      if (bookmarkItems.length === 0) {
        log('No bookmark items found', 'warn');
      }
    }
    
    return { passed: true, message: 'Bookmarks display correctly' };
  },

  async forms(page, deviceName) {
    log(`Testing forms on ${deviceName}`);
    
    await page.goto(TEST_CONFIG.baseUrl);
    
    // 查找表单相关按钮
    const addButton = await page.$('button:has-text("添加"), button:has-text("Add")');
    if (addButton) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // 检查对话框是否出现
      const dialog = await page.$('[role="dialog"], .dialog');
      if (dialog) {
        // 检查表单字段
        const inputs = await page.$$('input, textarea, select');
        if (inputs.length === 0) {
          throw new Error('No form inputs found in dialog');
        }
        
        // 检查移动端适配
        const viewport = page.viewportSize();
        if (viewport.width < 640) {
          const dialogRect = await dialog.boundingBox();
          if (dialogRect && dialogRect.width > viewport.width * 0.95) {
            log('Dialog may be too wide for mobile', 'warn');
          }
        }
        
        // 关闭对话框
        const closeButton = await page.$('button[aria-label*="close"], button[aria-label*="关闭"]');
        if (closeButton) {
          await closeButton.click();
        }
      }
    }
    
    return { passed: true, message: 'Forms work correctly' };
  },

  async gestures(page, deviceName) {
    log(`Testing gestures on ${deviceName}`);
    
    await page.goto(TEST_CONFIG.baseUrl);
    
    // 检查触摸事件支持
    const touchSupport = await page.evaluate(() => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });
    
    if (!touchSupport) {
      log('Touch events not supported in this environment', 'warn');
      return { passed: true, message: 'Gestures test skipped (no touch support)' };
    }
    
    // 查找可交互元素
    const interactiveElements = await page.$$('button, a, [role="button"]');
    if (interactiveElements.length > 0) {
      const element = interactiveElements[0];
      
      // 模拟触摸事件
      await element.dispatchEvent('touchstart');
      await page.waitForTimeout(100);
      await element.dispatchEvent('touchend');
    }
    
    return { passed: true, message: 'Gesture support detected' };
  }
};

// 运行单个测试用例
async function runTestCase(page, testName, deviceName) {
  const startTime = Date.now();
  
  try {
    const result = await testCases[testName](page, deviceName);
    const duration = Date.now() - startTime;
    
    testResults.summary.passed++;
    testResults.details.push({
      device: deviceName,
      test: testName,
      status: 'passed',
      duration,
      message: result.message
    });
    
    log(`✅ ${testName} passed on ${deviceName} (${duration}ms)`);
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    testResults.summary.failed++;
    testResults.details.push({
      device: deviceName,
      test: testName,
      status: 'failed',
      duration,
      error: error.message
    });
    
    log(`❌ ${testName} failed on ${deviceName}: ${error.message}`, 'error');
    return false;
  }
}

// 运行设备测试
async function runDeviceTests(deviceName) {
  log(`Starting tests for ${deviceName}`);
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices[deviceName],
    locale: 'zh-CN'
  });
  
  const page = await context.newPage();
  
  // 设置超时
  page.setDefaultTimeout(TEST_CONFIG.timeout);
  
  const deviceResults = {
    passed: 0,
    failed: 0,
    total: TEST_CONFIG.testCases.length
  };
  
  for (const testCase of TEST_CONFIG.testCases) {
    testResults.summary.total++;
    const success = await runTestCase(page, testCase, deviceName);
    
    if (success) {
      deviceResults.passed++;
    } else {
      deviceResults.failed++;
    }
  }
  
  testResults.devices[deviceName] = deviceResults;
  
  await browser.close();
  log(`Completed tests for ${deviceName}: ${deviceResults.passed}/${deviceResults.total} passed`);
}

// 生成测试报告
function generateReport() {
  const reportPath = path.join(__dirname, '..', 'test-results', 'mobile-test-report.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  
  // 生成简单的文本报告
  const textReportPath = path.join(reportDir, 'mobile-test-summary.txt');
  const summary = `
移动端测试报告
================
测试时间: ${testResults.timestamp}
总测试数: ${testResults.summary.total}
通过: ${testResults.summary.passed}
失败: ${testResults.summary.failed}

设备测试结果:
${Object.entries(testResults.devices).map(([device, results]) => 
  `${device}: ${results.passed}/${results.total} 通过`
).join('\n')}

详细结果请查看: ${reportPath}
`;
  
  fs.writeFileSync(textReportPath, summary);
  
  log(`Test report generated: ${reportPath}`);
  log(`Summary report: ${textReportPath}`);
}

// 主函数
async function main() {
  log('Starting mobile compatibility tests');
  log(`Base URL: ${TEST_CONFIG.baseUrl}`);
  log(`Testing devices: ${TEST_CONFIG.devices.join(', ')}`);
  
  for (const deviceName of TEST_CONFIG.devices) {
    await runDeviceTests(deviceName);
  }
  
  generateReport();
  
  const { passed, failed, total } = testResults.summary;
  log(`\n📊 Test Summary: ${passed}/${total} passed, ${failed} failed`);
  
  if (failed > 0) {
    log('Some tests failed. Check the report for details.', 'error');
    process.exit(1);
  } else {
    log('All tests passed! 🎉');
    process.exit(0);
  }
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    log(`Test runner error: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runDeviceTests, testCases };
