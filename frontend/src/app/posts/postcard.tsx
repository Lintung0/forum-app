"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Eye,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowRight,
  ChevronUp,
} from "lucide-react";
import { PostSummary } from "./type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function VoteBox({ score, postId, initialVote }: { score: number; postId: string; initialVote?: 'upvote' | 'downvote' | null }) {
  const [localScore, setLocalScore] = useState(score);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(initialVote ?? null);
  const [voting, setVoting] = useState(false);

  const handleVote = async (e: React.MouseEvent, type: 'upvote' | 'downvote') => {
    e.stopPropagation();
    const token = localStorage.getItem('auth_token');
    if (!token) { alert('Login dulu untuk vote.'); return; }
    if (voting) return;

    const oldVote = userVote;
    const oldScore = localScore;
    let newScore = localScore;

    if (userVote === type) {
      setUserVote(null);
      newScore = type === 'upvote' ? localScore - 1 : localScore + 1;
    } else if (userVote === null) {
      setUserVote(type);
      newScore = type === 'upvote' ? localScore + 1 : localScore - 1;
    } else {
      setUserVote(type);
      newScore = type === 'upvote' ? localScore + 2 : localScore - 2;
    }
    setLocalScore(newScore);

    setVoting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/votes`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target_id: postId, target_type: 'post', vote_type: type }),
      });
      if (res.ok) {
        const json = await res.json();
        setLocalScore(json.data?.vote_score ?? newScore);
      } else {
        setUserVote(oldVote);
        setLocalScore(oldScore);
      }
    } catch {
      setUserVote(oldVote);
      setLocalScore(oldScore);
    } finally { setVoting(false); }
  };

  return (
    <div className="flex flex-col items-center justify-start min-w-[48px] bg-gray-900 rounded-lg py-3 self-start border border-gray-800">
      <button 
        onClick={(e) => handleVote(e, 'upvote')}
        disabled={voting}
        className={cn(
          "p-1.5 rounded-md transition-all",
          userVote === 'upvote' ? "bg-[#e95723] text-white" : "text-gray-600 hover:text-white hover:bg-gray-800"
        )}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <span className={cn(
        "text-sm font-bold my-1 tabular-nums",
        userVote === 'upvote' ? "text-[#e95723]" : userVote === 'downvote' ? "text-blue-400" : "text-gray-400"
      )}>
        {localScore}
      </span>
      <button 
        onClick={(e) => handleVote(e, 'downvote')}
        disabled={voting}
        className={cn(
          "p-1.5 rounded-md transition-all",
          userVote === 'downvote' ? "bg-blue-500 text-white" : "text-gray-600 hover:text-white hover:bg-gray-800"
        )}
      >
        <ChevronUp className="h-5 w-5 rotate-180" />
      </button>
    </div>
  );
}

interface PostCardProps {
  post: PostSummary;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
  const router = useRouter();
  const authorUsername = post.user?.username;
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

  const isMyPost = currentUserId !== null && String(post.user?.id) === currentUserId;

  const handleCardClick = () => router.push(`/posts/${post.id}`);

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (authorUsername) router.push(`/profile/${authorUsername}`);
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Hapus diskusi ini?")) return;
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${BACKEND_URL}/api/v1/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (onDelete) onDelete(post.id);
        else window.location.reload();
      }
    } catch {}
  };

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${BACKEND_URL}/api/v1/reports`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target_type: "post", target_id: post.id, reason: "Konten tidak pantas" }),
      });
      alert("Postingan berhasil dilaporkan.");
    } catch {}
  };

  return (
    <div
      onClick={handleCardClick}
      className="block group cursor-pointer w-full"
    >
      <Card className={`relative overflow-hidden bg-[#0d0e12] border transition-all rounded-xl ${
        post.is_answered ? 'border-emerald-500/30' : 'border-gray-800 group-hover:border-gray-700'
      }`}>
        <div className="flex gap-6 p-6 relative z-10">
          <VoteBox score={post.vote_score} postId={post.id} initialVote={(post as any).user_vote} />

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center gap-3 flex-wrap text-[10px] font-bold uppercase tracking-wider text-gray-500 pr-8">
              {post.category && (
                <span className="text-[#e95723] bg-[#e95723]/10 px-3 py-1 rounded-md border border-[#e95723]/10">
                  {post.category.name}
                </span>
              )}
              <span className="text-gray-700">•</span>
              <div
                onClick={handleAuthorClick}
                className="inline-flex items-center gap-2 hover:text-white transition-all"
              >
                <Avatar className="w-5 h-5 border border-gray-800">
                  <AvatarImage src={post.user?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[8px] bg-gray-800 text-gray-400 font-bold uppercase">
                    {authorUsername?.[0] ?? "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-400 hover:text-[#e95723] transition-colors">
                  @{authorUsername ?? "author"}
                </span>
              </div>
              <span className="text-gray-700">•</span>
              <span className="text-gray-600">{timeAgo(post.created_at)}</span>
              
              {post.is_answered && (
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/5 px-3 py-1 rounded-md border border-emerald-400/10">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="font-bold">Solved</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white leading-tight group-hover:text-[#e95723] transition-colors line-clamp-1">
                {post.title}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                {post.body}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 flex-wrap gap-4 border-t border-gray-800/50">
              <div
                className="flex items-center gap-2 flex-wrap"
                onClick={(e) => e.stopPropagation()}
              >
                {post.tags?.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border-gray-800 bg-gray-900/50 text-gray-400 rounded-md"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase ml-auto">
                <span className="flex items-center gap-2 hover:text-white transition-all">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post.comments_count}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5" />
                  {post.view_count}
                </span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-white hover:bg-gray-800 rounded-lg">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#0d0e12] border border-gray-800 p-1 rounded-xl">
                {isMyPost ? (
                  <>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/posts/${post.id}/edit`); }} className="gap-2 text-[10px] font-bold uppercase py-2.5 px-4 cursor-pointer focus:bg-gray-800 rounded-lg">
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="gap-2 text-[10px] font-bold uppercase py-2.5 px-4 text-red-500 cursor-pointer focus:bg-red-950/20 focus:text-red-400 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={handleReport} className="gap-2 text-[10px] font-bold uppercase py-2.5 px-4 text-yellow-500 cursor-pointer focus:bg-yellow-950/20 focus:text-yellow-400 rounded-lg">
                    <AlertTriangle className="h-3.5 w-3.5" /> Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </div>
  );
}