import CreatePostView from "./CreatePostView";
import { LaravelApiResponse, CategoryOption, TagOption } from "./type";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

// Fetch Kategori dari Laravel
async function getCategories(): Promise<CategoryOption[]> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/v1/categories`, {
      next: { revalidate: 3600 } // Cache data selama 1 jam
    });
    
    if (!res.ok) return [];
    
    const result: LaravelApiResponse<CategoryOption[]> = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Gagal mengambil kategori:", error);
    return [];
  }
}

// Fetch Tags dari Laravel
async function getTags(): Promise<TagOption[]> {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/v1/tags`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    
    const result: LaravelApiResponse<TagOption[]> = await res.json();
    return result.data || [];
  } catch (error) {
    console.error("Gagal mengambil tags:", error);
    return [];
  }
}

export default async function CreatePostPage() {
  // Ambil kedua data secara paralel dari database Laravel
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags()
  ]);

  return (
    <div className="w-full min-h-screen p-6">
      {/* Kirim data asli kategori & tags ke client view */}
      <CreatePostView categories={categories} initialTags={tags} />
    </div>
  );
}