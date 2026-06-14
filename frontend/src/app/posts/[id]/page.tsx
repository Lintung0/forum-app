'use client';

import { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import PostDetailView from './PostDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export default function PostDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API}/posts/${id}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const json = await res.json();
        setPost(json.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Transmission...</div>
      </div>
    );
  }

  if (error || !post) {
    return notFound();
  }

  return <PostDetailView post={post} />;
}