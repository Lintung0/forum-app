"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import PostCard from "@/components/PostCard";
import { Loader2, Calendar, Users, MessageSquare, UserPlus, UserMinus, Shield } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

type Tab = "posts" | "followers" | "following";

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${username}`);
        const profileData = response.data.data ?? response.data;
        setProfile(profileData);
        setIsFollowing(profileData.is_following ?? false);
        
        const postsRes = await api.get(`/posts?user_id=${profileData.id}`);
        setPosts(postsRes.data.data ?? []);
      } catch (error) {
        toast.error("User not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!isAuthenticated) return toast.error("Please login to follow users");
    try {
      if (isFollowing) {
        await api.delete(`/users/${profile.id}/unfollow`);
        setIsFollowing(false);
        toast.success(`Unfollowed @${username}`);
      } else {
        await api.post(`/users/${profile.id}/follow`);
        setIsFollowing(true);
        toast.success(`Following @${username}`);
      }
    } catch (error) {
      toast.error("Failed to update follow status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-secondary">Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="h-32 bg-gradient-to-r from-accent/20 to-accent/5" />
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-surface shadow-2xl">
                <Image src={profile.avatar_url || "/default-avatar.png"} alt={profile.username} fill className="object-cover" />
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-3xl font-bold text-primary">@{profile.username}</h1>
                  {profile.role && profile.role !== "user" && (
                    <span className={cn(
                      "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider",
                      profile.role === "admin" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      <Shield className="w-3 h-3" />
                      {profile.role}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-secondary text-sm mt-2 justify-center md:justify-start">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {format(new Date(profile.created_at), "MMMM yyyy")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentUser?.id === profile.id ? (
                <button className="bg-surface border border-border hover:bg-background text-primary font-bold px-6 py-2.5 rounded-xl transition-all">
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={handleFollow}
                  className={cn(
                    "flex items-center gap-2 font-bold px-6 py-2.5 rounded-xl transition-all",
                    isFollowing 
                      ? "bg-surface border border-border text-primary hover:border-red-500/50 hover:text-red-400" 
                      : "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20"
                  )}
                >
                  {isFollowing ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-8 mt-12 border-t border-border pt-8 justify-center md:justify-start">
            <div className="text-center md:text-left">
              <p className="text-2xl font-bold text-primary">{profile.posts_count}</p>
              <p className="text-xs text-secondary font-medium uppercase tracking-widest">Posts</p>
            </div>
            <div className="text-center md:text-left cursor-pointer group" onClick={() => setActiveTab("followers")}>
              <p className="text-2xl font-bold text-primary group-hover:text-accent transition-colors">{profile.followers_count}</p>
              <p className="text-xs text-secondary font-medium uppercase tracking-widest">Followers</p>
            </div>
            <div className="text-center md:text-left cursor-pointer group" onClick={() => setActiveTab("following")}>
              <p className="text-2xl font-bold text-primary group-hover:text-accent transition-colors">{profile.following_count}</p>
              <p className="text-xs text-secondary font-medium uppercase tracking-widest">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border">
          {(["posts", "followers", "following"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-4 text-sm font-bold capitalize transition-all relative",
                activeTab === tab ? "text-accent" : "text-secondary hover:text-primary"
              )}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          {activeTab === "posts" && (
            posts.length > 0 ? (
              posts.map((post: any) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="bg-surface border border-border rounded-xl p-12 text-center text-secondary">
                No posts shared yet.
              </div>
            )
          )}
          {activeTab === "followers" && <div className="text-center py-20 text-secondary">Followers list coming soon...</div>}
          {activeTab === "following" && <div className="text-center py-20 text-secondary">Following list coming soon...</div>}
        </div>
      </div>
    </div>
  );
}
