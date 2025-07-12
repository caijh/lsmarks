"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookmarkItemFormData } from "@/types/bookmark/item";
import { BookmarkCategoryWithSubcategories } from "@/types/bookmark/category";
import { BookmarkSubcategoryWithItems } from "@/types/bookmark/subcategory";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bookmark, Trophy, Info, MoveVertical } from "@/components/ui/icons";
import { IconUrlGenerator } from "../shared/metadata-fetcher";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// 增强的表单验证模式，包含分类选择
const enhancedFormSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(255, "标题不能超过255个字符"),
  url: z.string().url("请输入有效的URL").max(2000, "URL不能超过2000个字符"),
  description: z.string().max(1000, "描述不能超过1000个字符").optional(),
  icon_url: z.string().url("请输入有效的URL").max(255, "图标URL不能超过255个字符").optional().or(z.literal("")),
  category_uuid: z.string().min(1, "请选择大分类"),
  subcategory_uuid: z.string().min(1, "请选择子分类"),
});

interface EnhancedBookmarkEditFormProps {
  initialData?: BookmarkItemFormData & {
    category_uuid?: string;
  };
  categories: BookmarkCategoryWithSubcategories[];
  onSubmit: (data: BookmarkItemFormData & { category_uuid: string }) => Promise<void>;
  isSubmitting?: boolean;
  locale?: string;
  showSubmitButton?: boolean;
  registerSubmit?: (submitFn: () => void) => void;
}

export function EnhancedBookmarkEditForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
  locale = 'zh',
  showSubmitButton = true,
  registerSubmit,
}: EnhancedBookmarkEditFormProps) {
  const [urlChanged, setUrlChanged] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.category_uuid || "");
  const [availableSubcategories, setAvailableSubcategories] = useState<BookmarkSubcategoryWithItems[]>([]);

  const form = useForm<z.infer<typeof enhancedFormSchema>>({
    resolver: zodResolver(enhancedFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      url: initialData?.url || "",
      description: initialData?.description || "",
      icon_url: initialData?.icon_url || "",
      category_uuid: initialData?.category_uuid || "",
      subcategory_uuid: initialData?.subcategory_uuid || "",
    },
  });

  // 当选择的分类改变时，更新可用的子分类
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.uuid === selectedCategory);
      if (category) {
        setAvailableSubcategories(category.subcategories || []);
        // 如果当前选择的子分类不在新分类中，清空子分类选择
        const currentSubcategory = form.getValues("subcategory_uuid");
        const isSubcategoryValid = category.subcategories?.some(sub => sub.uuid === currentSubcategory);
        if (!isSubcategoryValid) {
          form.setValue("subcategory_uuid", "");
        }
      }
    } else {
      setAvailableSubcategories([]);
      form.setValue("subcategory_uuid", "");
    }
  }, [selectedCategory, categories, form]);

  // 初始化时设置子分类
  useEffect(() => {
    if (initialData?.category_uuid && initialData?.subcategory_uuid) {
      const category = categories.find(cat => cat.uuid === initialData.category_uuid);
      if (category) {
        setAvailableSubcategories(category.subcategories || []);
      }
    }
  }, [initialData, categories]);

  const handleSubmit = async (values: z.infer<typeof enhancedFormSchema>) => {
    const formData: BookmarkItemFormData & { category_uuid: string } = {
      title: values.title,
      url: values.url,
      description: values.description,
      icon_url: values.icon_url || undefined,
      subcategory_uuid: values.subcategory_uuid,
      category_uuid: values.category_uuid,
    };

    await onSubmit(formData);
  };

  // 处理分类选择变化
  const handleCategoryChange = (categoryUuid: string) => {
    setSelectedCategory(categoryUuid);
    form.setValue("category_uuid", categoryUuid);
  };

  // 处理图标URL获取
  const handleIconUrlGenerated = useCallback((iconUrl: string) => {
    if (iconUrl && !form.getValues("icon_url")) {
      form.setValue("icon_url", iconUrl);
    }
  }, [form]);

  // 注册提交函数
  useEffect(() => {
    if (registerSubmit) {
      registerSubmit(() => form.handleSubmit(handleSubmit)());
    }
  }, [registerSubmit, form, handleSubmit]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 分类迁移提示 */}
        <Alert>
          <MoveVertical className="h-4 w-4" />
          <AlertTitle>分类迁移</AlertTitle>
          <AlertDescription>
            您可以将此书签移动到不同的分类中。选择新的大分类和子分类即可完成迁移。
          </AlertDescription>
        </Alert>

        {/* 分类选择区域 */}
        <div className="space-y-4 bg-muted/10 p-4 rounded-md">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            分类设置
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 大分类选择 */}
            <FormField
              control={form.control}
              name="category_uuid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>大分类</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleCategoryChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择大分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.uuid} value={category.uuid}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 子分类选择 */}
            <FormField
              control={form.control}
              name="subcategory_uuid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>子分类</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedCategory || availableSubcategories.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择子分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.uuid} value={subcategory.uuid}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* 书签基本信息 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">基本信息</h4>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>标题</FormLabel>
                <FormControl>
                  <Input placeholder="输入书签标题" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setUrlChanged(true);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  网站的完整URL地址
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="输入书签描述（可选）"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  简短描述这个网站的内容或用途
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>图标URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/favicon.ico"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  网站图标的URL地址（可选）
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 自动获取图标 */}
        {form.watch("url") && urlChanged && (
          <IconUrlGenerator
            url={form.watch("url")}
            onIconUrlGenerated={handleIconUrlGenerated}
          />
        )}

        {showSubmitButton && (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "保存中..." : "保存更改"}
          </Button>
        )}
      </form>
    </Form>
  );
}
