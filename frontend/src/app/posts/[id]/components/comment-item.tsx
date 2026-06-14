'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Share2, ShieldCheck, Trash2, Edit2, X, Check, MoreVertical, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Comment } from '../type';
import { VoteBlock } from './vote-block';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

interface CommentItemProps {
  comment: Comment;
  idx: number;
  postId: string;
  postOwnerId: string;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, newBody: string) => void;
  onAcceptAnswer: (commentId: string, accepted: boolean) => void;
}

export function CommentItem({
  comment,
  idx,
  postId,
  postOwnerId,
  onDeleteComment,
  onEditComment,
  onAcceptAnswer,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
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
      className={`bg-[#13151a] border rounded-xl overflow-hidden transition-colors w-full ${
        comment.is_accepted
          ? 'border-emerald-500/30 bg-emerald-950/10'
          : 'border-[#1e222b] hover:border-[#2c323f]'
      }`}
    >
      <div className="flex">
        {/* Kolom Vote */}
        <div className="flex flex-col items-center bg-[#0f1115] px-2 py-3 border-r border-[#1e222b]">
          <VoteBlock score={comment.vote_score ?? 0} />

          {/* Tombol Accept Answer — di bawah vote, hanya untuk post owner */}
          {canAccept && (
            <button
              type="button"
              onClick={handleAcceptAnswer}
              disabled={loadingAccept}
              title={comment.is_accepted ? 'Batalkan jawaban' : 'Tandai sebagai jawaban'}
              className={`mt-2 p-1 rounded transition-colors disabled:opacity-50 ${
                comment.is_accepted
                  ? 'text-emerald-400 hover:text-gray-400'
                  : 'text-gray-600 hover:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Konten Utama */}
        <div className="flex-1 p-4 space-y-2.5 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <Avatar className="w-5 h-5">
              <AvatarImage src={comment.user?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[9px] bg-[#2c323f] text-gray-300 font-bold">
                {comment.user?.username?.[0]?.toUpperCase() ?? 'C'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold text-gray-300">
              @{comment.user?.username ?? 'user'}
            </span>
            <span className="text-[10px] text-gray-500 tabular-nums font-normal">• #{idx + 1}</span>

            {comment.is_accepted && (
              <div className="flex items-center gap-1 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-semibold tracking-wide">
                <ShieldCheck className="h-3 w-3" />
                Accepted Answer
              </div>
            )}

            {/* Dropdown titik 3 */}
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-white hover:bg-[#22252e] rounded-md"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-36 bg-[#13151a] border border-[#1e222b] text-gray-300 p-1"
                >
                  {isMyComment ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => setIsEditing(true)}
                        className="gap-2 text-xs py-1.5 cursor-pointer focus:bg-[#e95723] focus:text-white"
                      >
                        <Edit2 className="h-3 w-3" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          await onDeleteComment(comment.id);
                        }}
                        className="gap-2 text-xs py-1.5 text-red-500 cursor-pointer focus:bg-red-950/40 focus:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" /> Hapus
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleReport}
                      className="gap-2 text-xs py-1.5 text-yellow-500 cursor-pointer focus:bg-yellow-950/30 focus:text-yellow-400"
                    >
                      <AlertTriangle className="h-3 w-3" /> Laporkan
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Area Teks / Input Mode Edit */}
          {isEditing ? (
            <div className="space-y-2 pt-1">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="bg-[#0f1115] border-[#2c323f] text-sm text-gray-200 resize-none focus-visible:ring-[#e95723]/40 focus-visible:border-[#e95723]/60 rounded-lg min-h-[60px]"
              />
              <div className="flex gap-1.5 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setIsEditing(false); setEditText(comment.body); }}
                  className="h-7 text-[11px] border-[#2c323f] bg-transparent text-gray-400 hover:bg-[#1e222b] px-2"
                >
                  <X className="h-3 w-3 mr-1" /> Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveEdit}
                  className="h-7 text-[11px] bg-[#e95723] hover:bg-[#d44e1f] text-white px-2"
                >
                  <Check className="h-3 w-3 mr-1" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-300 font-normal leading-relaxed whitespace-pre-line">
              {comment.body}
            </p>
          )}

          {/* Tombol Aksi Bawah */}
          <div className="flex items-center gap-3 text-[10px] font-medium text-gray-500 pt-0.5 tracking-wide">
            <button type="button" className="hover:text-gray-300 transition-colors flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Reply
            </button>
            <button type="button" className="hover:text-gray-300 transition-colors flex items-center gap-1">
              <Share2 className="h-3 w-3" /> Share
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}