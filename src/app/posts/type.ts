export interface UserSummary {
  username: string;
  avatar_url?: string | null;
  reputation_points: number;
  level: number;
}

export interface CategorySummary {
  name: string;
  slug: string;
}

export interface TagSummary {
  id: string;
  name: string;
  color: string;
}

export interface PostSummary {
  id: string;
  title: string;
  body: string;
  status: string;
  vote_score: number;
  view_count: number;
  is_answered: boolean;
  comments_count: number;
  user?: UserSummary;
  category?: CategorySummary;
  tags?: TagSummary[];
  created_at: string;
}