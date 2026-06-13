export interface UserProfileData {
    id: string;
    username: string;
    email?: string;
    avatar_url: string | null;
    bio: string | null;
    reputation_points: number;
    level: number;
    created_at: string;
    posts_count: number;
    comments_count?: number;
    accepted_answers_count?: number;
    followers_count?: number;
    following_count?: number;
}

export interface UserActivityPost {
    id: string;
    title: string;
    slug: string;
    vote_score: number;
    created_at: string;
    category: {
        name: string;
        slug: string;
    };
}

export interface UserActivityComment {
    id: string;
    post_id: string;
    post_title: string;
    body: string;
    vote_score: number;
    is_accepted: boolean;
    created_at: string;
}

export interface ProfileApiResponse {
    success: boolean;
    message: string;
    data: {
        user: UserProfileData;
        recent_posts: UserActivityPost[];
        recent_comments: UserActivityComment[];
    };
}