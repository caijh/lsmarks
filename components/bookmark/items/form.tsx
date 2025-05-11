"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookmarkItemFormData } from "@/types/bookmark/item";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Bookmark, Trophy, Info } from "@/components/ui/icons";
import { IconUrlGenerator } from "../shared/metadata-fetcher";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
// 发现页面相关导入已移除

// 表单验证模式
const formSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(255, "标题不能超过255个字符"),
  url: z.string().url("请输入有效的URL").max(2000, "URL不能超过2000个字符"),
  description: z.string().max(1000, "描述不能超过1000个字符").optional(),
  icon_url: z.string().url("请输入有效的URL").max(255, "图标URL不能超过255个字符").optional().or(z.literal("")),
  subcategory_uuid: z.string().min(1, "子分类UUID不能为空"),
});

interface BookmarkItemFormProps {
  initialData?: BookmarkItemFormData;
  subcategoryUuid: string;
  onSubmit: (data: BookmarkItemFormData) => Promise<void>;
  isSubmitting?: boolean;
  locale?: string;
  showSubmitButton?: boolean;
  registerSubmit?: (submitFn: () => void) => void; // 添加注册提交函数的属性
}

export function BookmarkItemForm({
  initialData,
  subcategoryUuid,
  onSubmit,
  isSubmitting = false,
  locale = 'zh',
  showSubmitButton = true,
  registerSubmit,
}: BookmarkItemFormProps) {
  const [urlChanged, setUrlChanged] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      url: initialData?.url || "",
      description: initialData?.description || "",
      icon_url: initialData?.icon_url || "",
      subcategory_uuid: subcategoryUuid,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // 转换为BookmarkItemFormData
    const formData: BookmarkItemFormData = {
      title: values.title,
      url: values.url,
      description: values.description,
      icon_url: values.icon_url || undefined,
      subcategory_uuid: values.subcategory_uuid,
    };

    await onSubmit(formData);
  };

  // 注册提交函数，使父组件可以触发表单提交
  useEffect(() => {
    if (registerSubmit) {
      registerSubmit(() => form.handleSubmit(handleSubmit)());
    }
  }, [registerSubmit, form, handleSubmit]);

  // 处理图标URL生成结果
  const handleIconUrlGenerated = useCallback((iconUrl: string) => {
    // 设置图标URL
    if (iconUrl && (form.getValues("icon_url") === "" || urlChanged)) {
      form.setValue("icon_url", iconUrl);
    }

    setUrlChanged(false);
  }, [form, urlChanged]);

  // URL统计相关函数已移除

  // 监听URL变化
  useEffect(() => {
    // 监听特定字段的变化
    const subscription = form.watch((formValues) => {
      // 获取当前URL值
      const url = formValues.url;
      if (url && typeof url === 'string') {
        setUrlChanged(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>书签的URL地址</FormDescription>
              <FormMessage />
              {/* 隐藏的图标URL生成器，只用于自动生成图标URL */}
              <IconUrlGenerator
                url={field.value}
                onIconUrlGenerated={handleIconUrlGenerated}
              />

              {/* URL统计信息显示已移除 */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{locale === 'zh' ? '标题' : 'Title'}</FormLabel>
              <FormControl>
                <Input placeholder={locale === 'zh' ? '书签标题' : 'Bookmark title'} {...field} />
              </FormControl>
              <FormDescription>{locale === 'zh' ? '书签的显示标题' : 'Display title of the bookmark'}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{locale === 'zh' ? '描述' : 'Description'}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={locale === 'zh' ? '书签描述（可选）' : 'Bookmark description (optional)'}
                  {...field}
                  className="resize-y min-h-[80px]"
                />
              </FormControl>
              <FormDescription>{locale === 'zh' ? '书签的简短描述，帮助您记住这个网站的内容' : 'A brief description of the bookmark to help you remember what this website is about'}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />


        <input type="hidden" {...form.register("icon_url")} />

        <input type="hidden" {...form.register("subcategory_uuid")} />

        {showSubmitButton && (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {locale === 'zh' ? '保存中...' : 'Saving...'}
              </>
            ) : (
              locale === 'zh' ? '保存' : 'Save'
            )}
          </Button>
        )}
      </form>
    </Form>
  );
}
