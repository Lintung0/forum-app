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
    <div className="bg-[#161b22]/40 border border-gray-800 rounded-xl p-5 hover:border-gray-700/80 transition-all space-y-4">
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white hover:text-[#e95723] cursor-pointer transition-colors leading-snug">
            {title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
            <span className="text-gray-300 font-medium">@{author}</span>
            <span>•</span>
            <span>{timeAgo}</span>
            <span>•</span>
            <span 
              className="px-2 py-0.5 text-xs bg-[#21262d] rounded-md font-medium border"
              style={{ color: '#e95723', borderColor: 'rgba(233, 87, 35, 0.2)' }}
            >
              {category}
            </span>
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: string, idx: number) => (
            <span 
              key={idx} 
              className="px-2.5 py-0.5 text-xs bg-[#21262d] text-gray-300 rounded-md hover:bg-[#30363d] cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-800/60 pt-3 text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer group">
            <ArrowUp className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
            <span>{votes}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer group">
            <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
            <span>{comments}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-gray-500" />
            <span>{views}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg gap-2 font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
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

  if (loading) return <div className="text-center py-10 text-gray-400">Memuat bookmark Anda...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Bookmark className="w-6 h-6 fill-[#e95723]" style={{ color: '#e95723' }} /> Bookmarks
            </h1>
            {bookmarks.length > 0 && (
              <span 
                className="border text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(233, 87, 35, 0.1)', color: '#e95723', borderColor: 'rgba(233, 87, 35, 0.2)' }}
              >
                {bookmarks.length}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Diskusi yang Anda simpan</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            type="text"
            placeholder="Cari bookmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#161b22]/60 border-gray-800 text-gray-200 text-sm placeholder:text-gray-500 focus-visible:ring-[#e95723]/40 h-10 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-xl space-y-2 bg-[#161b22]/10">
            <Bookmark className="w-7 h-7 mx-auto text-gray-600" />
            <p className="text-sm">Tidak ada diskusi tersimpan.</p>
          </div>
        ) : (
          filteredBookmarks.map((item) => (
            <BookmarkItem 
              key={item.id} 
              item={item} 
              onRemove={() => handleRemoveBookmark(item.id)} 
            />
          ))
        )}
      </div>
    </div>
  );
}