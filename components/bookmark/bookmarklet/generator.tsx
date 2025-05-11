"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";
import { BookmarkCollection } from "@/types/bookmark/collection";
import { toast } from "sonner";

interface BookmarkletGeneratorProps {
  collection: BookmarkCollection;
  locale?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BookmarkletGenerator({
  collection,
  locale = 'zh',
  open = false,
  onOpenChange
}: BookmarkletGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarkletUrl, setBookmarkletUrl] = useState("");
  const [bookmarkletCode, setBookmarkletCode] = useState("");

  // 在组件挂载后生成bookmarklet URL
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;

    // 从当前URL中提取集合信息
    // URL格式: /collections/[username]/[slug]
    const pathParts = currentPath.split('/');
    const username = pathParts.length >= 3 ? pathParts[2] : '';
    const slug = pathParts.length >= 4 ? pathParts[3] : '';

    if (!username || !slug) {
      console.error('Cannot extract username and slug from URL');
      return;
    }

    // 生成指向bookmarklet.html的URL
    const url = `${baseUrl}/bookmarklet.html?baseUrl=${encodeURIComponent(baseUrl)}&username=${encodeURIComponent(username)}&slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(collection.name)}`;
    setBookmarkletUrl(url);

    // 打开此URL可以获取bookmarklet代码
    console.log("Bookmarklet URL:", url);

    // 生成bookmarklet代码，用于复制 - 直接打开集合页面
    // 手动构建代码字符串，确保变量声明之间有空格
    const code = 'javascript:(function(){ ' +
      'var u=encodeURIComponent(location.href); ' +
      'var t=encodeURIComponent(document.title); ' +
      'var d=encodeURIComponent(document.getSelection?document.getSelection().toString():\'\'); ' +
      'window.open(\'' + baseUrl + '/collections/' + username + '/' + slug + '?bookmarklet=true&url=\'+u+\'&title=\'+t+\'&description=\'+d,\'_blank\'); ' +
      '})()';

    // 不需要替换空格，因为我们已经手动控制了空格
    setBookmarkletCode(code);
  }, [collection.name, collection.uuid]);

  // 复制到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
      setCopied(true);
      toast.success(locale === 'zh' ? "已复制到剪贴板" : "Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("复制失败:", err);
      toast.error(locale === 'zh' ? "复制失败" : "Failed to copy");
    });
  };

  const bookmarkletContent = (
    <>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center flex-wrap">
            <Button
              className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors my-2"
              onClick={() => {
                // 打开bookmarklet.html页面
                window.open(bookmarkletUrl, '_blank');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                <line x1="12" y1="7" x2="12" y2="13"></line>
                <line x1="15" y1="10" x2="9" y2="10"></line>
              </svg>
              {locale === 'zh' ? '打开书签小工具页面' : 'Open Bookmarklet Page'}
            </Button>
            <div className="text-sm text-muted-foreground ml-4">
              {locale === 'zh' ? '← 点击打开书签小工具页面' : '← Click to open bookmarklet page'}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {locale === 'zh'
              ? '点击上方按钮，打开书签小工具页面，然后按照页面上的说明操作'
              : 'Click the button above to open the bookmarklet page, then follow the instructions on the page'}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-2">
            {locale === 'zh' ? '或者，您可以直接复制以下代码:' : 'Or, you can directly copy the code below:'}
          </p>
          <div className="flex items-center space-x-2">
            <Input
              value={bookmarkletCode}
              readOnly
              className="font-mono text-xs"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              title={locale === 'zh' ? "复制代码" : "Copy code"}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-col items-start space-y-4 mt-4">
        <p className="text-sm text-muted-foreground">
          {locale === 'zh'
            ? `使用方法：浏览网页时，点击书签栏上的这个书签，即可快速添加当前页面到${collection.name}。`
            : `Usage: When browsing a webpage, click this bookmark in your bookmarks bar to quickly add the current page to ${collection.name}.`}
        </p>

        <div className="w-full">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">
              {locale === 'zh' ? '手动创建书签的步骤' : 'Steps to create bookmark manually'}
            </summary>
            <div className="mt-2 space-y-2 pl-4">
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  {locale === 'zh'
                    ? '在浏览器中，右键点击书签栏，选择"添加书签"或"添加页面"'
                    : 'In your browser, right-click on the bookmarks bar and select "Add bookmark" or "Add page"'}
                </li>
                <li>
                  {locale === 'zh'
                    ? `在名称字段中输入"添加到 ${collection.name}"`
                    : `Enter "Add to ${collection.name}" in the name field`}
                </li>
                <li>
                  {locale === 'zh'
                    ? '在URL或地址字段中，粘贴上方复制的代码'
                    : 'In the URL or address field, paste the code copied from above'}
                </li>
                <li>
                  {locale === 'zh' ? '点击保存' : 'Click save'}
                </li>
              </ol>
            </div>
          </details>
        </div>
      </div>
    </>
  );

  // 如果提供了open和onOpenChange参数，则使用Dialog组件
  if (onOpenChange !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" style={{ zIndex: 50 }}>
          <DialogHeader>
            <DialogTitle>
              {locale === 'zh' ? '书签小工具' : 'Bookmarklet'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'zh'
                ? `将此链接拖到书签栏，快速添加当前页面到${collection.name}`
                : `Drag this link to your bookmarks bar to quickly add the current page to ${collection.name}`}
            </DialogDescription>
          </DialogHeader>

          {bookmarkletContent}

          <DialogFooter className="sm:justify-end mt-4">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              {locale === 'zh' ? '关闭' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // 否则使用Card组件
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {locale === 'zh' ? '书签小工具' : 'Bookmarklet'}
        </CardTitle>
        <CardDescription>
          {locale === 'zh'
            ? `将此链接拖到书签栏，快速添加当前页面到${collection.name}`
            : `Drag this link to your bookmarks bar to quickly add the current page to ${collection.name}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookmarkletContent}
      </CardContent>
    </Card>
  );
}
