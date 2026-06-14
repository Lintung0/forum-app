import React from 'react';
import CategoryView from './CategoryView';

export const metadata = {
  title: 'Kelola Kategori - Forum Admin',
  description: 'Panel admin manajemen data kategori diskusi forum.',
};

export default function AdminCategoriesPage() {
  return <CategoryView />;
}