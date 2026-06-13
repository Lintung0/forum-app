export interface Author {
  id: string;
  username: string;
  avatar_url?: string;
  reputation_points: number;
  level?: number;
  bio?: string;
}

export interface Comment {
  id: string;
  body: string;
  vote_score: number;
  is_accepted: boolean;
  created_at: string;
  user?: {
    id?: string;
    username: string;
    avatar_url?: string | null;
  };
}

export interface PostDetail {
  id: string;
  title: string;
  body: string;
  vote_score: number;
  view_count: number;
  created_at: string;
  user: Author;
  comments: Comment[];
  is_answered?: boolean;

  category?: {
    name: string;
    slug: string;
  };

  tags?: {
    id: string;
    name: string;
    color: string;
  }[];
}