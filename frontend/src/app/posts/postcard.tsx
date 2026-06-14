"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp,
  MessageSquare,
  Eye,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { PostSummary } from "./type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:8000";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function VoteBox({ score }: { score: number }) {
  return (
    <div
      className="flex flex-col items-center justify-start pt-0.5 min-w-[36px]"
      onClick={(e) => e.stopPropagation()}
    >
      <ArrowUp className="h-4 w-4 text-gray-600 hover:text-[#e95723] cursor-pointer transition-colors" />
      <span
        className={`text-xs font-bold my-0.5 tabular-nums ${
          score > 0
            ? "text-[#e95723]"
            : score < 0
              ? "text-blue-400"
              : "text-gray-500"
        }`}
      >
        {score}
      </span>
      <ArrowUp className="h-4 w-4 text-gray-600 hover:text-blue-400 cursor-pointer transition-colors rotate-180" />
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

  const isMyPost =
    currentUserId !== null &&
    
    String(post.user?.id) === currentUserId;

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
        if (onDelete) {
          onDelete(post.id);
        } else {
          window.location.reload();
        }
      } else {
        const json = await res.json();
        alert(json.message || "Gagal menghapus postingan.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    }
  };
  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${BACKEND_URL}/api/v1/reports`, {
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
        alert("Postingan berhasil dilaporkan. Terima kasih!");
      } else {
        const json = await res.json();
        alert(json.message || "Gagal melaporkan postingan.");
      }
    } catch {
      alert("Postingan berhasil dilaporkan.");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="block group cursor-pointer w-full select-none"
    >
      <Card className="bg-[#13151a] border border-[#1e222b] hover:border-[#e95723]/30 hover:bg-[#16181d] transition-all duration-150 rounded-lg overflow-hidden">
        <div className="flex gap-3 p-3 relative">
          <VoteBox score={post.vote_score} />

          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Header */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-gray-500 pr-6">
              {post.category && (
                <>
                  <span className="text-[#e95723] font-medium hover:underline">
                    d/{post.category.slug}
                  </span>
                  <span>•</span>
                </>
              )}
              <div
                onClick={handleAuthorClick}
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Avatar className="w-3.5 h-3.5 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={post.user?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[8px] bg-[#2c323f] text-white font-bold">
                    {authorUsername?.[0]?.toUpperCase() ?? "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold cursor-pointer hover:underline text-gray-400 hover:text-[#e95723]">
                  @{authorUsername ?? "author"}
                </span>
              </div>
              <span>•</span>
              <span>{timeAgo(post.created_at)}</span>
            </div>

            {/* Judul */}
            <div className="flex items-start gap-2">
              <h2 className="text-sm font-semibold text-gray-100 leading-snug group-hover:text-white transition-colors line-clamp-2">
                {post.title}
              </h2>
              {post.is_answered && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
            </div>

            {/* Body */}
            <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
              {post.body}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-3 pt-0.5 flex-wrap">
              <div
                className="flex items-center gap-1 flex-wrap"
                onClick={(e) => e.stopPropagation()}
              >
                {post.tags?.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 border-[#2c323f] bg-transparent font-normal cursor-pointer hover:opacity-80"
                    style={{ color: tag.color, borderColor: `${tag.color}40` }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-600 ml-auto">
                <span className="flex items-center gap-1 hover:text-gray-400 transition-colors">
                  <MessageSquare className="h-3 w-3" />
                  {post.comments_count}
                  <span className="hidden sm:inline">comments</span>
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.view_count}
                </span>
              </div>
            </div>
          </div>

          {/* Dropdown titik 3 */}
          <div
            className="absolute top-2 right-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-white hover:bg-[#22252e] rounded-md"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 bg-[#13151a] border border-[#1e222b] text-gray-300 p-1"
              >
                {isMyPost ? (
                  <>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/posts/${post.id}/edit`);
                      }}
                      className="gap-2 text-xs py-1.5 cursor-pointer focus:bg-[#e95723] focus:text-white"
                    >
                      <Edit2 className="h-3 w-3" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="gap-2 text-xs py-1.5 text-red-500 cursor-pointer focus:bg-red-950/40 focus:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={handleReport}
                    className="gap-2 text-xs py-1.5 text-yellow-500 cursor-pointer focus:bg-yellow-950/30 focus:text-yellow-400"
                  >
                    <AlertTriangle className="h-3 w-3" /> Laporkan
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