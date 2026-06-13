export interface BookmarkedPost {
  id: string;
  title: string;
  slug: string;
  body: string;
  vote_score: number;
  view_count: number;
  comments_count: number;
  is_answered: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: { name: string; slug: string }[];
}

export interface Bookmark {
  id: string;
  post_id: string;
  created_at: string;
  post: BookmarkedPost;
}

export interface BookmarksMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface BookmarksApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Bookmark[];
    meta: BookmarksMeta;
  };
}
