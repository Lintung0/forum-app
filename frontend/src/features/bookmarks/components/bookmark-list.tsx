"use client";

import React, { useState, useEffect } from 'react';
import { Bookmark, Search, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BookmarkItem, BookmarkItemData } from './bookmark-item';
import { fetchBookmarksApi, removeBookmarkApi } from '../services/bookmark-api';

export const BookmarkList: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const response = await fetchBookmarksApi();
        setBookmarks(response.data || response);
      } catch (error) {
        console.error("Gagal memuat bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (id: string) => {
    try {
      await removeBookmarkApi(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error("Gagal menghapus bookmark:", error);
    }
  };

  const filteredBookmarks = bookmarks.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-10 text-gray-400">Memuat bookmark Anda</div>;

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bookmark className="w-7 h-7 text-orange-500 fill-orange-500" /> Bookmarks
            </h1>
            {bookmarks.length > 0 && (
              <span className="bg-orange-600/20 text-orange-400 border border-orange-500/30 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                {bookmarks.length}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">Diskusi yang Anda simpan</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Cari bookmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#161b22]/60 border-gray-800 text-gray-200 placeholder:text-gray-500 focus-visible:ring-orange-500 h-11 text-base rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-16 text-gray-500 border border-dashed border-gray-800 rounded-xl space-y-2">
            <Bookmark className="w-8 h-8 mx-auto text-gray-600" />
            <p className="text-base">Tidak ada diskusi tersimpan.</p>
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
};