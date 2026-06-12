'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PostDetail } from './type';
import { Card } from '@/components/ui/card';
import { MessageSquare, ChevronLeft } from 'lucide-react';

import { PostContent } from './components/post-content';
import { ReplyInput } from './components/reply-input';
import { CommentItem } from './components/comment-item';
import { AuthorSidebar } from './components/author-sidebar';

interface PostDetailViewProps {
  post: PostDetail;
}

export default function PostDetailView({ post: initialPost }: PostDetailViewProps) {
  const [post, setPost] = useState<PostDetail>(initialPost);

  // 1. FITUR: TAMBAH KOMENTAR (Bypass Frontend Dummy)
  const handlePostResponse = async (text: string): Promise<boolean> => {
    try {
      // Efek loading buatan 300ms
      await new Promise((resolve) => setTimeout(resolve, 300));

      const commentDummy = {
        id: Math.floor(Math.random() * 1000000), // ID acak unik
        post_id: post.id,
        body: text,
        vote_score: 0,
        is_accepted: false,
        created_at: new Date().toISOString(),
        user: {
          id: 999, // ID Kunci untuk mendeteksi kepemilikan tombol Edit/Delete
          username: "Kamu (Frontend Dev)",
          avatar_url: null,
          reputation_points: 1500,
          level: 5,
          bio: "Sedang merakit fitur kelompok."
        }
      };

      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), commentDummy]
      }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // 2. FITUR: HAPUS KOMENTAR
  const handleDeleteComment = (commentId: number) => {
    setPost((prev) => ({
      ...prev,
      comments: (prev.comments || []).filter((c) => c.id !== commentId)
    }));
  };

  // 3. FITUR: EDIT KOMENTAR
  const handleEditComment = (commentId: number, newBody: string) => {
    setPost((prev) => ({
      ...prev,
      comments: (prev.comments || []).map((c) => 
        c.id === commentId ? { ...c, body: newBody } : c
      )
    }));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-6 space-y-4 font-sans antialiased w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href="/posts" className="flex items-center gap-1 hover:text-gray-300 font-medium transition-colors">
          <ChevronLeft className="h-3 w-3" />
          Back to Discussions
        </Link>
        <span className="text-gray-600">/</span>
        {post.category && (
          <>
            <span className="text-[#e95723] font-medium">{post.category?.name}</span>
            <span className="text-gray-600">/</span>
          </>
        )}
        <span className="text-gray-500 truncate max-w-[250px] font-normal">{post.title}</span>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_290px] gap-6 w-full items-start">
        {/* Kolom Kiri */}
        <div className="space-y-4 w-full flex flex-col">
          <PostContent post={post} />

          {/* Form Input Kirim Komentar */}
          <ReplyInput onPostResponse={handlePostResponse} />

          {/* List Respons */}
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2 px-1">
              <MessageSquare className="h-3.5 w-3.5 text-[#e95723]" />
              <h2 className="text-sm font-bold text-white tracking-tight">Responses</h2>
              <span className="text-[10px] font-bold text-gray-400 bg-[#1e222b] border border-[#2c323f] px-1.5 py-0.5 rounded-full">
                {post.comments?.length ?? 0}
              </span>
            </div>

            {!post.comments || post.comments.length === 0 ? (
              <Card className="bg-[#13151a] border border-[#1e222b] rounded-xl py-10 text-center space-y-2 w-full">
                <MessageSquare className="h-6 w-6 text-gray-700 mx-auto" />
                <p className="text-xs text-gray-500">No responses yet. Be the first!</p>
              </Card>
            ) : (
              post.comments.map((comment, idx) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  idx={idx}
                  onDeleteComment={handleDeleteComment}
                  onEditComment={handleEditComment}
                />
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="w-full xl:sticky xl:top-6">
          <AuthorSidebar post={post} />
        </div>
      </div>
    </div>
  );
}