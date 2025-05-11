import dynamic from 'next/dynamic';

// 动态导入表单组件
export const BookmarkCollectionForm = dynamic(
  () => import('../collections/form').then(mod => ({ default: mod.BookmarkCollectionForm })),
  {
    loading: () => null,
    ssr: false
  }
);

export const BookmarkItemForm = dynamic(
  () => import('../items/form').then(mod => ({ default: mod.BookmarkItemForm })),
  {
    loading: () => null,
    ssr: false
  }
);

export const SignForm = dynamic(
  () => import('../../sign/form'),
  {
    loading: () => null,
    ssr: false
  }
);
