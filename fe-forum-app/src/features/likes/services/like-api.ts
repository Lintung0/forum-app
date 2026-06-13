import api from '@/lib/axios';

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    liked: boolean;
    likes_count: number;
  };
}

export const toggleLikePostApi = async (postId: string): Promise<LikeResponse> => {
  const response = await api.post(`/posts/${postId}/likes`, {
    target_id: postId,
    target_type: 'post',
  });
  return response.data;
};

export const toggleLikeCommentApi = async (postId: string, commentId: string): Promise<LikeResponse> => {
  const response = await api.post(`/posts/${postId}/comments/${commentId}/likes`, {
    target_id: commentId,
    target_type: 'comment',
  });
  return response.data;
};
