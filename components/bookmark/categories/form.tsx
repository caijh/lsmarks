"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookmarkCategoryFormData } from "@/types/bookmark/category";
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
  collection_uuid: z.string().min(1, "集合UUID不能为空"),
});

interface BookmarkCategoryFormProps {
  initialData?: BookmarkCategoryFormData;
  collectionUuid: string;
  onSubmit: (data: BookmarkCategoryFormData) => Promise<void>;
  isSubmitting?: boolean;
  locale?: string;
  showSubmitButton?: boolean;
}

export function BookmarkCategoryForm({
  initialData,
  collectionUuid,
  onSubmit,
  isSubmitting = false,
  locale = 'zh',
  showSubmitButton = true,
}: BookmarkCategoryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      collection_uuid: collectionUuid,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    // 转换为BookmarkCategoryFormData
    const formData: BookmarkCategoryFormData = {
      name: values.name,
      collection_uuid: values.collection_uuid,
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
            <FormItem>
              <FormLabel>{locale === 'zh' ? '名称' : 'Name'}</FormLabel>
              <FormControl>
                <Input placeholder={locale === 'zh' ? "分类名称" : "Category name"} {...field} />
              </FormControl>
              <FormDescription>{locale === 'zh' ? '分类的显示名称' : 'Display name of the category'}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <input type="hidden" {...form.register("collection_uuid")} />

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
