import api from '@/lib/axios';

export const fetchNotificationsApi = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markAsReadApi = async (id: string) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsReadApi = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};
export const deleteNotificationApi = async (id: string) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};