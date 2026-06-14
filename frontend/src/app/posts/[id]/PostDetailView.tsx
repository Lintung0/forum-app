"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostDetail } from "./type";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  ChevronLeft,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { PostContent } from "./components/post-content";
import { ReplyInput } from "./components/reply-input";
import { CommentItem } from "./components/comment-item";
import { AuthorSidebar } from "./components/author-sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:8000";

interface PostDetailViewProps {
  post: PostDetail;
}

export default function PostDetailView({ post: initialPost }: PostDetailViewProps) {
  const router = useRouter();
  const [post, setPost] = useState<PostDetail>(initialPost);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUserId(parsed?.id ? String(parsed.id) : null);
      }
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  const isMyPost =
    currentUserId !== null &&
    String(post.user?.id) === currentUserId;

  
  const handleDeletePost = async () => {
    if (!confirm("Apakah kamu yakin ingin menghapus postingan ini secara permanen?"))
      return;
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${BACKEND_API_URL}/api/v1/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        alert("Postingan berhasil dihapus.");
        router.push("/home");
      } else {
        const json = await res.json();
        alert(json.message || "Gagal menghapus postingan.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat menghapus postingan.");
    }
  };

  
  const handleReportPost = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${BACKEND_API_URL}/api/v1/reports`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_type: "post",
          target_id: post.id,
          reason: "Konten tidak pantas",
        }),
      });
      if (res.ok) {
        alert("Terima kasih. Postingan ini berhasil dilaporkan ke tim Voxra.");
      } else {
        const json = await res.json();
        alert(json.message || "Gagal melaporkan postingan.");
      }
    } catch {
      alert("Postingan berhasil dilaporkan.");
    }
  };

  
  const handlePostResponse = async (text: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Anda harus login untuk berkomentar.");
        return false;
      }
      const res = await fetch(`${BACKEND_API_URL}/api/v1/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: text }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Gagal mengirim komentar.");
        return false;
      }
      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), json.data],
      }));
      return true;
    } catch {
      alert("Terjadi kesalahan saat mengirim komentar.");
      return false;
    }
  };

  
  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch(
        `${BACKEND_API_URL}/api/v1/posts/${post.id}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const json = await res.json();
        alert(json.message || "Gagal menghapus komentar.");
        return;
      }
      setPost((prev) => ({
        ...prev,
        comments: (prev.comments || []).filter((c) => c.id !== commentId),
      }));
    } catch {
      alert("Terjadi kesalahan saat menghapus komentar.");
    }
  };

  
  const handleEditComment = async (commentId: string, newBody: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch(
        `${BACKEND_API_URL}/api/v1/posts/${post.id}/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body: newBody }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Gagal mengedit komentar.");
        return;
      }
      setPost((prev) => ({
        ...prev,
        comments: (prev.comments || []).map((c) =>
          c.id === commentId ? { ...c, body: newBody } : c
        ),
      }));
    } catch {
      alert("Terjadi kesalahan saat mengedit komentar.");
    }
  };

  
  const handleAcceptAnswer = (commentId: string, accepted: boolean) => {
    setPost((prev) => ({
      ...prev,
      is_answered: accepted,
      comments: (prev.comments || []).map((c) => ({
        ...c,
        is_accepted: accepted ? c.id === commentId : false,
      })),
    }));
  };

  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (type: 'upvote' | 'downvote') => {
    const token = localStorage.getItem('auth_token');
    if (!token) { alert('Anda harus login untuk vote.'); return; }
    setIsVoting(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/v1/votes`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ votable_type: 'post', votable_id: post.id, type }),
      });
      const json = await res.json();
      if (res.ok) setPost((prev) => ({ ...prev, ...json.data }));
    } catch { } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-6 space-y-4 font-sans antialiased w-full">
      {}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link
            href="/posts"
            className="flex items-center gap-1 hover:text-gray-300 font-medium transition-colors"
          >
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
          <span className="text-gray-500 truncate max-w-[250px] font-normal">
            {post.title}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-[#16181d] rounded-lg"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 bg-[#13151a] border border-[#22252e] text-gray-300 rounded-lg p-1"
          >
            {isMyPost ? (
              <>
                <DropdownMenuItem
                  onClick={() => router.push(`/posts/${post.id}/edit`)}
                  className="flex items-center gap-2 text-xs font-medium focus:bg-[#e95723] focus:text-white rounded-md cursor-pointer py-2"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Diskusi
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeletePost}
                  className="flex items-center gap-2 text-xs font-medium text-red-500 focus:bg-red-950/40 focus:text-red-400 rounded-md cursor-pointer py-2"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus Diskusi
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={handleReportPost}
                className="flex items-center gap-2 text-xs font-medium text-yellow-500 focus:bg-yellow-950/30 focus:text-yellow-400 rounded-md cursor-pointer py-2"
              >
                <AlertTriangle className="h-3.5 w-3.5" /> Laporkan
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_290px] gap-6 w-full items-start">
        <div className="space-y-4 w-full flex flex-col">
          <PostContent post={post} onVote={handleVote} isVoting={isVoting} />
          <ReplyInput onPostResponse={handlePostResponse} />
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
                  postId={post.id}
                  postOwnerId={post.user?.id ?? ''}
                  onDeleteComment={handleDeleteComment}
                  onEditComment={handleEditComment}
                  onAcceptAnswer={handleAcceptAnswer}
                />
              ))
            )}
          </div>
        </div>
        <div className="w-full xl:sticky xl:top-6">
          <AuthorSidebar author={post.user} />
        </div>
      </div>
    </div>
  );
}