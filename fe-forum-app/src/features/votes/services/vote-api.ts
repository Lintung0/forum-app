import api from '@/lib/axios';

export type VoteType = 'upvote' | 'downvote';
export type TargetType = 'post' | 'comment';

export interface VoteResponse {
  success: boolean;
  message: string;
  data: {
    vote_score: number;
  };
}

export const voteApi = async (targetId: string, targetType: TargetType, voteType: VoteType): Promise<VoteResponse> => {
  const response = await api.post('/votes', {
    target_id: targetId,
    target_type: targetType,
    vote_type: voteType,
  });
  return response.data;
};

export const removeVoteApi = async (voteId: string): Promise<VoteResponse> => {
  const response = await api.delete(`/votes/${voteId}`);
  return response.data;
};
