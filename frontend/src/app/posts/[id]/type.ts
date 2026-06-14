  export interface Author {
    id: string;
    username: string;
    avatar_url?: string;
    reputation_points: number;
    level?: number;
    bio?: string;
    accepted_answers_count?: number;
    posts_count?: number;
  }

  export type PostAuthor = Author;

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
    user_vote?: 'upvote' | 'downvote' | null;
    is_bookmarked?: boolean;
    bookmark_id?: string | null;
    comments_count?: number;

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