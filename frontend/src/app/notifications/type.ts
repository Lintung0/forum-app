export type NotificationCategory = 'semua' | 'balasan' | 'suka' | 'sebutan' | 'pengikut' | 'solusi' | 'sistem' | 'belum_dibaca';

export interface Notification {
  id: string;
  type: Exclude<NotificationCategory, 'semua' | 'belum_dibaca'>;
  user: string;
  actionText: string;
  targetTitle: string;
  timeAgo: string;
  isRead: boolean;
}