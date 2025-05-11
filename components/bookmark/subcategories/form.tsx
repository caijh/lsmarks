"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { BookmarkSubcategoryFormData } from "@/types/bookmark/subcategory";
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
import { Loader2 } from "lucide-react";

// 表单验证模式
const formSchema = z.object({
  name: z.string().min(1, "名称不能为空").max(255, "名称不能超过255个字符"),
  category_uuid: z.string().min(1, "分类UUID不能为空"),
});

interface BookmarkSubcategoryFormProps {
  initialData?: BookmarkSubcategoryFormData;
  categoryUuid: string;
  onSubmit: (data: BookmarkSubcategoryFormData) => Promise<void>;
  isSubmitting?: boolean;
  locale?: string;
  showSubmitButton?: boolean;
  registerSubmit?: (submitFn: () => void) => void; // 添加注册提交函数的属性
}

export function BookmarkSubcategoryForm({
  initialData,
  categoryUuid,
  onSubmit,
  isSubmitting = false,
  locale = 'zh',
  showSubmitButton = true,
  registerSubmit,
}: BookmarkSubcategoryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      category_uuid: categoryUuid,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // 转换为BookmarkSubcategoryFormData
    const formData: BookmarkSubcategoryFormData = {
      name: values.name,
      category_uuid: values.category_uuid,
    };

    await onSubmit(formData);
  };

  // 注册提交函数，使父组件可以触发表单提交
  useEffect(() => {
    if (registerSubmit) {
      registerSubmit(() => form.handleSubmit(handleSubmit)());
    }
  }, [registerSubmit, form, handleSubmit]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{locale === 'zh' ? '名称' : 'Name'}</FormLabel>
              <FormControl>
                <Input placeholder={locale === 'zh' ? "子分类名称" : "Subcategory name"} {...field} />
              </FormControl>
              <FormDescription>{locale === 'zh' ? '子分类的显示名称' : 'Display name of the subcategory'}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <input type="hidden" {...form.register("category_uuid")} />

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
