import { Separator } from '@/components/ui/separator';
import { MessageSquare, Clock, TrendingUp, Filter, Flame } from 'lucide-react';
import { PostSummary } from './type';
import PostCard from './postcard'; // <-- Jalurnya diubah menjadi huruf kecil semua

export default async function PostsPage() {
  let posts: PostSummary[] = [];

  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/posts', {
      cache: 'no-store',
    });

    if (response.ok) {
      const json = await response.json();
      const raw = json.data;
      if (Array.isArray(raw)) {
        posts = raw;
      } else if (raw?.items && Array.isArray(raw.items)) {
        posts = raw.items;
      } else {
        posts = [];
      }
    }
  } catch (error) {
    console.error('Gagal fetch posts:', error);
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-[#e95723]" />
          <h1 className="text-sm font-semibold text-white">Discussions</h1>
          <span className="text-[10px] text-gray-500 bg-[#1e222b] border border-[#2c323f] px-1.5 py-0.5 rounded-full tabular-nums">
            {posts.length}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e222b] transition-colors text-[#e95723]">
            <TrendingUp className="h-3 w-3" /> Hot
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e222b] transition-colors">
            <Clock className="h-3 w-3" /> New
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e222b] transition-colors">
            <Filter className="h-3 w-3" /> Filter
          </button>
        </div>
      </div>

      <Separator className="bg-[#22252e]" />

      {posts.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <MessageSquare className="h-8 w-8 text-gray-600 mx-auto" />
          <p className="text-sm text-gray-500">Belum ada diskusi.</p>
          <p className="text-xs text-gray-600">Jadilah yang pertama memulai!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}