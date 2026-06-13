import api from '@/lib/axios';

export const fetchBookmarksApi = async () => {
  const response = await api.get('/bookmarks');
  return response.data;
};

export const addBookmarkApi = async (postId: string) => {
  const response = await api.post('/bookmarks', { post_id: postId });
  return response.data;
};

export const removeBookmarkApi = async (bookmarkId: string) => {
  const response = await api.delete(`/bookmarks/${bookmarkId}`);
  return response.data;
};