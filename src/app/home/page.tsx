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
      const textPosts = await resPosts.text();
      const jsonStart = textPosts.indexOf('{');
      if (jsonStart !== -1) {
        const postsData = JSON.parse(textPosts.slice(jsonStart));
        posts = postsData.data ?? (Array.isArray(postsData) ? postsData : []);
      }
    }

    if (resTags.ok) {
      const textTags = await resTags.text();
      const jsonStart = textTags.indexOf('{');
      if (jsonStart !== -1) {
        const tagsData = JSON.parse(textTags.slice(jsonStart));
        tags = tagsData.data ?? (Array.isArray(tagsData) ? tagsData : []);
      }
    }
  } catch (error) {
    console.error("Koneksi gagal ke API Laravel:", error);
  }

  return <HomeView posts={posts} tags={tags} />;
};

export default Home;