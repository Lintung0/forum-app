import api from '@/lib/axios';

export interface ReportRequest {
  target_id: string;
  target_type: 'post' | 'comment' | 'user';
  reason: string;
  description?: string;
}

export const createReportApi = async (data: ReportRequest) => {
  const response = await api.post('/reports', data);
  return response.data;
};
