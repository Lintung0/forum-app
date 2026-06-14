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
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

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
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

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
      <Card className="bg-[#13151a] border border-[#1e222b] rounded-xl p-5 text-center space-y-4 w-full relative overflow-hidden">
        
        {/* Avatar & Badge Level */}
        <div className="relative w-24 h-24 mx-auto mt-2">
          <Avatar className="w-24 h-24 border-2 border-[#e95723]/20">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl bg-[#2c323f] text-white font-bold">
              {user.username?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 bg-[#e95723] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#13151a]">
            LVL {user.level ?? 1}
          </span>
        </div>

        {/* Informasi Identitas */}
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">@{user.username}</h2>
          <p className="text-xs text-gray-400 font-normal max-w-[200px] mx-auto leading-relaxed">
            {user.bio ?? 'No bio description written yet.'}
          </p>
        </div>

        {/* Tombol Follow / Unfollow */}
        <Button
          onClick={handleFollowToggle}
          disabled={isLoading}
          className={`w-full text-xs font-bold h-9 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            isFollowed
              ? 'bg-[#1e222b] border border-[#2c323f] text-gray-300 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50'
              : 'bg-[#e95723] hover:bg-[#d84a1a] text-white'
          }`}
        >
          {isFollowed ? (
            <><UserCheck className="h-3.5 w-3.5" /> Following</>
          ) : (
            <><UserPlus className="h-3.5 w-3.5" /> Follow</>
          )}
        </Button>

        {/* Baris 1 — Reputasi & Solusi */}
        <div className="grid grid-cols-2 gap-2 w-full text-center">
          <div className="p-2.5 bg-[#16181d] rounded-xl border border-[#22252e]">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star className="h-3 w-3 text-yellow-500" />
              <p className="text-xs font-black text-white">{user.reputation_points}</p>
            </div>
            <p className="text-[9px] text-gray-500 font-bold tracking-wide uppercase">Reputasi</p>
          </div>
          <div className="p-2.5 bg-[#16181d] rounded-xl border border-[#22252e]">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <p className="text-xs font-black text-[#e95723]">{acceptedCount}</p>
            </div>
            <p className="text-[9px] text-gray-500 font-bold tracking-wide uppercase">Solusi</p>
          </div>
        </div>

        {/* Baris 2 — Followers, Following, Posts */}
        <div className="grid grid-cols-3 gap-1 bg-[#16181d] border border-[#1e222b] rounded-xl p-2.5 text-center">
          <div
            className="cursor-pointer hover:bg-[#1e222b] py-1 rounded-lg transition-colors group"
            onClick={() => openUsersModal('followers')}
          >
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-gray-400">Pengikut</p>
            <p className="text-sm font-extrabold text-white tabular-nums mt-0.5 group-hover:text-[#e95723]">{followersCount}</p>
          </div>
          <div
            className="cursor-pointer hover:bg-[#1e222b] py-1 rounded-lg transition-colors group"
            onClick={() => openUsersModal('following')}
          >
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-gray-400">Mengikuti</p>
            <p className="text-sm font-extrabold text-white tabular-nums mt-0.5 group-hover:text-[#e95723]">{user.following_count}</p>
          </div>
          <div className="py-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Posts</p>
            <p className="text-sm font-extrabold text-white tabular-nums mt-0.5">{user.posts_count}</p>
          </div>
        </div>

        {/* Tanggal Bergabung */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-medium pt-1">
          <Calendar className="h-3 w-3 text-gray-600" />
          <span>Member sejak {formatMonthYear(user.created_at)}</span>
        </div>
      </Card>

      {/* Modal Followers / Following */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#13151a] border border-[#1e222b] text-white max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#e95723]" /> {modalTitle}
            </DialogTitle>
            {/* SOLUSI WARNING ACCESSIBILITY: Menghapus error log console dengan sr-only */}
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