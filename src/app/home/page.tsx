import { FC } from 'react';
import HomeView from './HomeView';
import { Post, Tag } from './type';

const Home: FC = async () => {
  let posts: Post[] = [];
  let tags: Tag[] = [];

  try {
    const [resPosts, resTags] = await Promise.all([
      fetch('http://localhost:8000/api/v1/posts', { cache: 'no-store' }),
      fetch('http://localhost:8000/api/v1/tags', { cache: 'no-store' })
    ]);

    if (resPosts.ok) {
      const postsData = await resPosts.json();
      if (postsData && postsData.data) {
        posts = postsData.data;
      } else {
        posts = Array.isArray(postsData) ? postsData : [];
      }
    }

    if (resTags.ok) {
      const tagsData = await resTags.json();
      if (tagsData && tagsData.data) {
        tags = tagsData.data;
      } else {
        tags = Array.isArray(tagsData) ? tagsData : [];
      }
    }
  } catch (error) {
    console.error("Koneksi gagal ke API Laravel:", error);
  }

  return <HomeView posts={posts} tags={tags} />;
};

export default Home;