
import { FC } from 'react';

import HomeView from '@/app/home/HomeView';
import { Post, Tag } from './type';

const Home: FC = async () => {
  let posts: Post[] = [];
  let tags: Tag[] = [];
  let stats: any = null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  try {
    const [resPosts, resTags, resStats] = await Promise.all([
      fetch(`${API_URL}/posts`, { cache: 'no-store' }),
      fetch(`${API_URL}/tags`, { cache: 'no-store' }),
      fetch(`${API_URL}/stats`, { cache: 'no-store' })
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

    if (resStats.ok) {
      const statsData = await resStats.json();
      stats = statsData.data ?? null;
    }
  } catch (error) {
    console.error("Koneksi gagal ke API Laravel:", error);
  }

  return <HomeView posts={posts} tags={tags} stats={stats} />;
};

export default Home;