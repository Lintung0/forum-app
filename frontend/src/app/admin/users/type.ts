export interface UserItemData {
  id: string;
  username?: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  is_banned: boolean;
  posts_count?: number;
  created_at?: string;
}