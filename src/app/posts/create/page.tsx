import CreatePostView from './CreatePostView';
import { CategoryOption, TagOption } from './type';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

export default async function CreatePostPage() {
  let categories: CategoryOption[] = [];
  let initialTags: TagOption[] = [];

  try {
    const [resCat, resTags] = await Promise.all([
      fetch(`${BACKEND_API_URL}/api/v1/categories`, { cache: 'no-store' }),
      fetch(`${BACKEND_API_URL}/api/v1/tags`, { cache: 'no-store' }),
    ]);

    if (resCat.ok) {
      const json = await resCat.json();
      categories = json.data ?? [];
    }

    if (resTags.ok) {
      const json = await resTags.json();
      initialTags = json.data ?? [];
    }
  } catch (err) {
    console.error('Gagal fetch categories/tags:', err);
  }

  return <CreatePostView categories={categories} initialTags={initialTags} />;
}
