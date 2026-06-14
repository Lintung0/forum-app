"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PostDetail } from "./type";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowLeft,
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
import { cn } from "@/lib/utils";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

interface PostDetailViewProps {
  post: PostDetail;
}

export default function PostDetailView({ post: initialPost }: PostDetailViewProps) {
  const router = useRouter();
  const [post, setPost] = useState<PostDetail>(initialPost);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

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

  const isMyPost = currentUserId !== null && String(post.user?.id) === currentUserId;

  const handleVote = async (type: 'upvote' | 'downvote') => {
    const token = localStorage.getItem('auth_token');
    if (!token) { alert('Anda harus login untuk vote.'); return; }
    setIsVoting(true);
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/v1/votes`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target_id: post.id, target_type: 'post', vote_type: type }),
      });
      const json = await res.json();
      if (res.ok) {
        setPost((prev) => ({ 
          ...prev, 
          vote_score: json.data.vote_score,
          user_vote: prev.user_vote === type ? null : type 
        }));
      }
    } catch { } finally {
      setIsVoting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Apakah kamu yakin ingin menghapus postingan ini?")) return;
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
        router.push("/home");
      }
    } catch {}
  };

  const handlePostResponse = async (text: string, parentId?: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return false;
      const res = await fetch(`${BACKEND_API_URL}/api/v1/posts/${post.id}/comments`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: text, parent_id: parentId }),
      });
      const json = await res.json();
      if (res.ok) {
        setPost((prev) => {
          if (parentId) {
            const updatedComments = (prev.comments || []).map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), json.data],
                  replies_count: (c.replies_count || 0) + 1,
                };
              }
              return c;
            });
            return {
              ...prev,
              comments: updatedComments,
              comments_count: (prev.comments_count ?? 0) + 1,
            };
          } else {
            return {
              ...prev,
              comments: [...(prev.comments || []), json.data],
              comments_count: (prev.comments_count ?? 0) + 1,
            };
          }
        });
        return true;
      } else {
        alert(`Failed to post comment: ${json.message || res.statusText}`);
        return false;
      }
    } catch (error) {
      alert(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
      return false;
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

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-4 md:px-8 space-y-8 font-sans antialiased w-full pb-40">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/home"
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Return to Sector</span>
        </Link>

        <div className="flex items-center gap-2">
          {isMyPost && (
            <Link href={`/posts/${post.id}/edit`}>
              <Button variant="outline" className="h-9 rounded-lg border-gray-800 bg-gray-900 text-gray-400 hover:text-white px-4 text-[10px] font-bold uppercase tracking-wider">
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
              </Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg border-gray-800"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#0d0e12] border border-gray-800 text-gray-400 p-1 rounded-xl"
            >
              {isMyPost ? (
                <DropdownMenuItem
                  onClick={handleDeletePost}
                  className="gap-2 text-[10px] font-bold uppercase py-2.5 px-4 text-red-500 cursor-pointer focus:bg-red-950/20 focus:text-red-400 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" /> Terminate Post
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="gap-2 text-[10px] font-bold uppercase py-2.5 px-4 text-yellow-500 cursor-pointer focus:bg-yellow-950/20 focus:text-yellow-400 rounded-lg"
                >
                  <AlertTriangle className="h-4 w-4" /> Flag Content
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 w-full items-start">
        <div className="space-y-8 w-full">
          <PostContent post={post} onVote={handleVote} isVoting={isVoting} />
          
          <div className="space-y-6 w-full">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-gray-800 rounded-lg">
                <MessageSquare className="h-4 w-4 text-[#e95723]" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Transmissions</h2>
            </div>

            <ReplyInput onPostResponse={handlePostResponse} />

            <div className="space-y-4">
              {!post.comments || post.comments.length === 0 ? (
                <div className="bg-[#0d0e12] border border-dashed border-gray-800 rounded-xl py-16 text-center">
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Awaiting first transmission</p>
                </div>
              ) : (
                post.comments.map((comment, idx) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    idx={idx}
                    postId={post.id}
                    postOwnerId={post.user?.id ?? ''}
                    onDeleteComment={() => {}}
                    onEditComment={() => {}}
                    onAcceptAnswer={handleAcceptAnswer}
                    onPostReply={handlePostResponse}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        
        <aside className="w-full xl:sticky xl:top-24 space-y-6">
          <AuthorSidebar author={post.user} />
          <Card className="bg-[#0d0e12] rounded-xl p-6 border-gray-800">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Discussion Intel</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-500 uppercase">Status</span>
                <span className="text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">Active</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-500 uppercase">Views</span>
                <span className="text-white">{post.view_count}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-500 uppercase">Score</span>
                <span className={cn(post.vote_score > 0 ? "text-[#e95723]" : "text-gray-400")}>{post.vote_score}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}