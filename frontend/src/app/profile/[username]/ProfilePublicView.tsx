"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PublicProfileCard from "../components/PublicProfileCard";
import { ProfileCard } from "../components/profile-card";
import { ActivityTabs } from "../components/activity-tabs";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:8000";

async function fetchPublicProfile(username: string) {
  if (!username || username === "undefined") {
    throw new Error("Username tidak valid.");
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BACKEND_API_URL}/api/v1/users/${username}`, {
    headers,
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Gagal mengambil data profil.");
  }
  return json;
}

export default function ProfilePublicView({ username }: { username: string }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [myUsername, setMyUsername] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        const currentUser = JSON.parse(stored);
        setMyUsername(currentUser?.username ?? null);
      } catch {
        setMyUsername(null);
      }
    }
  }, []);

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["publicProfile", username],
    queryFn: () => fetchPublicProfile(username),
    retry: 1,
    enabled: mounted && !!username && username !== "undefined",
    staleTime: 1000 * 60 * 5,
  });

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#e95723]" />
        <p className="text-xs text-gray-500 font-medium">
          Loading @{username}'s profile...
        </p>
      </div>
    );
  }

  if (isError || !apiResponse) {
    return (
      <div className="max-w-md mx-auto my-12 p-5 bg-red-950/20 border border-red-900/40 rounded-xl text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
        <h3 className="text-sm font-bold text-white">Profil Gagal Dimuat</h3>
        <p className="text-xs text-gray-400">
          {(error as Error)?.message || "Terjadi kesalahan"}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.back()}
          className="mt-2 text-xs border-[#2c323f] text-gray-300"
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> Kembali
        </Button>
      </div>
    );
  }

  const userData = apiResponse.data ?? apiResponse;

  const profileData = {
    user: userData,
    recent_posts: userData.recent_posts ?? userData.posts ?? [],
    recent_comments: userData.recent_comments ?? userData.comments ?? [],
  };
  const isOwnProfile =
    userData.is_me === true ||
    userData.is_own_profile === true ||
    (myUsername !== null &&
      myUsername.toLowerCase() === userData.username?.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      {/* Tombol Kembali */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-gray-400 hover:text-white hover:bg-transparent gap-2 pl-0 text-xs font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Postingan
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* SIDEBAR KARTU PROFIL */}
        <aside className="w-full lg:sticky lg:top-6">
          {isOwnProfile ? (
            <ProfileCard user={profileData.user} />
          ) : (
            <PublicProfileCard user={userWithFollowersMock(profileData.user)} />
          )}
        </aside>

        {/* KONTEN UTAMA */}
        <main className="w-full bg-[#0f1115] border border-[#1e2129] rounded-xl p-4 md:p-6 min-h-[500px]">
          {isOwnProfile ? (
            <Tabs defaultValue="posts" className="w-full space-y-4">
              <div className="border-b border-[#1e2129] pb-2">
                <TabsList className="bg-[#16181d] border border-[#22252e] text-gray-400 p-1 rounded-xl">
                  <TabsTrigger
                    value="posts"
                    className="data-[state=active]:bg-[#e95723] data-[state=active]:text-white text-xs rounded-lg px-4 py-1.5 font-semibold"
                  >
                    Posts (
                    {profileData.user.posts_count ??
                      profileData.recent_posts.length ??
                      0}
                    )
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                    className="data-[state=active]:bg-[#e95723] data-[state=active]:text-white text-xs rounded-lg px-4 py-1.5 font-semibold"
                  >
                    Comments (
                    {profileData.user.comments_count ??
                      profileData.recent_comments.length ??
                      0}
                    )
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="posts" className="outline-none">
                <ActivityTabs type="posts" items={profileData.recent_posts} />
              </TabsContent>
              <TabsContent value="comments" className="outline-none">
                <ActivityTabs
                  type="comments"
                  items={profileData.recent_comments}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-[#1e2129] pb-3">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Discussions by @{profileData.user.username} (
                  {profileData.user.posts_count ??
                    profileData.recent_posts.length ??
                    0}
                  )
                </h3>
              </div>
              <ActivityTabs type="posts" items={profileData.recent_posts} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function userWithFollowersMock(user: any) {
  return {
    is_followed_by_me: false,
    followers_count: 0,
    following_count: 0,
    reputation_points: 0,
    accepted_answers_count: 0,
    posts_count: 0,
    level: 1,
    followers: [],
    following: [],
    ...user,
  };
}
