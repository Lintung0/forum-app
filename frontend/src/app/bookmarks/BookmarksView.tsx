"use client";

import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, ArrowUp, MessageSquare, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchBookmarksApi, removeBookmarkApi } from '@/features/bookmarks/services/bookmark-api';

interface RawBookmarkData {
  id: string;
  title?: string;
  author?: string | { name: string };
  timeAgo?: string;
  time_ago?: string;
  created_at?: string;
  category?: string;
  tags?: string[] | string;
  votes?: number;
  votes_count?: number;
  comments?: number;
  comments_count?: number;
  views?: number;
  views_count?: number;

  post?: {
    id: string;
    title?: string;
    author?: string | { name: string };
    timeAgo?: string;
    time_ago?: string;
    created_at?: string;
    category?: string;
    tags?: string[] | string;
    votes?: number;
    votes_count?: number;
    comments?: number;
    comments_count?: number;
    views?: number;
    views_count?: number;
  };
}

interface BookmarkItemProps {
  item: RawBookmarkData;
  onRemove: () => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ item, onRemove }) => {
  const title = item?.title || item?.post?.title || 'Judul tidak tersedia';
  
  const rawAuthor = item?.author || item?.post?.author || 'User';
  const author = typeof rawAuthor === 'object' ? rawAuthor.name : rawAuthor;

  const timeAgo = item?.timeAgo || item?.time_ago || item?.created_at || item?.post?.timeAgo || item?.post?.time_ago || item?.post?.created_at || 'Baru saja';
  
  const category = item?.category || item?.post?.category || 'Umum';

  const rawTags = item?.tags || item?.post?.tags || [];
  const tags = Array.isArray(rawTags) ? rawTags : typeof rawTags === 'string' ? JSON.parse(rawTags) : [];

  const votes = item?.votes ?? item?.votes_count ?? item?.post?.votes ?? item?.post?.votes_count ?? 0;
  const comments = item?.comments ?? item?.comments_count ?? item?.post?.comments ?? item?.post?.comments_count ?? 0;
  const views = item?.views ?? item?.views_count ?? item?.post?.views ?? item?.post?.views_count ?? 0;

  return (
    <div className="bg-[#13151a] border border-[#1e222b] rounded-2xl p-5 hover:border-[#e95723]/30 hover:bg-[#16181d] transition-all duration-300 space-y-4 shadow-lg group">
      
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-lg md:text-xl font-black text-white group-hover:text-[#e95723] cursor-pointer transition-colors leading-tight tracking-tight">
            {title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
            <span className="text-gray-400">@{author}</span>
            <span className="text-gray-700">•</span>
            <span className="font-medium normal-case">{timeAgo}</span>
            <span className="text-gray-700">•</span>
            <span className="text-[#e95723] bg-[#e95723]/10 px-2 py-0.5 rounded-md">
              d/{category}
            </span>
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag: string, idx: number) => (
            <span 
              key={idx} 
              className="px-2 py-0.5 text-[10px] font-bold bg-[#1a1d24] text-gray-400 border border-[#22252e] rounded-lg hover:border-[#e95723]/30 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#1e222b] pt-4 text-[11px] font-bold text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group/stat">
            <ArrowUp className="w-4 h-4 text-gray-600 group-hover/stat:text-[#e95723]" />
            <span className="tabular-nums">{votes}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group/stat">
            <MessageSquare className="w-4 h-4 text-gray-600 group-hover/stat:text-[#e95723]" />
            <span className="tabular-nums">{comments}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-gray-600" />
            <span className="tabular-nums">{views}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl gap-2 font-black transition-all h-8 text-[10px] uppercase tracking-widest"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Hapus
        </Button>
      </div>

    </div>
  );
};

export default function BookmarkView() {
  const [bookmarks, setBookmarks] = useState<RawBookmarkData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const response = await fetchBookmarksApi();
        setBookmarks(response.data || response || []);
      } catch (error) {
        console.error("Gagal memuat bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus bookmark ini?')) return;
    try {
      await removeBookmarkApi(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error("Gagal menghapus bookmark:", error);
    }
  };

  const filteredBookmarks = bookmarks.filter(b => {
    const title = b?.title || b?.post?.title || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-8 h-8 border-2 border-[#e95723]/20 border-t-[#e95723] rounded-full animate-spin" />
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Memuat bookmark Anda...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-6 py-10 pb-32">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#e95723]/10 rounded-2xl border border-[#e95723]/20">
              <Bookmark className="w-6 h-6 text-[#e95723] fill-[#e95723]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                Bookmarks
                {bookmarks.length > 0 && (
                  <span className="text-[11px] font-black bg-[#e95723] text-white px-2.5 py-1 rounded-full shadow-lg shadow-[#e95723]/20 uppercase tracking-tight">
                    {bookmarks.length} saved
                  </span>
                )}
              </h1>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Saves you made for future reference</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-72">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4 group-focus-within:text-[#e95723] transition-colors" />
            <Input
              type="text"
              placeholder="Filter by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#16181d] border-[#22252e] text-white text-xs placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-[#e95723] h-11 rounded-2xl shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border-2 border-dashed border-[#1e222b] rounded-3xl space-y-4 bg-[#13151a]/50">
            <div className="w-16 h-16 bg-[#1a1d24] rounded-full flex items-center justify-center mx-auto border border-[#22252e]">
              <Bookmark className="w-7 h-7 text-gray-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white uppercase tracking-tight">Tidak ada diskusi tersimpan</p>
              <p className="text-xs text-gray-600">Bookmark diskusi yang menarik untuk dibaca nanti.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookmarks.map((item) => (
              <BookmarkItem 
                key={item.id} 
                item={item} 
                onRemove={() => handleRemoveBookmark(item.id)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}