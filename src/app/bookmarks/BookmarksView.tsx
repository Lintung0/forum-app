'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, AlertCircle, Bookmark, BookmarkX,
  MessageSquare, ThumbsUp, Eye, CheckCircle2, Tag,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Bookmark as BookmarkType } from './type';
import { useState } from 'react';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') ?? '' : '';
}

async function fetchBookmarks() {
  const token = getToken();
  const res = await fetch(`${BACKEND_API_URL}/api/v1/bookmarks`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengambil bookmark');
  return json.data;
}

async function deleteBookmark(bookmarkId: string) {
  const token = getToken();
  const res = await fetch(`${BACKEND_API_URL}/api/v1/bookmarks/${bookmarkId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || 'Gagal menghapus bookmark');
  }
}

function BookmarkCard({
  bookmark,
  onRemove,
  removing,
}: {
  bookmark: BookmarkType;
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  const post = bookmark.post;
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: localeId,
  });
  const bodyPreview = post.body?.replace(/<[^>]*>/g, '').slice(0, 140);

  return (
    <div className="group bg-[#0f1115] border border-[#1e2129] hover:border-[#2c323f] rounded-xl p-4 space-y-3 transition-all">

      {/* Top row: category + remove button */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#e95723]/80 bg-[#e95723]/5 border border-[#e95723]/10 px-2 py-0.5 rounded-full">
          {post.category?.name ?? 'Uncategorized'}
        </span>
        <button
          onClick={() => onRemove(bookmark.id)}
          disabled={removing}
          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
          title="Hapus bookmark"
        >
          {removing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <BookmarkX className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Title */}
      <Link href={`/posts/${post.id}`}>
        <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors leading-snug line-clamp-2 hover:text-[#e95723]">
          {post.is_answered && (
            <CheckCircle2 className="inline h-3.5 w-3.5 text-emerald-400 mr-1 mb-0.5" />
          )}
          {post.title}
        </h3>
      </Link>

      {/* Body preview */}
      {bodyPreview && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{bodyPreview}…</p>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag.slug}
              className="inline-flex items-center gap-0.5 text-[10px] text-gray-500 bg-[#16181d] border border-[#22252e] px-1.5 py-0.5 rounded"
            >
              <Tag className="h-2.5 w-2.5" /> {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1e2129]">
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5 border border-[#22252e]">
            <AvatarImage src={post.user?.avatar_url ?? undefined} />
            <AvatarFallback className="text-[9px] bg-[#16181d] text-gray-400">
              {post.user?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] text-gray-500">@{post.user?.username}</span>
          <span className="text-[10px] text-gray-700">·</span>
          <span className="text-[10px] text-gray-600">{timeAgo}</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-600">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" /> {post.vote_score}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> {post.comments_count}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {post.view_count}
          </span>
        </div>
      </div>
    </div>
  );
}

export function BookmarksView() {
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarks,
    staleTime: 1000 * 60,
  });

  const removeMutation = useMutation({
    mutationFn: deleteBookmark,
    onMutate: (id) => setRemovingId(id),
    onSettled: () => {
      setRemovingId(null);
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#e95723]" />
        <p className="text-xs text-gray-500 font-medium">Memuat bookmark...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto my-12 p-5 bg-red-950/20 border border-red-900/40 rounded-xl text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
        <p className="text-xs text-gray-400">{(error as Error).message}</p>
      </div>
    );
  }

  const bookmarks: BookmarkType[] = data?.items ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-[#e95723]" />
        <h1 className="text-base font-bold text-white">Bookmarks</h1>
        {bookmarks.length > 0 && (
          <span className="text-[10px] font-black bg-[#16181d] border border-[#22252e] text-gray-400 px-2 py-0.5 rounded-full">
            {data?.meta?.total ?? bookmarks.length}
          </span>
        )}
      </div>

      {/* List */}
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
          <Bookmark className="h-10 w-10 text-gray-700" />
          <p className="text-sm font-semibold text-gray-500">Belum ada bookmark</p>
          <p className="text-xs text-gray-600">
            Simpan post menarik dengan menekan tombol bookmark di halaman diskusi.
          </p>
          <Link href="/posts">
            <Button
              size="sm"
              className="mt-2 bg-[#e95723] hover:bg-[#d0481b] text-white rounded-xl text-xs"
            >
              Jelajahi Diskusi
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onRemove={(id) => removeMutation.mutate(id)}
              removing={removingId === bookmark.id}
            />
          ))}
        </div>
      )}

      {data?.meta && data.meta.total > 0 && (
        <p className="text-center text-[11px] text-gray-600 pt-2">
          Menampilkan {bookmarks.length} dari {data.meta.total} bookmark
        </p>
      )}
    </div>
  );
}
