export type NotificationType =
  | 'new_comment'
  | 'new_reply'
  | 'new_upvote'
  | 'answer_accepted'
  | 'new_follower';

export interface NotificationActor {
  id: string;
  username: string;
  avatar_url: string | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  is_read: boolean;
  reference_id: string;
  reference_type: string;
  actor: NotificationActor;
  created_at: string;
}

export interface NotificationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface NotificationsApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Notification[];
    meta: NotificationMeta;
  };
}
