import { NextRequest, NextResponse } from "next/server";
import { getBookmarkCollectionByUserAndSlug } from "@/services/bookmark/collection";
import { createBookmarkItem } from "@/services/bookmark/item";
import { getBookmarkCategoriesByCollection } from "@/services/bookmark/category";
import { getBookmarkSubcategoriesByCategory } from "@/services/bookmark/subcategory";
import { BookmarkItemFormData } from "@/types/bookmark/item";

// GET /api/bookmarklet
// 处理来自bookmarklet的请求
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取参数
    const url = searchParams.get("url");
    const title = searchParams.get("title");
    const description = searchParams.get("description");
    const username = searchParams.get("username");
    const slug = searchParams.get("slug");

    // 验证必要参数
    if (!url || !title || !username || !slug) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 获取集合信息
    const collection = await getBookmarkCollectionByUserAndSlug(username, slug);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // 构建重定向URL
    let redirectUrl = `/collections/${username}/${slug}?bookmarklet=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

    // 如果有描述，添加到URL
    if (description) {
      redirectUrl += `&description=${encodeURIComponent(description)}`;
    }

    // 直接重定向到集合页面
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in bookmarklet GET API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 处理来自bookmarklet的POST请求
export async function POST(request: NextRequest) {
  try {
    // 获取表单数据
    const formData = await request.formData();

    // 获取参数
    const url = formData.get("url") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const username = formData.get("username") as string;
    const slug = formData.get("slug") as string;

    // 验证必要参数
    if (!url || !title || !username || !slug) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // 获取集合信息
    const collection = await getBookmarkCollectionByUserAndSlug(username, slug);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // 获取集合的第一个分类
    const categories = await getBookmarkCategoriesByCollection(collection.uuid);

    if (!categories || categories.length === 0) {
      // 如果没有分类，重定向到集合页面，让用户手动添加
      let redirectUrl = `/collections/${username}/${slug}?bookmarklet=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
      if (description) {
        redirectUrl += `&description=${encodeURIComponent(description)}`;
      }
      return NextResponse.redirect(redirectUrl);
    }

    // 获取第一个分类的第一个子分类
    const subcategories = await getBookmarkSubcategoriesByCategory(categories[0].uuid);

    if (!subcategories || subcategories.length === 0) {
      // 如果没有子分类，重定向到集合页面，让用户手动添加
      let redirectUrl = `/collections/${username}/${slug}?bookmarklet=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
      if (description) {
        redirectUrl += `&description=${encodeURIComponent(description)}`;
      }
      return NextResponse.redirect(redirectUrl);
    }

    // 创建书签数据
    const bookmarkData: BookmarkItemFormData = {
      title: decodeURIComponent(title),
      url: decodeURIComponent(url),
      description: description ? decodeURIComponent(description) : '',
      subcategory_uuid: subcategories[0].uuid,
      order_index: 0
    };

    // 保存书签
    await createBookmarkItem(bookmarkData, collection.user_uuid);

    // 返回成功页面
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>添加书签成功 - 雷水书签</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f9fafb;
              color: #1f2937;
            }
            .container {
              text-align: center;
              max-width: 600px;
              padding: 2rem;
              background-color: white;
              border-radius: 0.5rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            h1 {
              font-size: 1.5rem;
              margin-bottom: 1rem;
              color: #10b981;
            }
            p {
              margin-bottom: 1.5rem;
              color: #4b5563;
            }
            .button {
              display: inline-block;
              padding: 0.5rem 1rem;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 0.375rem;
              font-weight: 500;
            }
            .success-icon {
              width: 48px;
              height: 48px;
              margin: 0 auto 1rem;
              color: #10b981;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h1>书签添加成功</h1>
            <p>已将 <strong>${decodeURIComponent(title)}</strong> 添加到您的书签集合中</p>
            <a href="/collections/${username}/${slug}" class="button">查看集合</a>
          </div>
          <script>
            // 3秒后自动关闭窗口
            setTimeout(function() {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  } catch (error) {
    console.error("Error in bookmarklet POST API:", error);

    // 返回一个HTML页面，显示错误信息
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>添加书签失败 - 雷水书签</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f9fafb;
              color: #1f2937;
            }
            .container {
              text-align: center;
              max-width: 600px;
              padding: 2rem;
              background-color: white;
              border-radius: 0.5rem;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            h1 {
              font-size: 1.5rem;
              margin-bottom: 1rem;
              color: #ef4444;
            }
            p {
              margin-bottom: 1.5rem;
              color: #4b5563;
            }
            .button {
              display: inline-block;
              padding: 0.5rem 1rem;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 0.375rem;
              font-weight: 500;
            }
            .error-icon {
              width: 48px;
              height: 48px;
              margin: 0 auto 1rem;
              color: #ef4444;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h1>添加书签失败</h1>
            <p>抱歉，添加书签时出现了错误。请稍后再试。</p>
            <a href="/" class="button">返回首页</a>
          </div>
          <script>
            // 5秒后自动关闭窗口
            setTimeout(function() {
              window.close();
            }, 5000);
          </script>
        </body>
      </html>
    `, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  }
}
