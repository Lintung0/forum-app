// 1. Data yang akan dikirim ke Backend Laravel (API Request Payload)
export interface CreatePostInput {
  title: string;
  body: string;
  category_id: string; // UUID Kategori dari dropdown
  tags: string[];      // FIX: Array berisi UUID Tag hasil select multi-badge di UI
}

// 2. Tipe data Kategori yang didapat dari GET v1/categories
export interface CategoryOption {
  id: string;          // UUID
  name: string;        // Contoh: 'Web Development'
  slug: string;        // Contoh: 'web-development'
  description?: string;
}

// 3. Tipe data Tag yang didapat dari GET v1/tags
export interface TagOption {
  id: string;          // UUID
  name: string;        // Contoh: 'Laravel'
  slug: string;        // Contoh: 'laravel'
}

// 4. Struktur standard format JSON response dari Laravel Controller
export interface LaravelApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null; // Menangani error validasi form Laravel
}

// 5. Detail data Post setelah sukses disimpan di Laravel
export interface CreatedPostData {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  body: string;
  status: 'open' | 'closed';
  vote_score: number;
  view_count: number;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
}