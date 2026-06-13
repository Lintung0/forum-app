// src/app/bookmarks/page.tsx

import React from 'react';
import { BookmarkList } from '@/features/bookmarks/components/bookmark-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookmarks | Forum Diskusi',
  description: 'Diskusi dan postingan yang Anda simpan',
};

export default function BookmarksPage() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-gray-200 p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <BookmarkList />
      </div>
    </main>
  );
}