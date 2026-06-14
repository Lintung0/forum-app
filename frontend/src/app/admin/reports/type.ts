export interface ReportItemData {
  id: string;
  reporter_name: string;
  reason: string;
  reported_type: 'post' | 'comment';
  content_preview: string; 
  status: 'pending' | 'resolved';
  created_at?: string;
}