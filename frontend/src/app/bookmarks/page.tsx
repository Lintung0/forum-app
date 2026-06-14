import React from 'react';
import BookmarkView from './BookmarksView';

export const metadata = {
  title: 'Bookmarks - Forum Diskusi',
  description: 'Halaman daftar diskusi yang Anda simpan.',
};

export default function BookmarkPage() {
  return <BookmarkView />;
}