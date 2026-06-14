export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  posts_count?: number;
  color?: string;
}