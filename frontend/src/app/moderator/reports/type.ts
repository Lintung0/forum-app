export interface ReportItemData {
  id: string;
  reporter_name: string;
  reason: string;
  reported_type: string;
  content_preview: string;
  status: 'pending' | 'resolved' | string;
}
