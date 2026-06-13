import { FC } from 'react';
import PostDetailView from './PostDetailView';
import { PostDetail } from './type';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

const PostDetailPage: FC<PostPageProps> = async ({ params }) => {
  const { id } = await params;
  let post: PostDetail | null = null;

  try {
    const response = await fetch(`${BACKEND_API_URL}/api/v1/posts/${id}`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      post = data.data ?? data;
    }
  } catch (error) {
    console.error('Gagal fetch post detail:', error);
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-3">
        <div className="text-4xl">🔍</div>
        <p className="text-sm font-medium text-gray-300">Postingan tidak ditemukan</p>
        <p className="text-xs text-gray-600">Server mungkin sedang mati atau ID tidak valid.</p>
      </div>
    );
  }

  return <PostDetailView post={post} />;
};

export default PostDetailPage;
