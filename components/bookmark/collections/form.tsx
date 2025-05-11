"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookmarkCollectionFormData } from "@/types/bookmark/collection";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// 表单验证模式
const getFormSchema = () => z.object({
  name: z.string()
    .min(1, "名称不能为空")
    .max(255, "名称不能超过255个字符"),
  description: z.string()
    .max(1000, "描述不能超过1000个字符")
    .optional()
    .or(z.literal("")),
  is_public: z.boolean().default(false),
  slug: z
    .string()
    .max(255, "Slug不能超过255个字符")
    .regex(/^[a-z0-9-]*$/, "Slug只能包含小写字母、数字和连字符")
    .optional()
    .or(z.literal("")),
});

interface BookmarkCollectionFormProps {
  initialData?: BookmarkCollectionFormData;
  onSubmit: (data: BookmarkCollectionFormData) => Promise<void>;
  isSubmitting?: boolean;
  locale?: string; // 添加语言参数
  showSubmitButton?: boolean; // 是否显示提交按钮
}

export function BookmarkCollectionForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  locale = 'zh', // 默认为中文
  showSubmitButton = true, // 默认显示提交按钮
}: BookmarkCollectionFormProps) {
  const formSchema = getFormSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      is_public: initialData?.is_public || false,
      slug: initialData?.slug || "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // 转换为BookmarkCollectionFormData
    const formData: BookmarkCollectionFormData = {
      name: values.name,
      description: values.description || undefined,
      is_public: values.is_public,
      slug: values.slug || undefined,
    };

    await onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">{locale === 'zh' ? '名称' : 'Name'}</FormLabel>
              <FormControl>
                <Input
                  placeholder={locale === 'zh' ? "我的书签集合" : "My Bookmark Collection"}
                  {...field}
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 shadow-sm"
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground/70">{locale === 'zh' ? '集合的显示名称' : 'Display name of the collection'}</FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">{locale === 'zh' ? '描述' : 'Description'}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={locale === 'zh' ? "描述这个集合的内容和用途..." : "Describe the content and purpose of this collection..."}
                  className="resize-none bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 shadow-sm min-h-[80px]"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground/70">{locale === 'zh' ? '集合的简短描述，将显示在集合详情页' : 'A brief description of the collection, displayed on the collection detail page'}</FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4 bg-background/30 shadow-sm hover:bg-background/50 transition-all duration-200">
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium">{locale === 'zh' ? '公开集合' : 'Public Collection'}</FormLabel>
                <FormDescription className="text-xs text-muted-foreground/70">
                  {locale === 'zh'
                    ? '公开集合可以被任何人访问，私有集合只有你能看到'
                    : 'Public collections can be accessed by anyone, private collections are only visible to you'}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-primary"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium">{locale === 'zh' ? '自定义URL' : 'Custom URL'}</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 text-xs">
                    lsmark.669696.xyz/collections/username/
                  </span>
                  <Input
                    placeholder="my-bookmarks"
                    {...field}
                    value={field.value || ""}
                    className="pl-[240px] bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-200 shadow-sm"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground/70">
                {locale === 'zh'
                  ? '自定义URL路径，只能包含小写字母、数字和连字符（可选）'
                  : 'Custom URL path, can only contain lowercase letters, numbers, and hyphens (optional)'}
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* 隐藏的提交按钮，用于从外部触发表单提交 */}
        <button
          id="collection-form-submit"
          type="submit"
          className="hidden"
          aria-hidden="true"
        />

        {/* 可选的显示提交按钮 */}
        {showSubmitButton && (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary/90 hover:bg-primary text-primary-foreground transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {locale === 'zh' ? '保存中...' : 'Saving...'}
              </>
            ) : (
              locale === 'zh' ? '保存集合' : 'Save Collection'
            )}
          </Button>
        )}
      </form>
    </Form>
  );
}
