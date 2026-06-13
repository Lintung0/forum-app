'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Share2, Flag, ShieldCheck, Trash2, Edit2, X, Check } from 'lucide-react';
import { Comment } from '../type';
import { VoteBlock } from './vote-block';

interface CommentItemProps {
  comment: Comment;
  idx: number;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, newBody: string) => void;
}

export function CommentItem({ comment, idx, onDeleteComment, onEditComment }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  // useEffect agar tidak hydration mismatch
  const [isMyComment, setIsMyComment] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    const currentUser = stored ? JSON.parse(stored) : null;
    setIsMyComment(currentUser?.id === comment.user?.id);
  }, [comment.user?.id]);

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    onEditComment(comment.id, editText);
    setIsEditing(false);
  };

  // FIX LOGIC: Validasi jalur URL profile agar tidak menghasilkan '/profile/undefined'
  const profileHref = comment.user?.username ? `/profile/${comment.user.username}` : '#';

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
        </div>

        {/* Konten Utama */}
        <div className="flex-1 p-4 space-y-2.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">

            {/* Avatar — klik ke profile (Aman dari undefined) */}
            <Link href={profileHref}>
              <Avatar className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity border border-transparent hover:border-[#e95723]/40">
                <AvatarImage src={comment.user?.avatar_url ?? undefined} />
                <AvatarFallback className="text-[9px] bg-[#2c323f] text-gray-300 font-bold">
                  {comment.user?.username?.[0]?.toUpperCase() ?? 'C'}
                </AvatarFallback>
              </Avatar>
            </Link>

            {/* Username — klik ke profile (Aman dari undefined) */}
            <Link
              href={profileHref}
              className="text-xs font-semibold text-gray-300 hover:text-[#e95723] transition-colors"
            >
              @{comment.user?.username ?? 'user'}
            </Link>

            <span className="text-[10px] text-gray-500 tabular-nums font-normal">• #{idx + 1}</span>

            {comment.is_accepted && (
              <div className="flex items-center gap-1 ml-auto bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-semibold tracking-wide">
                <ShieldCheck className="h-3 w-3" />
                Accepted Answer
              </div>
            )}
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
                  onClick={() => setIsEditing(false)}
                  className="h-7 text-[11px] border-[#2c323f] bg-transparent text-gray-400 hover:bg-[#1e222b] px-2"
                >
                  <X className="h-3 w-3 mr-1" /> Cancel
                </Button>
                <Button
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
            <button className="hover:text-gray-300 transition-colors flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Reply
            </button>
            <button className="hover:text-gray-300 transition-colors flex items-center gap-1">
              <Share2 className="h-3 w-3" /> Share
            </button>
            <button className="hover:text-gray-300 transition-colors flex items-center gap-1">
              <Flag className="h-3 w-3" /> Report
            </button>

            {isMyComment && !isEditing && (
              <div className="flex items-center gap-2 ml-auto border-l border-[#1e222b] pl-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-0.5"
                >
                  <Edit2 className="h-2.5 w-2.5" /> Edit
                </button>
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  className="text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-0.5"
                >
                  <Trash2 className="h-2.5 w-2.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}