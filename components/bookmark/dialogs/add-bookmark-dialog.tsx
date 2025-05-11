import { useState, useEffect } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetadataFetcher } from "@/components/bookmark/shared/metadata-fetcher";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BookmarkCategoryWithSubcategories } from "@/types/bookmark/category";
import { BookmarkSubcategoryWithItems } from "@/types/bookmark/subcategory";
import { BookmarkCollection } from "@/types/bookmark/collection";

// 表单验证模式
const bookmarkFormSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  url: z.string().url("请输入有效的URL"),
  category_uuid: z.string().min(1, "请选择或创建大分类"),
  subcategory_uuid: z.string().min(1, "请选择或创建子分类"),
  icon_url: z.string().optional(),
});

// 新分类表单验证模式
const categoryFormSchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
});

// 新子分类表单验证模式
const subcategoryFormSchema = z.object({
  name: z.string().min(1, "子分类名称不能为空"),
});

type AddBookmarkDialogProps = {
  collection: BookmarkCollection;
  categories: BookmarkCategoryWithSubcategories[];
  onSuccess?: () => void;
  children?: React.ReactNode;
};

export function AddBookmarkDialog({
  collection,
  categories,
  onSuccess,
  children,
}: AddBookmarkDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<BookmarkSubcategoryWithItems[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [urlChanged, setUrlChanged] = useState(false);

  // 书签表单
  const bookmarkForm = useForm<z.infer<typeof bookmarkFormSchema>>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      title: "",
      url: "",
      category_uuid: "",
      subcategory_uuid: "",
      icon_url: "",
    },
  });

  // 分类表单
  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // 子分类表单
  const subcategoryForm = useForm<z.infer<typeof subcategoryFormSchema>>({
    resolver: zodResolver(subcategoryFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // 当选择的大分类变化时，加载对应的子分类
  useEffect(() => {
    if (selectedCategory) {
      // 从已有的分类数据中查找选中的分类
      const selectedCategoryData = categories.find(cat => cat.uuid === selectedCategory);
      if (selectedCategoryData) {
        // 直接使用分类中的子分类数据
        setSubcategories(selectedCategoryData.subcategories || []);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  // 处理分类选择
  const handleCategoryChange = (value: string) => {
    if (value === "create-new") {
      setIsCreatingCategory(true);
      bookmarkForm.setValue("category_uuid", "");
    } else {
      setSelectedCategory(value);
      bookmarkForm.setValue("category_uuid", value);
      setIsCreatingCategory(false);
    }
    // 重置子分类选择
    bookmarkForm.setValue("subcategory_uuid", "");
  };

  // 处理子分类选择
  const handleSubcategoryChange = (value: string) => {
    if (value === "create-new") {
      setIsCreatingSubcategory(true);
      bookmarkForm.setValue("subcategory_uuid", "");
    } else {
      bookmarkForm.setValue("subcategory_uuid", value);
      setIsCreatingSubcategory(false);
    }
  };

  // 处理元数据获取结果
  const handleMetadataFetched = (metadata: {
    title?: string;
    icon_url?: string;
  }) => {
    if (metadata.title && !bookmarkForm.getValues("title")) {
      bookmarkForm.setValue("title", metadata.title);
    }
    if (metadata.icon_url) {
      bookmarkForm.setValue("icon_url", metadata.icon_url);
    }
    setUrlChanged(false);
  };

  // 创建新分类
  const handleCreateCategory = async (data: z.infer<typeof categoryFormSchema>) => {
    try {
      const response = await fetch("/api/bookmark/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          collection_uuid: collection.uuid,
        }),
      });

      if (!response.ok) {
        throw new Error("创建分类失败");
      }

      const newCategory = await response.json();
      setSelectedCategory(newCategory.uuid);
      bookmarkForm.setValue("category_uuid", newCategory.uuid);
      setIsCreatingCategory(false);
      toast.success("分类创建成功");

      // 重置表单
      categoryForm.reset();

      // 刷新分类列表
      router.refresh();
    } catch (error) {
      console.error("创建分类失败:", error);
      toast.error("创建分类失败");
    }
  };

  // 创建新子分类
  const handleCreateSubcategory = async (data: z.infer<typeof subcategoryFormSchema>) => {
    if (!selectedCategory) {
      toast.error("请先选择或创建大分类");
      return;
    }

    try {
      const response = await fetch("/api/bookmark/subcategories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          category_uuid: selectedCategory,
        }),
      });

      if (!response.ok) {
        throw new Error("创建子分类失败");
      }

      const newSubcategory = await response.json();
      bookmarkForm.setValue("subcategory_uuid", newSubcategory.uuid);
      setIsCreatingSubcategory(false);
      toast.success("子分类创建成功");

      // 重置表单
      subcategoryForm.reset();

      // 刷新页面以获取最新数据
      router.refresh();
    } catch (error) {
      console.error("创建子分类失败:", error);
      toast.error("创建子分类失败");
    }
  };

  // 提交书签
  const onSubmitBookmark = async (data: z.infer<typeof bookmarkFormSchema>) => {
    try {
      const response = await fetch("/api/bookmark/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          url: data.url,
          subcategory_uuid: data.subcategory_uuid,
          icon_url: data.icon_url || "",
        }),
      });

      if (!response.ok) {
        throw new Error("添加书签失败");
      }

      toast.success("书签添加成功");
      setOpen(false);

      // 先调用成功回调，确保状态更新
      if (onSuccess) {
        onSuccess();
      }

      // 延迟刷新数据，避免状态丢失
      setTimeout(() => {
        // 刷新数据，但不重置状态
        router.refresh();
      }, 100);

      // 最后再重置表单状态
      setTimeout(() => {
        bookmarkForm.reset();
        setSelectedCategory(null);
        setSubcategories([]);
      }, 500);
    } catch (error) {
      console.error("添加书签失败:", error);
      toast.error("添加书签失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>添加书签</DialogTitle>
          <DialogDescription>
            添加新书签到集合"{collection.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">大分类</div>
            {isCreatingCategory ? (
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(handleCreateCategory)} className="space-y-4">
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>分类名称</FormLabel>
                        <FormControl>
                          <Input placeholder="输入分类名称" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2">
                    <Button type="submit">创建分类</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatingCategory(false)}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Select onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择大分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.uuid} value={category.uuid}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="create-new">+ 创建新分类</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">子分类</div>
            {isCreatingSubcategory ? (
              <Form {...subcategoryForm}>
                <form onSubmit={subcategoryForm.handleSubmit(handleCreateSubcategory)} className="space-y-4">
                  <FormField
                    control={subcategoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>子分类名称</FormLabel>
                        <FormControl>
                          <Input placeholder="输入子分类名称" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={!selectedCategory}
                    >
                      创建子分类
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatingSubcategory(false)}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Select
                onValueChange={handleSubcategoryChange}
                disabled={!selectedCategory || subcategories.length === 0 && !selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCategory ? "选择子分类" : "请先选择大分类"} />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.uuid} value={subcategory.uuid}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="create-new">+ 创建新子分类</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <Form {...bookmarkForm}>
            <form onSubmit={bookmarkForm.handleSubmit(onSubmitBookmark)} className="space-y-4">
              <FormField
                control={bookmarkForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>书签标题</FormLabel>
                    <FormControl>
                      <Input placeholder="输入书签标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bookmarkForm.control}
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
                    {/* 隐藏的元数据获取器，只用于自动获取数据 */}
                    <MetadataFetcher
                      url={field.value}
                      onMetadataFetched={handleMetadataFetched}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <input type="hidden" {...bookmarkForm.register("icon_url")} />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!bookmarkForm.getValues("subcategory_uuid")}
                >
                  添加书签
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
