export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  reputation_points: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  vote_score: number;
  view_count: number;
  created_at: string;
  user?: User; // Dijadikan opsional (?) jaga-jaga kalau data di DB kosong
}