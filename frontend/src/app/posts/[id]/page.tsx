import { notFound } from 'next/navigation';
import PostDetailView from './PostDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  const res = await fetch(`${API}/posts/${id}`, { cache: 'no-store' });
  if (!res.ok) notFound();

  const json = await res.json();
  const post = json.data;

  return <PostDetailView post={post} />;
}
