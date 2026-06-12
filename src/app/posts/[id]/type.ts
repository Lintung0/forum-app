export interface Author {
  id: string;
  username: string;
  avatar_url?: string;
  reputation_points: number;
  bio?: string;
}

export interface Comment {
  id: string;
  body: string;
  vote_score: number;
  is_accepted: boolean;
  created_at: string;
  user: {
    username: string;
    avatar_url?: string;
  };
}

export interface PostDetail {
  id: string;
  title: string;
  body: string;
  vote_score: number;
  view_count: number;
  created_at: string;
  user: Author; // Relasi ke pencipta post (Author)
  comments: Comment[]; // Relasi ke daftar komentar
}