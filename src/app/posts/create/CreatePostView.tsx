"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, PenSquare, Loader2, Tags, Check } from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CategoryOption, TagOption } from "./type";
import { createPostAction } from "./actions";

interface CreatePostViewProps {
  categories: CategoryOption[];
  initialTags: TagOption[];
}

export default function CreatePostView({
  categories,
  initialTags,
}: CreatePostViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // 1. Proteksi Auth Guard
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/pages/login");
    } else {
      setIsAuthReady(true);
    }
  }, [router]);

  // 2. Setup React Query Mutation
  const mutation = useMutation({
    mutationFn: createPostAction,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        setShowSuccessPopup(true);
      } else {
        setFieldErrors(result.errors || {});
        
        // Memunculkan pesan error langsung dari server agar ketahuan apa masalah sebenarnya
        toast.error(result.message || "Gagal membuat post. Periksa kembali inputan Anda.");
        
        // Hanya jika benar-benar ada tulisan 'Unauthenticated' atau 'login' kita logout
        if (result.message && (result.message.includes('Unauthenticated') || result.message.includes('login'))) {
          localStorage.removeItem("auth_token");
          setTimeout(() => {
            router.push("/pages/login");
          }, 2000);
        }
      }
    },
  });

  const handleTagClick = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");

    mutation.mutate({
      title,
      body,
      category_id: categoryId,
      tags: selectedTagIds,
      token,
    });
  };

  if (!isAuthReady) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-white">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Memverifikasi sesi...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Discussions
        </Button>
      </div>

      <Card className="bg-[#0f1115] border-[#1e2129] shadow-2xl text-white rounded-xl">
        <CardHeader className="border-b border-[#1e2129] pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#16181d] rounded-xl border border-[#22252e]">
              <PenSquare className="h-5 w-5 text-[#e95723]" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                Create a New Post
              </CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Share your knowledge with the community.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mutation.isError && (
              <div className="p-3 text-sm bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl">
                Terjadi kesalahan saat memproses permintaan.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#16181d] border-[#22252e]"
                minLength={10}
                required
              />
              {fieldErrors.title && (
                <p className="text-xs text-red-400">{fieldErrors.title[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-[#22252e] bg-[#16181d] p-2 text-sm"
                required
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {fieldErrors.category_id && (
                <p className="text-xs text-red-400">
                  {fieldErrors.category_id[0]}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Tags className="h-4 w-4" /> Tags
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-[#16181d] border border-[#22252e] rounded-xl">
                {initialTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={`cursor-pointer ${selectedTagIds.includes(tag.id) ? "bg-[#e95723] text-white" : "bg-[#0f1115] border border-[#22252e]"}`}
                  >
                    {selectedTagIds.includes(tag.id) && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Body Content</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[200px] bg-[#16181d] border-[#22252e]"
                minLength={20}
                required
              />
              {fieldErrors.body && (
                <p className="text-xs text-red-400">{fieldErrors.body[0]}</p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#1e2129]">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-[#e95723] hover:bg-[#d0481b]"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Publish Post"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#16181d] border border-[#2c323f] p-6 rounded-xl shadow-2xl max-w-sm w-full text-center space-y-2 animate-in fade-in zoom-in duration-200">
            <div className="mx-auto w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
              <Check className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Berhasil!</h3>
            <p className="text-sm text-gray-400 pb-4">Data sudah berhasil ditambahkan.</p>
            <Button
              className="w-full bg-[#e95723] hover:bg-[#d0481b] text-white"
              onClick={() => {
                setShowSuccessPopup(false);
                router.push("/home");
                router.refresh();
              }}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
