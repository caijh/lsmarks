import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ChevronLeft, Loader2, CheckCircle, FolderPlus, BookmarkPlus } from "@/components/ui/icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { IconUrlGenerator } from "@/components/bookmark/shared/metadata-fetcher";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BookmarkCategoryWithSubcategories } from "@/types/bookmark/category";
import { BookmarkSubcategoryWithItems } from "@/types/bookmark/subcategory";
import { BookmarkCollection } from "@/types/bookmark/collection";
import {
  createTempBookmarkItem,
  createTempSubcategory,
  createTempCategory,
  addItemToSubcategory,
  addSubcategoryToCategory,
  addCategoryToList
} from "@/utils/optimistic-update";

// 快速添加书签表单验证模式
const getQuickAddBookmarkFormSchema = () => z.object({
  // 书签信息
  title: z.string().min(1, "标题不能为空")
    .max(255, "标题不能超过255个字符"),
  url: z.string()
    .min(1, "URL不能为空")
    .max(2048, "URL不能超过2048个字符")
    .refine(
      (url) => {
        try {
          // 尝试创建URL对象，验证URL格式
          new URL(url);
          return true;
        } catch (e) {
          return false;
        }
      },
      {
        message: "请输入有效的URL（例如：https://example.com）"
      }
    )
    .refine(
      (url) => {
        try {
          const parsedUrl = new URL(url);
          // 验证URL协议是否为http或https
          return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch (e) {
          return false;
        }
      },
      {
        message: "URL必须以http://或https://开头"
      }
    ),
  description: z.string().max(1000, "描述不能超过1000个字符").optional(),
  icon_url: z.string().optional(),

  // 分类信息
  category_uuid: z.string().optional(),
  new_category_name: z.string().optional(),
  use_new_category: z.boolean().default(false),

  // 子分类信息
  subcategory_uuid: z.string().optional(),
  new_subcategory_name: z.string().optional(),
  use_new_subcategory: z.boolean().default(false),
}).refine(data => {
  // 如果使用新分类，则分类名称必填
  if (data.use_new_category && !data.new_category_name) {
    return false;
  }
  return true;
}, {
  message: "分类名称不能为空",
  path: ["new_category_name"],
}).refine(data => {
  // 如果使用新子分类，则子分类名称必填
  if (data.use_new_subcategory && !data.new_subcategory_name) {
    return false;
  }
  return true;
}, {
  message: "子分类名称不能为空",
  path: ["new_subcategory_name"],
}).refine(data => {
  // 必须选择分类或创建新分类
  return (!!data.category_uuid && !data.use_new_category) || (data.use_new_category && !!data.new_category_name);
}, {
  message: "请选择或创建分类",
  path: ["category_uuid"],
}).refine(data => {
  // 必须选择子分类或创建新子分类
  return (!!data.subcategory_uuid && !data.use_new_subcategory) || (data.use_new_subcategory && !!data.new_subcategory_name);
}, {
  message: "请选择或创建子分类",
  path: ["subcategory_uuid"],
});

type QuickAddBookmarkDialogProps = {
  collection: BookmarkCollection;
  categories: BookmarkCategoryWithSubcategories[];
  onSuccess?: () => void;
  onOptimisticUpdate?: (updatedCategories: BookmarkCategoryWithSubcategories[]) => void; // 乐观更新回调
  children?: React.ReactNode;
  currentUserUuid?: string; // 当前用户UUID，用于乐观更新
  open?: boolean; // 控制对话框是否打开
  onOpenChange?: (open: boolean) => void; // 对话框打开状态变化回调
  defaultValues?: { // 默认值，用于bookmarklet
    title?: string;
    url?: string;
    description?: string;
  };
  currentSelection?: { // 当前页面上已选择的分类和子分类
    categoryUuid?: string;
    subcategoryUuid?: string;
  };
  isFromBookmarklet?: boolean; // 是否来自bookmarklet
};

export function QuickAddBookmarkDialog({
  collection,
  categories,
  onSuccess,
  onOptimisticUpdate,
  children,
  currentUserUuid,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultValues,
  currentSelection,
  isFromBookmarklet = false
}: QuickAddBookmarkDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<BookmarkSubcategoryWithItems[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [saveStage, setSaveStage] = useState<'idle' | 'validating' | 'creating-category' | 'creating-subcategory' | 'saving-bookmark' | 'success'>('idle');

  // 使用受控或非受控模式
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  // 处理图标URL生成结果
  const handleIconUrlGenerated = (iconUrl: string) => {
    if (iconUrl && form && !form.getValues("icon_url")) {
      form.setValue("icon_url", iconUrl);
    }
  };

  // 创建表单验证模式
  const quickAddBookmarkFormSchema = getQuickAddBookmarkFormSchema();

  // 从localStorage获取上次选择的分类和子分类
  const getLastSelectedCategory = () => {
    if (typeof window === 'undefined') return '';

    // 根据来源选择不同的存储键
    const storageKey = isFromBookmarklet
      ? `${collection.uuid}_bookmarklet_last_category_uuid`
      : `${collection.uuid}_last_category_uuid`;

    return localStorage.getItem(storageKey) || '';
  };

  const getLastSelectedSubcategory = (categoryUuid: string) => {
    if (typeof window === 'undefined' || !categoryUuid) return '';

    // 根据来源选择不同的存储键
    const storageKey = isFromBookmarklet
      ? `${collection.uuid}_bookmarklet_${categoryUuid}_last_subcategory_uuid`
      : `${collection.uuid}_${categoryUuid}_last_subcategory_uuid`;

    return localStorage.getItem(storageKey) || '';
  };

  // 表单
  const form = useForm<z.infer<typeof quickAddBookmarkFormSchema>>({
    resolver: zodResolver(quickAddBookmarkFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      url: defaultValues?.url || "",
      description: defaultValues?.description || "",
      icon_url: "",
      category_uuid: getLastSelectedCategory(),
      new_category_name: "",
      use_new_category: false,
      subcategory_uuid: "",
      new_subcategory_name: "",
      use_new_subcategory: false,
    },
  });

  // 监听弹窗打开状态，当弹窗打开时重新初始化表单
  useEffect(() => {
    if (open) {
      console.log("Dialog opened, currentSelection:", currentSelection);

      // 重置表单中的基本字段，但保留分类和子分类选择
      form.setValue("title", defaultValues?.title || "");
      form.setValue("url", defaultValues?.url || "");
      form.setValue("description", defaultValues?.description || "");
      form.setValue("icon_url", "");

      // 如果有当前选择的分类，直接设置
      if (currentSelection?.categoryUuid && !isFromBookmarklet) {
        console.log("Setting current category:", currentSelection.categoryUuid);
        setSelectedCategory(currentSelection.categoryUuid);
        form.setValue("category_uuid", currentSelection.categoryUuid);

        // 从已有的分类数据中查找选中的分类
        const selectedCategoryData = categories.find(cat => cat.uuid === currentSelection.categoryUuid);
        if (selectedCategoryData) {
          // 直接使用分类中的子分类数据
          const subcats = selectedCategoryData.subcategories || [];
          console.log("Found subcategories for current category:", subcats.length);
          setSubcategories(subcats);

          // 如果有当前选择的子分类，直接设置
          if (currentSelection.subcategoryUuid) {
            console.log("Setting current subcategory:", currentSelection.subcategoryUuid);
            // 检查子分类是否存在
            const subcategoryExists = subcats.some(
              (sub: BookmarkSubcategoryWithItems) => sub.uuid === currentSelection.subcategoryUuid
            );

            if (subcategoryExists) {
              console.log("Current subcategory exists, setting it");
              form.setValue("subcategory_uuid", currentSelection.subcategoryUuid);

              // 确保子分类选择不会被其他useEffect覆盖
              setTimeout(() => {
                console.log("Re-confirming subcategory selection:", currentSelection.subcategoryUuid);
                form.setValue("subcategory_uuid", currentSelection.subcategoryUuid);
              }, 100);
            } else {
              console.log("Current subcategory does not exist in the loaded subcategories");
              // 如果子分类不存在但有其他子分类可选，选择第一个
              if (subcats.length > 0) {
                console.log("Selecting first available subcategory instead:", subcats[0].uuid);
                form.setValue("subcategory_uuid", subcats[0].uuid);
              }
            }
          } else if (subcats.length > 0) {
            // 如果没有当前选择的子分类但有子分类可选，选择第一个
            console.log("No current subcategory, selecting first available:", subcats[0].uuid);
            form.setValue("subcategory_uuid", subcats[0].uuid);
          }
        } else {
          console.log("Selected category not found in categories data");
        }
      }

      // 其他字段会在初始化分类和子分类的useEffect中设置
    }
  }, [open, defaultValues, form, currentSelection, isFromBookmarklet, categories]);

  // 调试当前表单值和数据
  useEffect(() => {
    if (open) {
      const categoryUuid = form.getValues("category_uuid");
      const subcategoryUuid = form.getValues("subcategory_uuid");
      console.log("Current form values:", { categoryUuid, subcategoryUuid });
      console.log("Current state:", { selectedCategory, subcategories: subcategories.length });

      // 检查categories数据结构
      console.log("Categories data structure:");
      categories.forEach((category, index) => {
        console.log(`Category ${index + 1}: ${category.name} (${category.uuid})`);
        console.log(`  Subcategories: ${category.subcategories ? category.subcategories.length : 0}`);
        if (category.subcategories && category.subcategories.length > 0) {
          category.subcategories.forEach((subcategory, subIndex) => {
            console.log(`    Subcategory ${subIndex + 1}: ${subcategory.name} (${subcategory.uuid})`);
          });
        }
      });
    }
  }, [form, open, selectedCategory, subcategories, categories]);

  // 初始化选择的分类和子分类
  useEffect(() => {
    if (typeof window === 'undefined' || !open) return;

    // 如果已经通过currentSelection设置了分类和子分类，则不需要再次设置
    if (currentSelection?.categoryUuid && !isFromBookmarklet) {
      console.log("Using current selection, skipping localStorage initialization");
      return;
    }

    console.log("Initializing from localStorage");

    // 获取上次选择的分类
    const lastCategoryUuid = getLastSelectedCategory();
    if (lastCategoryUuid) {
      console.log("Using last selected category:", lastCategoryUuid);
      setSelectedCategory(lastCategoryUuid);
      form.setValue("category_uuid", lastCategoryUuid);

      // 从已有的分类数据中查找选中的分类
      const selectedCategoryData = categories.find(cat => cat.uuid === lastCategoryUuid);
      if (selectedCategoryData) {
        // 直接使用分类中的子分类数据
        setSubcategories(selectedCategoryData.subcategories || []);

        // 获取上次选择的子分类
        const lastSubcategoryUuid = getLastSelectedSubcategory(lastCategoryUuid);
        if (lastSubcategoryUuid) {
          console.log("Using last selected subcategory:", lastSubcategoryUuid);
          // 检查子分类是否存在
          const subcategoryExists = selectedCategoryData.subcategories?.some(
            (sub: BookmarkSubcategoryWithItems) => sub.uuid === lastSubcategoryUuid
          );

          if (subcategoryExists) {
            form.setValue("subcategory_uuid", lastSubcategoryUuid);
          }
        } else if (selectedCategoryData.subcategories && selectedCategoryData.subcategories.length > 0) {
          // 如果没有上次选择的子分类，但有子分类可选，则选择第一个
          const firstSubcategory = selectedCategoryData.subcategories[0];
          console.log("Using first subcategory:", firstSubcategory.uuid);
          form.setValue("subcategory_uuid", firstSubcategory.uuid);
          saveLastSelected(lastCategoryUuid, firstSubcategory.uuid);
        }
      }
    } else if (categories.length > 0) {
      // 如果没有上次选择的分类，但有分类可选，则选择第一个
      const firstCategory = categories[0];
      console.log("Using first category:", firstCategory.uuid);
      setSelectedCategory(firstCategory.uuid);
      form.setValue("category_uuid", firstCategory.uuid);

      // 加载该分类的子分类
      setSubcategories(firstCategory.subcategories || []);

      // 如果有子分类，选择第一个
      if (firstCategory.subcategories && firstCategory.subcategories.length > 0) {
        const firstSubcategory = firstCategory.subcategories[0];
        console.log("Using first subcategory:", firstSubcategory.uuid);
        form.setValue("subcategory_uuid", firstSubcategory.uuid);
        saveLastSelected(firstCategory.uuid, firstSubcategory.uuid);
      }
    }
  }, [categories, collection.uuid, form, open, currentSelection, isFromBookmarklet]);

  // 当选择的大分类变化时，加载对应的子分类
  useEffect(() => {
    if (selectedCategory) {
      console.log("Loading subcategories for category:", selectedCategory);

      // 从已有的分类数据中查找选中的分类
      const selectedCategoryData = categories.find(cat => cat.uuid === selectedCategory);
      if (selectedCategoryData) {
        console.log("Found category data:", selectedCategoryData);

        // 检查子分类数据
        const subcats = selectedCategoryData.subcategories || [];
        console.log("Subcategories data:", subcats);

        // 直接使用分类中的子分类数据
        setSubcategories(subcats);

        // 调试当前子分类选择
        const currentSubcategoryUuid = form.getValues("subcategory_uuid");
        console.log("Current subcategory selection:", currentSubcategoryUuid);

        // 检查当前选择的子分类是否存在于新的子分类列表中
        const subcategoryExists = subcats.some(sub => sub.uuid === currentSubcategoryUuid);
        console.log("Current subcategory exists in new subcategories:", subcategoryExists);

        // 如果当前没有选择子分类或者选择的子分类不存在于新的子分类列表中，但有子分类可选，选择第一个
        if ((!currentSubcategoryUuid || !subcategoryExists) && subcats.length > 0) {
          console.log("Auto-selecting first subcategory:", subcats[0].uuid);
          form.setValue("subcategory_uuid", subcats[0].uuid);
        }
      } else {
        console.log("Category not found in categories data");
        setSubcategories([]);
      }
    } else {
      console.log("No category selected, clearing subcategories");
      setSubcategories([]);
    }
  }, [selectedCategory, categories, form]);

  // 保存用户选择到localStorage
  const saveLastSelected = (categoryUuid: string, subcategoryUuid?: string) => {
    if (typeof window === 'undefined') return;

    // 保存分类选择
    if (categoryUuid) {
      // 根据来源选择不同的存储键
      const categoryStorageKey = isFromBookmarklet
        ? `${collection.uuid}_bookmarklet_last_category_uuid`
        : `${collection.uuid}_last_category_uuid`;

      localStorage.setItem(categoryStorageKey, categoryUuid);

      // 保存子分类选择
      if (subcategoryUuid) {
        // 根据来源选择不同的存储键
        const subcategoryStorageKey = isFromBookmarklet
          ? `${collection.uuid}_bookmarklet_${categoryUuid}_last_subcategory_uuid`
          : `${collection.uuid}_${categoryUuid}_last_subcategory_uuid`;

        localStorage.setItem(subcategoryStorageKey, subcategoryUuid);
      }
    }
  };

  // 处理分类选择
  const handleCategoryChange = (value: string) => {
    console.log("Category changed to:", value);
    setSelectedCategory(value);
    form.setValue("category_uuid", value);
    form.setValue("use_new_category", false);

    // 从已有的分类数据中查找选中的分类
    const selectedCategoryData = categories.find(cat => cat.uuid === value);
    if (selectedCategoryData) {
      // 直接使用分类中的子分类数据
      const subcats = selectedCategoryData.subcategories || [];
      console.log("Loaded subcategories:", subcats);
      setSubcategories(subcats);

      // 获取当前选择的子分类
      const currentSubcategoryUuid = form.getValues("subcategory_uuid");
      console.log("Current subcategory UUID:", currentSubcategoryUuid);

      // 检查当前选择的子分类是否存在于新的子分类列表中
      const subcategoryExists = subcats.some(sub => sub.uuid === currentSubcategoryUuid);
      console.log("Current subcategory exists in new subcategories:", subcategoryExists);

      if (subcategoryExists) {
        // 如果当前选择的子分类存在于新的子分类列表中，保留当前选择
        console.log("Keeping current subcategory selection:", currentSubcategoryUuid);
        form.setValue("use_new_subcategory", false);

        // 保存用户选择
        saveLastSelected(value, currentSubcategoryUuid);
      } else if (subcats.length > 0) {
        // 如果当前选择的子分类不存在于新的子分类列表中，但有子分类可选，选择第一个
        console.log("Auto-selecting first subcategory:", subcats[0].uuid);
        form.setValue("subcategory_uuid", subcats[0].uuid);
        form.setValue("use_new_subcategory", false);

        // 保存用户选择
        saveLastSelected(value, subcats[0].uuid);
      } else {
        // 如果没有子分类，重置子分类选择
        form.setValue("subcategory_uuid", "");
        form.setValue("use_new_subcategory", false);

        // 保存用户选择
        saveLastSelected(value);
      }
    } else {
      // 如果找不到分类数据，重置子分类选择
      setSubcategories([]);
      form.setValue("subcategory_uuid", "");
      form.setValue("use_new_subcategory", false);

      // 保存用户选择
      saveLastSelected(value);
    }
  };

  // 处理子分类选择
  const handleSubcategoryChange = (value: string) => {
    form.setValue("subcategory_uuid", value);
    form.setValue("use_new_subcategory", false);

    // 保存用户选择
    const categoryUuid = form.getValues("category_uuid");
    if (categoryUuid) {
      saveLastSelected(categoryUuid, value);
    }
  };

  // 切换使用新分类
  const handleUseNewCategoryChange = (checked: boolean) => {
    form.setValue("use_new_category", checked);
    if (checked) {
      setSelectedCategory(null);
      form.setValue("category_uuid", "");
      setSubcategories([]);
    }
  };

  // 切换使用新子分类
  const handleUseNewSubcategoryChange = (checked: boolean) => {
    form.setValue("use_new_subcategory", checked);
    if (checked) {
      form.setValue("subcategory_uuid", "");
    }
  };

  // 提交表单处理函数
  const handleSubmit = useCallback(async (data: z.infer<typeof quickAddBookmarkFormSchema>) => {
    if (!currentUserUuid) {
      toast.error("用户未登录");
      return;
    }

    setIsSubmitting(true);
    setSaveStage('validating');

    try {
      // 创建临时数据用于乐观更新
      let updatedCategories = [...categories];
      let categoryUuid = data.category_uuid;
      let subcategoryUuid = data.subcategory_uuid;

      // 1. 处理分类（如果需要创建新分类）
      if (data.use_new_category && data.new_category_name) {
        setSaveStage('creating-category');

        // 创建临时分类
        const tempCategory = createTempCategory({
          name: data.new_category_name,
          collection_uuid: collection.uuid,
          user_uuid: currentUserUuid
        });

        // 添加临时分类到列表
        updatedCategories = addCategoryToList(updatedCategories, tempCategory);

        // 保存临时分类UUID
        categoryUuid = tempCategory.uuid;
      }

      // 2. 处理子分类（如果需要创建新子分类）
      if (data.use_new_subcategory && data.new_subcategory_name && categoryUuid) {
        setSaveStage('creating-subcategory');

        // 创建临时子分类
        const tempSubcategory = createTempSubcategory({
          name: data.new_subcategory_name,
          category_uuid: categoryUuid,
          user_uuid: currentUserUuid
        });

        // 添加临时子分类到分类
        updatedCategories = addSubcategoryToCategory(updatedCategories, categoryUuid, tempSubcategory);

        // 保存临时子分类UUID
        subcategoryUuid = tempSubcategory.uuid;
      }

      // 3. 创建临时书签
      setSaveStage('saving-bookmark');

      if (!subcategoryUuid) {
        throw new Error("子分类UUID不能为空");
      }

      // 创建临时书签
      const tempItem = createTempBookmarkItem({
        title: data.title,
        url: data.url,
        description: data.description,
        icon_url: data.icon_url,
        subcategory_uuid: subcategoryUuid,
        user_uuid: currentUserUuid
      });

      // 添加临时书签到子分类
      if (categoryUuid) {
        updatedCategories = addItemToSubcategory(updatedCategories, categoryUuid, subcategoryUuid, tempItem);
      }

      // 执行乐观更新
      if (onOptimisticUpdate) {
        onOptimisticUpdate(updatedCategories);
      }

      // 发送请求到服务器
      const response = await fetch("/api/bookmark/quick-add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          collection_uuid: collection.uuid,
        }),
      });

      if (!response.ok) {
        throw new Error("添加书签失败");
      }

      // 立即关闭对话框（最高优先级）
      setOpen(false);

      // 将其他操作放在下一个事件循环中执行，确保不阻塞弹窗关闭
      setTimeout(() => {
        // 保存用户选择的分类和子分类
        if (categoryUuid && subcategoryUuid) {
          saveLastSelected(categoryUuid, subcategoryUuid);
        }

        // 重置表单
        form.reset();
        setSelectedCategory(null);
        setSubcategories([]);
        setSaveStage('idle');

        // 显示成功消息
        toast.success("书签添加成功");

        // 刷新数据
        router.refresh();

        // 调用成功回调
        if (onSuccess) {
          onSuccess();
        }
      }, 0);
    } catch (error) {
      console.error("添加书签失败:", error);

      // 立即关闭对话框（最高优先级）
      setOpen(false);

      // 将其他操作放在下一个事件循环中执行，确保不阻塞弹窗关闭
      setTimeout(() => {
        // 重置表单状态
        form.reset();
        setSelectedCategory(null);
        setSubcategories([]);
        setSaveStage('idle');
        setIsSubmitting(false);

        // 根据错误类型显示不同的错误消息
        if (error instanceof Error) {
          if (error.message.includes("URL")) {
            toast.error("URL格式无效");
          } else if (error.message.includes("title")) {
            toast.error("标题不能为空");
          } else if (error.message.includes("subcategory")) {
            toast.error("请选择或创建子分类");
          } else if (error.message.includes("category")) {
            toast.error("请选择或创建分类");
          } else if (error.message.includes("already exists")) {
            toast.error("该书签已存在");
          } else if (error.message.includes("network") || error.message.includes("fetch")) {
            toast.error("网络错误，请检查您的连接");
          } else {
            toast.error("添加书签失败");
          }
        } else {
          toast.error("添加书签失败");
        }

        // 如果乐观更新失败，刷新页面以恢复正确状态
        router.refresh();
      }, 0);
    }
  }, [categories, collection, currentUserUuid, form, onOptimisticUpdate, onSuccess, router, saveStage]);

  // 表单提交处理函数
  const onSubmit = useCallback((data: z.infer<typeof quickAddBookmarkFormSchema>) => {
    handleSubmit(data);
  }, [handleSubmit]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-3">
        <DialogHeader className="pb-2 mb-1 border-b">
          <DialogTitle className="text-base font-medium">添加书签到"{collection.name}"</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {/* 书签基本信息区域 */}
            <div className="space-y-2 bg-muted/10 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">标题</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="输入标题"
                          {...field}
                          className="h-8 text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          className="h-8 text-sm"
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      {/* 隐藏的图标URL生成器，只用于自动生成图标URL */}
                      <IconUrlGenerator
                        url={field.value}
                        onIconUrlGenerated={handleIconUrlGenerated}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="书签描述（可选）"
                        {...field}
                        className="resize-y min-h-[60px] text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 分类和子分类选择区域 - 合并在一行 */}
            <div className="space-y-3 bg-muted/10 p-3 rounded-md">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">
                选择分类和子分类
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* 大分类选择 */}
                <div>
                  {form.watch("use_new_category") ? (
                    <div className="flex items-center">
                      <FormField
                        control={form.control}
                        name="new_category_name"
                        render={({ field }) => (
                          <FormItem className="flex-1 mr-2 space-y-1">
                            <FormLabel className="text-xs font-medium">新分类名称</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="输入新大分类名称"
                                {...field}
                                className="h-8 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 mt-6"
                        onClick={() => {
                          form.setValue("use_new_category", false);
                          handleUseNewCategoryChange(false);
                        }}
                        title="返回选择分类"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center">
                        <FormField
                          control={form.control}
                          name="category_uuid"
                          render={({ field }) => (
                            <FormItem className="flex-1 mr-2 space-y-1">
                              <FormLabel className="text-xs font-medium">大分类</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleCategoryChange(value);
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="选择大分类" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.uuid} value={category.uuid} className="text-sm">
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 mt-6"
                          onClick={() => {
                            form.setValue("use_new_category", true);
                            handleUseNewCategoryChange(true);
                          }}
                          title="创建新分类"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <input type="hidden" {...form.register("use_new_category")} />
                </div>

                {/* 子分类选择 */}
                <div>
                  {form.watch("use_new_subcategory") ? (
                    <div className="flex items-center">
                      <FormField
                        control={form.control}
                        name="new_subcategory_name"
                        render={({ field }) => (
                          <FormItem className="flex-1 mr-2 space-y-1">
                            <FormLabel className="text-xs font-medium">新子分类名称</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="输入新子分类名称"
                                {...field}
                                className="h-8 text-sm"
                                disabled={!selectedCategory && form.watch("use_new_category") === false}
                              />
                            </FormControl>
                            {!selectedCategory && form.watch("use_new_category") === false && (
                              <p className="text-xs text-muted-foreground mt-1">请先选择或创建大分类</p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 mt-6"
                        onClick={() => {
                          form.setValue("use_new_subcategory", false);
                          handleUseNewSubcategoryChange(false);
                        }}
                        title="返回选择子分类"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center">
                        <FormField
                          control={form.control}
                          name="subcategory_uuid"
                          render={({ field }) => (
                            <FormItem className="flex-1 mr-2 space-y-1">
                              <FormLabel className="text-xs font-medium">子分类</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  console.log("Subcategory selected:", value);
                                  field.onChange(value);
                                  handleSubcategoryChange(value);
                                }}
                                value={field.value}
                                disabled={!selectedCategory}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder={
                                      selectedCategory
                                        ? "选择子分类"
                                        : "请先选择大分类"
                                    } />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {/* 渲染子分类下拉菜单 */}
                                  {subcategories.length === 0 ? (
                                    <SelectItem value="empty" disabled className="text-sm text-muted-foreground">
                                      没有可用的子分类
                                    </SelectItem>
                                  ) : (
                                    subcategories.map((subcategory) => (
                                      <SelectItem key={subcategory.uuid} value={subcategory.uuid} className="text-sm">
                                        {subcategory.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 mt-6"
                          onClick={() => {
                            form.setValue("use_new_subcategory", true);
                            handleUseNewSubcategoryChange(true);
                          }}
                          disabled={!selectedCategory && form.watch("use_new_category") === false}
                          title="创建新子分类"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      {!selectedCategory && form.watch("use_new_category") === false && (
                        <p className="text-xs text-muted-foreground mt-1">请先选择或创建大分类</p>
                      )}
                    </div>
                  )}
                  <input type="hidden" {...form.register("use_new_subcategory")} />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col pt-3 mt-1 border-t">
              <div className="flex justify-center w-full">
                {/* 添加书签按钮 */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px] flex items-center gap-1 h-9 text-sm"
                >
                  {isSubmitting && (
                    <>
                      {saveStage === 'validating' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {saveStage === 'creating-category' && <FolderPlus className="h-3 w-3" />}
                      {saveStage === 'creating-subcategory' && <FolderPlus className="h-3 w-3" />}
                      {saveStage === 'saving-bookmark' && <BookmarkPlus className="h-3 w-3" />}
                      {saveStage === 'success' && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </>
                  )}

                  {isSubmitting ? (
                    <>
                      {saveStage === 'validating' && "验证中..."}
                      {saveStage === 'creating-category' && "创建分类..."}
                      {saveStage === 'creating-subcategory' && "创建子分类..."}
                      {saveStage === 'saving-bookmark' && "保存书签..."}
                      {saveStage === 'success' && "添加成功!"}
                    </>
                  ) : (
                    "添加书签"
                  )}
                </Button>
              </div>

              {/* 成功反馈 - 居中显示 */}
              {saveStage === 'success' && (
                <div className="text-xs text-green-500 flex items-center justify-center gap-1 mt-2 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded mx-auto">
                  <CheckCircle className="h-3 w-3" />
                  <span>书签添加成功!</span>
                </div>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
