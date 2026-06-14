"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    const token = localStorage.getItem("auth_token");

    fetch(`${BACKEND_URL}/api/v1/posts/${postId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        const post = json.data ?? json;
        const stored = localStorage.getItem("auth_user");
        const currentUser = stored ? JSON.parse(stored) : null;

        
        if (currentUser && String(post.user?.id) !== String(currentUser.id)) {
          alert("Kamu tidak punya akses untuk mengedit postingan ini.");
          router.back();
          return;
        }

        setTitle(post.title ?? "");
        setBody(post.body ?? "");
        setIsLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data postingan.");
        setIsLoading(false);
      });
  }, [postId, router]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Judul tidak boleh kosong.");
      return;
    }
    if (!body.trim()) {
      alert("Isi postingan tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${BACKEND_URL}/api/v1/posts/${postId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, body }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "Gagal menyimpan perubahan.");
        setIsSaving(false);
        return;
      }

      alert("Postingan berhasil diperbarui!");
      router.push(`/posts/${postId}`);
    } catch {
      alert("Terjadi kesalahan koneksi.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#e95723]" />
        <p className="text-xs text-gray-500">Memuat data postingan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center space-y-3">
        <p className="text-sm text-red-400">{error}</p>
        <Button variant="outline" onClick={() => router.back()} className="text-xs border-[#2c323f] text-gray-300">
          <ArrowLeft className="w-3 h-3 mr-1" /> Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white hover:bg-transparent gap-1.5 pl-0 text-xs"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
        <h1 className="text-sm font-bold text-white tracking-tight">Edit Diskusi</h1>
      </div>

      {}
      <Card className="bg-[#0f1115] border border-[#1e2129] rounded-xl">
        <CardContent className="p-6 space-y-5">
          {}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Judul
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul diskusi..."
              maxLength={255}
              className="bg-[#16181d] border-[#22252e] text-white text-sm placeholder:text-gray-600 focus:border-[#e95723] focus:ring-0 rounded-lg"
            />
            <p className="text-[10px] text-gray-600 text-right">{title.length}/255</p>
          </div>

          {}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Isi Diskusi
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tulis isi diskusimu di sini..."
              rows={10}
              className="bg-[#16181d] border-[#22252e] text-white text-sm placeholder:text-gray-600 focus:border-[#e95723] focus:ring-0 rounded-lg resize-none"
            />
          </div>

          {}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#e95723] hover:bg-[#d84a1a] text-white text-xs font-bold rounded-lg gap-1.5 flex-1"
            >
              {isSaving ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...</>
              ) : (
                <><Save className="h-3.5 w-3.5" /> Simpan Perubahan</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
              className="text-xs border-[#22252e] bg-[#16181d] text-gray-400 hover:text-white hover:bg-[#22252e] rounded-lg"
            >
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}