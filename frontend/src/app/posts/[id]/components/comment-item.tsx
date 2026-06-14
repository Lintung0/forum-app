'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, ShieldCheck, Trash2, Edit2, X, Check, MoreVertical, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Comment } from '../type';
import { VoteBlock } from './vote-block';
import { ReplyInput } from './reply-input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

interface CommentItemProps {
  comment: Comment;
  idx: number;
  postId: string;
  postOwnerId: string;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, newBody: string) => void;
  onAcceptAnswer: (commentId: string, accepted: boolean) => void;
  onPostReply?: (text: string, parentId: string) => Promise<boolean>;
  isReply?: boolean;
}

export function CommentItem({
  comment,
  idx,
  postId,
  postOwnerId,
  onDeleteComment,
  onEditComment,
  onAcceptAnswer,
  onPostReply,
  isReply = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingAccept, setLoadingAccept] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUserId(parsed?.id ? String(parsed.id) : null);
      }
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  const isMyComment = currentUserId !== null && String(comment.user?.id) === currentUserId;
  const isPostOwner = currentUserId !== null && String(postOwnerId) === currentUserId;
  const canAccept = isPostOwner && !isMyComment;

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    onEditComment(comment.id, editText);
    setIsEditing(false);
  };

  const handleAcceptAnswer = async () => {
    if (loadingAccept) return;
    setLoadingAccept(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `${BACKEND_URL}/api/v1/posts/${postId}/accept-answer/${comment.id}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        onAcceptAnswer(comment.id, !comment.is_accepted);
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.message || 'Gagal menandai jawaban.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoadingAccept(false);
    }
  };

  const handleReport = async () => {
    if (!confirm('Laporkan komentar ini sebagai konten tidak pantas?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/v1/reports`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_type: 'comment',
          target_id: comment.id,
          reason: 'Konten tidak pantas',
        }),
      });
      if (res.ok) {
        alert('Komentar berhasil dilaporkan. Terima kasih!');
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.message || 'Gagal melaporkan komentar.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <Card
      className={`bg-[#13151a] border rounded-2xl overflow-hidden transition-all duration-300 w-full shadow-lg ${
        comment.is_accepted
          ? 'border-emerald-500/40 bg-emerald-500/[0.03] shadow-emerald-500/5'
          : 'border-[#1e222b] hover:border-[#2c323f] hover:bg-[#16181d]'
      }`}
    >
      <div className="flex">
        {}
        <div className="flex flex-col items-center bg-[#1a1d24]/30 px-3 py-4 border-r border-[#1e222b] gap-2">
          <VoteBlock score={comment.vote_score ?? 0} />

          {}
          {canAccept && (
            <button
              type="button"
              onClick={handleAcceptAnswer}
              disabled={loadingAccept}
              title={comment.is_accepted ? 'Batalkan jawaban' : 'Tandai sebagai jawaban'}
              className={`p-1.5 rounded-lg transition-all border border-transparent disabled:opacity-50 ${
                comment.is_accepted
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:text-gray-400 hover:bg-gray-500/10 hover:border-gray-500/20'
                  : 'text-gray-600 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {}
        <div className="flex-1 p-5 md:p-6 space-y-4 min-w-0">
          {}
          <div className="flex items-center gap-3 flex-wrap">
            <Avatar className="w-6 h-6 border border-[#2c323f]">
              <AvatarImage src={comment.user?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px] bg-[#2c323f] text-gray-300 font-black">
                {comment.user?.username?.[0]?.toUpperCase() ?? 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-gray-200 leading-none">
                @{comment.user?.username ?? 'user'}
              </span>
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tight mt-0.5">Contributor</span>
            </div>
            
            <span className="text-[10px] text-gray-700 font-black">• #{idx + 1}</span>

            {comment.is_accepted && (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] text-emerald-400 font-black tracking-widest uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                Accepted Solution
              </div>
            )}

            {}
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-white hover:bg-[#22252e] rounded-lg transition-all"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-[#13151a] border border-[#1e222b] text-gray-300 p-1 rounded-xl shadow-2xl"
                >
                  {isMyComment ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => setIsEditing(true)}
                        className="gap-2 text-[11px] font-bold py-2 px-3 cursor-pointer focus:bg-[#e95723] focus:text-white rounded-lg"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit Response
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          await onDeleteComment(comment.id);
                        }}
                        className="gap-2 text-[11px] font-bold py-2 px-3 text-red-500 cursor-pointer focus:bg-red-950/40 focus:text-red-400 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Response
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleReport}
                      className="gap-2 text-[11px] font-bold py-2 px-3 text-yellow-500 cursor-pointer focus:bg-yellow-950/30 focus:text-yellow-400 rounded-lg"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> Report Response
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {}
          {isEditing ? (
            <div className="space-y-3 pt-1">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-[#0f1115] border-[#2c323f] text-sm text-gray-200 resize-none focus-visible:ring-[#e95723]/40 focus-visible:border-[#e95723]/60 rounded-xl min-h-[100px] p-4"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setIsEditing(false); setEditText(comment.body); }}
                  className="h-8 text-[11px] font-bold border-[#2c323f] bg-transparent text-gray-400 hover:bg-[#1e222b] px-4 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveEdit}
                  className="h-8 text-[11px] font-bold bg-[#e95723] hover:bg-[#d44e1f] text-white px-4 rounded-lg shadow-lg shadow-[#e95723]/20"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <div 
                className="text-[14px] text-gray-300 font-normal leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: comment.body }}
              />
            </div>
          )}

          {}
          {!isEditing && (
            <div className="flex items-center gap-4 text-[11px] font-black text-gray-600 pt-2 tracking-widest uppercase">
              {!isReply && onPostReply && (
                <button 
                  type="button" 
                  onClick={() => setIsReplying(!isReplying)}
                  className={cn(
                    "hover:text-[#e95723] transition-all flex items-center gap-2 group",
                    isReplying && "text-[#e95723]"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" /> {isReplying ? 'Cancel Reply' : 'Reply'}
                </button>
              )}
            </div>
          )}

          {}
          {isReplying && onPostReply && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <ReplyInput 
                onPostResponse={async (text) => {
                  const success = await onPostReply(text, comment.id);
                  if (success) setIsReplying(false);
                  return success;
                }} 
              />
            </div>
          )}

          {}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#1e222b] mt-4">
              {comment.replies.map((reply, ridx) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  idx={ridx}
                  postId={postId}
                  postOwnerId={postOwnerId}
                  onDeleteComment={onDeleteComment}
                  onEditComment={onEditComment}
                  onAcceptAnswer={onAcceptAnswer}
                  onPostReply={onPostReply}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}