import CreatePostView from './CreatePostView';
import { CategoryOption, TagOption } from './type';

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export default async function CreatePostPage() {
  let categories: CategoryOption[] = [];
  let initialTags: TagOption[] = [];

  try {
    const [resCat, resTags] = await Promise.all([
      fetch(`${API}/api/v1/categories`, { cache: 'no-store' }),
      fetch(`${API}/api/v1/tags`, { cache: 'no-store' }),
    ]);

    if (resCat.ok) {
      const json = await resCat.json();
      categories = json.data ?? [];
    }
    if (resTags.ok) {
      const json = await resTags.json();
      initialTags = json.data ?? [];
    }
  } catch {
    
  }

  return <CreatePostView categories={categories} initialTags={initialTags} />;
}
