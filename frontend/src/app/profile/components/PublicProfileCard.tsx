'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserPlus, UserCheck, Users, Calendar, Star, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface FollowerUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface PublicProfileCardProps {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    level: number;
    reputation_points: number;
    posts_count: number;
    accepted_answers_count?: number;
    followers_count: number;
    following_count: number;
    is_followed_by_me?: boolean;
    created_at: string;
    followers?: FollowerUser[];
    following?: FollowerUser[];
    recent_comments?: { is_accepted?: boolean }[];
  };
}
function getFollowKey(username: string) {
  return `follow_status:${username}`;
}
function getStoredFollowStatus(username: string): boolean | null {
  try {
    const val = localStorage.getItem(getFollowKey(username));
    if (val === null) return null;
    return val === 'true';
  } catch {
    return null;
  }
}
function setStoredFollowStatus(username: string, status: boolean) {
  try {
    localStorage.setItem(getFollowKey(username), String(status));
  } catch {}
}

export default function ProfileCard({ user }: PublicProfileCardProps) {
  const acceptedCount =
    user.accepted_answers_count ??
    (user.recent_comments?.filter((c) => c.is_accepted).length ?? 0);

  const [isFollowed, setIsFollowed] = useState<boolean>(
    user.is_followed_by_me ?? false
  );
  const [followersCount, setFollowersCount] = useState(user.followers_count);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [userList, setUserList] = useState<FollowerUser[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    if (user.is_followed_by_me === undefined || user.is_followed_by_me === null) {
      const stored = getStoredFollowStatus(user.username);
      if (stored !== null) {
        setIsFollowed(stored);
      }
    }
  }, [user.username, user.is_followed_by_me]);

  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return 'Jun 2026';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
  };

  const handleFollowToggle = async () => {
    const willFollow = !isFollowed;

    setIsFollowed(willFollow);
    setFollowersCount((prev) => (willFollow ? prev + 1 : Math.max(0, prev - 1)));
    setStoredFollowStatus(user.username, willFollow);

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

      const res = await fetch(
        `${BACKEND_URL}/api/v1/users/${user.username}/${willFollow ? 'follow' : 'unfollow'}`,
        {
          method: willFollow ? 'POST' : 'DELETE',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const alreadyFollowing =
          json?.message?.toLowerCase().includes('sudah follow') ||
          json?.message?.toLowerCase().includes('already');

        if (!alreadyFollowing) {
          setIsFollowed(!willFollow);
          setFollowersCount((prev) => (willFollow ? Math.max(0, prev - 1) : prev + 1));
          setStoredFollowStatus(user.username, !willFollow);
        }
      }
    } catch (error) {
      setIsFollowed(!willFollow);
      setFollowersCount((prev) => (willFollow ? Math.max(0, prev - 1) : prev + 1));
      setStoredFollowStatus(user.username, !willFollow);
      console.error('Gagal melakukan aksi follow/unfollow:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const openUsersModal = async (type: 'followers' | 'following') => {
    setModalTitle(type === 'followers' ? 'Pengikut (Followers)' : 'Mengikuti (Following)');
    setUserList([]); 
    setModalOpen(true);
    setIsModalLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

      const res = await fetch(`${BACKEND_URL}/api/v1/users/${user.username}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        const freshUserData = json.data ?? json;

        if (type === 'followers') {
          const targetFollowers = freshUserData.followers?.data ?? 
                                  freshUserData.followers ?? 
                                  freshUserData.follower?.data ?? 
                                  freshUserData.follower ?? [];
          setUserList(Array.isArray(targetFollowers) ? targetFollowers : []);
        } else {
          const targetFollowing = freshUserData.following?.data ?? 
                                  freshUserData.following ?? 
                                  freshUserData.following_users ?? [];
          setUserList(Array.isArray(targetFollowing) ? targetFollowing : []);
        }
      } else {
        setUserList(type === 'followers' ? user.followers ?? [] : user.following ?? []);
      }
    } catch (error) {
      console.error('Gagal memuat daftar dari server:', error);
      setUserList(type === 'followers' ? user.followers ?? [] : user.following ?? []);
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-[#13151a] border border-[#1e222b] rounded-2xl p-6 text-center space-y-5 w-full relative overflow-hidden shadow-2xl shadow-black/30">
        
        {}
        <div className="relative w-28 h-28 mx-auto group">
          <div className="absolute inset-0 bg-[#e95723]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Avatar className="w-28 h-28 border-4 border-[#1e222b] group-hover:border-[#e95723] transition-all duration-300 relative z-10 shadow-2xl">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="text-3xl bg-[#1a1d24] text-gray-300 font-black">
              {user.username?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-1 right-1 bg-[#e95723] text-white text-[11px] font-black px-2.5 py-1 rounded-full border-2 border-[#13151a] z-20 shadow-lg">
            LVL {user.level ?? 1}
          </span>
        </div>

        {}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight leading-none">@{user.username}</h2>
          <div className="bg-[#e95723]/10 text-[#e95723] text-[10px] font-black px-3 py-1 rounded-full inline-block uppercase tracking-wider">
            Active Member
          </div>
          <p className="text-sm text-gray-400 font-medium max-w-[240px] mx-auto leading-relaxed pt-2">
            {user.bio ?? 'This user hasn\'t written a bio yet.'}
          </p>
        </div>

        {}
        <Button
          onClick={handleFollowToggle}
          disabled={isLoading}
          className={`w-full text-xs font-black h-10 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
            isFollowed
              ? 'bg-[#1a1d24] border border-[#22252e] text-gray-300 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/40 shadow-none'
              : 'bg-[#e95723] hover:bg-[#d84a1a] text-white shadow-[#e95723]/20'
          }`}
        >
          {isFollowed ? (
            <><UserCheck className="h-4 w-4" /> Following</>
          ) : (
            <><UserPlus className="h-4 w-4" /> Follow User</>
          )}
        </Button>

        {}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="p-3 bg-[#1a1d24]/50 rounded-2xl border border-[#22252e] shadow-inner">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500/20" />
              <p className="text-sm font-black text-white tabular-nums">{user.reputation_points}</p>
            </div>
            <p className="text-[9px] text-gray-500 font-black tracking-widest uppercase mt-1">Reputation</p>
          </div>
          <div className="p-3 bg-[#1a1d24]/50 rounded-2xl border border-[#22252e] shadow-inner">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-sm font-black text-[#e95723] tabular-nums">{acceptedCount}</p>
            </div>
            <p className="text-[9px] text-gray-500 font-black tracking-widest uppercase mt-1">Solutions</p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-3 gap-2 bg-[#0f1115] border border-[#1e222b] rounded-2xl p-3 shadow-inner">
          <div
            className="cursor-pointer hover:bg-[#1a1d24] py-1.5 rounded-xl transition-all group"
            onClick={() => openUsersModal('followers')}
          >
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-tight group-hover:text-gray-400">Followers</p>
            <p className="text-sm font-black text-white tabular-nums mt-0.5 group-hover:text-[#e95723]">{followersCount}</p>
          </div>
          <div
            className="cursor-pointer hover:bg-[#1a1d24] py-1.5 rounded-xl transition-all group border-x border-[#1e222b]"
            onClick={() => openUsersModal('following')}
          >
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-tight group-hover:text-gray-400">Following</p>
            <p className="text-sm font-black text-white tabular-nums mt-0.5 group-hover:text-[#e95723]">{user.following_count}</p>
          </div>
          <div className="py-1.5">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-tight">Posts</p>
            <p className="text-sm font-black text-white tabular-nums mt-0.5">{user.posts_count}</p>
          </div>
        </div>

        {}
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-tight pt-1">
          <Calendar className="h-3.5 w-3.5 text-gray-700" />
          <span>Joined {formatMonthYear(user.created_at)}</span>
        </div>
      </Card>

      {}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#13151a] border border-[#1e222b] text-white max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#e95723]" /> {modalTitle}
            </DialogTitle>
            {}
            <DialogDescription className="sr-only">
              Daftar akun eksternal pengguna platform yang terhubung ke dalam daftar pertemanan profil.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 pt-2 custom-scrollbar">
            {isModalLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <Loader2 className="h-5 w-5 text-[#e95723] animate-spin" />
                <p className="text-[11px] text-gray-500">Memuat daftar...</p>
              </div>
            ) : userList.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Belum ada pengguna di daftar ini.</p>
            ) : (
              userList.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-[#16181d] border border-[#1e222b]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="w-8 h-8 border border-[#1e222b]">
                      <AvatarImage src={u.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs bg-[#2c323f] text-gray-300 font-bold">
                        {u.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">@{u.username}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[180px]">{u.bio ?? 'No description.'}</p>
                    </div>
                  </div>
                  <Link href={`/profile/${u.username}`} onClick={() => setModalOpen(false)}>
                    <Button size="sm" variant="outline" className="text-[10px] h-7 border-[#2c323f] bg-transparent text-gray-400 hover:bg-[#1e222b] hover:text-white">
                      Lihat
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}