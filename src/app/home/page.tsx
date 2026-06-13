// src/app/home/page.tsx
import { FC } from 'react';
// Menggunakan alias absolut '@/' untuk melewati bug case-sensitivity cache Webpack lokal
import HomeView from '@/app/home/HomeView';
import { Post, Tag } from './type';

const Home: FC = async () => {
  let posts: Post[] = [];
  let tags: Tag[] = [];

  try {
    const [resPosts, resTags] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/v1/posts', { cache: 'no-store' }),
      fetch('http://127.0.0.1:8000/api/v1/tags', { cache: 'no-store' })
    ]);

    if (resPosts.ok) {
      const json = await resPosts.json();
      // Struktur: { data: { items: [...], meta: {...} } } atau { data: [...] }
      const raw = json.data;
      if (Array.isArray(raw)) {
        posts = raw;
      } else if (raw?.items && Array.isArray(raw.items)) {
        posts = raw.items;
      } else {
        posts = [];
      }
    }

    if (resTags.ok) {
      const json = await resTags.json();
      const raw = json.data;
      tags = Array.isArray(raw) ? raw : (raw?.items ?? []);
    }
  } catch (error) {
    console.error("Koneksi gagal ke API Laravel:", error);
  }

  return <HomeView posts={posts} tags={tags} />;
};

export default Home;