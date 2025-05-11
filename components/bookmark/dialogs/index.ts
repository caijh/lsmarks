import dynamic from 'next/dynamic';

// 动态导入对话框组件
export const CollectionFormDialog = dynamic(
  () => import('./collection-form').then(mod => ({ default: mod.CollectionFormDialog })),
  {
    loading: () => null,
    ssr: false
  }
);

export const CategoryFormDialog = dynamic(
  () => import('./category-form').then(mod => ({ default: mod.CategoryFormDialog })),
  {
    loading: () => null,
    ssr: false
  }
);

export const SubcategoryFormDialog = dynamic(
  () => import('./subcategory-form').then(mod => ({ default: mod.SubcategoryFormDialog })),
  {
    loading: () => null,
    ssr: false
  }
);

export const ItemFormDialog = dynamic(
  () => import('./item-form').then(mod => ({ default: mod.ItemFormDialog })),
  {
    loading: () => null,
    ssr: false
  }
);

export const QuickAddBookmarkDialog = dynamic(
  () => import('./quick-add-bookmark-dialog').then(mod => ({ default: mod.QuickAddBookmarkDialog })),
  {
    loading: () => null,
    ssr: false
  }
);

export const DeleteConfirmationDialog = dynamic(
  () => import('./delete-confirmation').then(mod => ({ default: mod.DeleteConfirmationDialog })),
  {
    loading: () => null,
    ssr: false
  }
);

export const AddBookmarkDialog = dynamic(
  () => import('./add-bookmark-dialog').then(mod => ({ default: mod.AddBookmarkDialog })),
  {
    loading: () => null,
    ssr: false
  }
);
