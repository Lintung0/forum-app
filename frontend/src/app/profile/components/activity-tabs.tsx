'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { UserActivityPost, UserActivityComment } from '../type';
import {
  MessageSquare, FileText, ChevronRight, CheckCircle2,
  MoreVertical, Edit2, Trash2,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

interface ActivityTabsProps {
  type: 'posts' | 'comments';
  items: any[];
  isOwner?: boolean;
  onDelete?: (postId: string) => void;
}

export function ActivityTabs({ type, items, isOwner = false, onDelete }: ActivityTabsProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {
    if (!confirm('Hapus diskusi ini?')) return;

    setDeletingId(postId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${BACKEND_URL}/api/v1/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        onDelete?.(postId);
      } else {
        const json = await res.json().catch(() => ({}));
        alert(json.message || `Gagal menghapus (status ${res.status})`);
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setDeletingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-500 italic">
        Belum ada riwayat aktivitas pada kategori ini.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {type === 'posts' ? (
        (items as UserActivityPost[]).map((post) => (
          <div
            key={post.id}
            className={`relative mb-2 ${deletingId === post.id ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {}
            <Link href={`/posts/${post.id}`} className="block">
              <Card className="bg-[#13151a] border border-[#1e222b] hover:border-[#2c323f] p-4 flex items-center justify-between transition-all group rounded-xl pr-10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-[#16181d] border border-[#22252e] text-[#e95723] rounded-lg">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors truncate pr-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1 font-medium">
                      {post.category?.name && (
                        <span className="text-[#e95723]/80 bg-[#e95723]/5 px-1.5 py-0.5 rounded border border-[#e95723]/10">
                          {post.category.name}
                        </span>
                      )}
                      <span>•</span>
                      <span className="tabular-nums">{post.vote_score} votes</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all ml-2 flex-shrink-0" />
              </Card>
            </Link>

            {}
            {isOwner && (
              <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-500 hover:text-white hover:bg-[#22252e] rounded-md"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-36 bg-[#13151a] border border-[#1e222b] text-gray-300 p-1"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/posts/${post.id}/edit`);
                      }}
                      className="gap-2 text-xs py-1.5 cursor-pointer focus:bg-[#e95723] focus:text-white"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(post.id);
                      }}
                      className="gap-2 text-xs py-1.5 text-red-500 cursor-pointer focus:bg-red-950/40 focus:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ))
      ) : (
        (items as UserActivityComment[]).map((comment) => (
          <Link key={comment.id} href={`/posts/${comment.post_id}`}>
            <Card className="bg-[#13151a] border border-[#1e222b] hover:border-[#2c323f] p-4 flex flex-col space-y-2 transition-all group rounded-xl mb-2 text-left">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold truncate max-w-[85%]">
                  <MessageSquare className="h-3 w-3 text-gray-500" />
                  <span>Membalas pada:</span>
                  <span className="text-gray-300 underline font-semibold truncate group-hover:text-white">
                    {comment.post_title}
                  </span>
                </div>
                {comment.is_accepted && (
                  <div className="flex items-center gap-0.5 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Solusi
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 font-normal line-clamp-2 leading-relaxed bg-[#0f1115] p-2.5 border border-[#1e222b] rounded-lg italic">
                "{comment.body}"
              </p>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}