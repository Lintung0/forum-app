'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserProfileData } from '../type';
import { Calendar, Edit3, LogOut, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { EditProfileModal } from './edit-profile-modal';
import Link from 'next/link';

interface FollowerUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export function ProfileCard({ user: initialUser }: { user: UserProfileData }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfileData>(initialUser);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isMyOwnProfile, setIsMyOwnProfile] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [userList, setUserList] = useState<FollowerUser[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  useEffect(() => {
    const fetchRealProfile = async () => {
      setIsProfileLoading(true);
      try {
        const storedUser = localStorage.getItem('auth_user');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const token = localStorage.getItem('auth_token');
        const targetUsername = currentUser?.username || initialUser.username;
        
        if (!targetUsername) {
          setIsProfileLoading(false);
          return;
        }

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';
        const res = await fetch(`${BACKEND_URL}/api/v1/users/${targetUsername}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const json = await res.json();
          const realData = json.data ?? json;
          setUser(realData);
          setIsMyOwnProfile(currentUser?.id === realData.id || currentUser?.username === realData.username);
        } else {
          setUser(initialUser);
          setIsMyOwnProfile(currentUser?.id === initialUser.id);
        }
      } catch (error) {
        console.error('Gagal mengambil data profil real dari Laravel:', error);
        setUser(initialUser);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchRealProfile();
  }, [initialUser]);

  const formattedDate = new Date(user.created_at || new Date()).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    Cookies.remove('auth_token');
    router.push('/pages/login');
    router.refresh();
  };
  const openUsersModal = async (type: 'followers' | 'following') => {
    setModalTitle(type === 'followers' ? 'Pengikut (Followers)' : 'Mengikuti (Following)');
    setUserList([]);
    setModalOpen(true);
    setIsModalLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

      const endpoint = `${BACKEND_URL}/api/v1/users/${user.username}/${type}`;
      console.log(`📡 Meminta data dari: ${endpoint}`);

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        console.log(`✅ Respons [${type}]:`, json);

        let rawList = json.data ?? json;
        if (rawList && !Array.isArray(rawList) && Array.isArray(rawList.data)) {
          rawList = rawList.data;
        }

        setUserList(Array.isArray(rawList) ? rawList : []);
      } else {
        console.error(`❌ Server merespons dengan status: ${res.status}`);
        setUserList([]);
      }
    } catch (error) {
      console.error('❌ Gagal memuat daftar relasi user:', error);
      setUserList([]);
    } finally {
      setIsModalLoading(false);
    }
  };
  if (isProfileLoading) {
    return (
      <Card className="bg-[#0f1115] border-[#1e2129] text-white rounded-xl overflow-hidden shadow-xl min-h-[350px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-6 w-6 text-[#e95723] animate-spin" />
          <p className="text-xs text-gray-400">Sinkronisasi profil asli...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-[#13151a] border border-[#1e222b] text-white rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-5">

          {}
          <div className="relative group pt-4">
            <div className="absolute inset-0 bg-[#e95723]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Avatar className="w-28 h-28 border-4 border-[#1e222b] group-hover:border-[#e95723] transition-all duration-300 shadow-2xl relative z-10">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="text-3xl bg-[#1a1d24] text-gray-300 font-black">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-1 right-1 bg-[#e95723] text-white text-[11px] font-black px-2.5 py-1 rounded-full border-2 border-[#13151a] z-20 shadow-lg">
              LVL {user.level ?? 1}
            </span>
          </div>

          {}
          <div className="space-y-2 w-full">
            <h2 className="text-xl font-black tracking-tight text-white leading-none">@{user.username}</h2>
            <div className="bg-[#e95723]/10 text-[#e95723] text-[10px] font-black px-3 py-1 rounded-full inline-block uppercase tracking-wider">
              Expert Contributor
            </div>
            <p className="text-sm text-gray-400 font-medium leading-relaxed px-4 pt-2">
              {user.bio || 'This user prefers to keep their bio a mystery.'}
            </p>
          </div>

          {}
          {isMyOwnProfile && (
            <div className="w-full grid grid-cols-2 gap-3 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="w-full text-[11px] h-9 border-[#22252e] bg-[#1a1d24] hover:bg-[#22252e] text-gray-300 hover:text-white rounded-xl gap-2 font-bold transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="w-full text-[11px] h-9 border-red-900/40 bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded-xl gap-2 font-bold transition-all"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </div>
          )}

          <div className="w-full border-t border-[#1e222b] my-2" />

          {}
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="p-3 bg-[#1a1d24]/50 rounded-2xl border border-[#22252e] shadow-inner">
              <p className="text-sm font-black text-white tabular-nums">{user.reputation_points ?? 0}</p>
              <p className="text-[9px] text-gray-500 font-black mt-1 tracking-widest uppercase">Rep</p>
            </div>
            <div className="p-3 bg-[#1a1d24]/50 rounded-2xl border border-[#22252e] shadow-inner">
              <p className="text-sm font-black text-[#e95723] tabular-nums">{user.accepted_answers_count ?? 0}</p>
              <p className="text-[9px] text-gray-500 font-black mt-1 tracking-widest uppercase">Solusi</p>
            </div>
            <div className="p-3 bg-[#1a1d24]/50 rounded-2xl border border-[#22252e] shadow-inner">
              <p className="text-sm font-black text-white tabular-nums">{user.posts_count ?? 0}</p>
              <p className="text-[9px] text-gray-500 font-black mt-1 tracking-widest uppercase">Posts</p>
            </div>
          </div>

          {}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={() => openUsersModal('followers')}
              className="p-3 bg-[#1a1d24]/50 rounded-2xl border border-[#22252e] hover:border-[#e95723]/50 hover:bg-[#e95723]/5 transition-all group cursor-pointer shadow-inner"
            >
              <p className="text-sm font-black text-white group-hover:text-[#e95723] transition-colors tabular-nums">
                {user.followers_count ?? 0}
              </p>
              <p className="text-[9px] text-gray-500 font-black mt-1 tracking-widest uppercase">Followers</p>
            </button>
            <button
              type="button"
              onClick={() => openUsersModal('following')}
              className="p-3 bg-[#1a1d24]/50 rounded-2xl border border-[#22252e] hover:border-[#e95723]/50 hover:bg-[#e95723]/5 transition-all group cursor-pointer shadow-inner"
            >
              <p className="text-sm font-black text-white group-hover:text-[#e95723] transition-colors tabular-nums">
                {user.following_count ?? 0}
              </p>
              <p className="text-[9px] text-gray-500 font-black mt-1 tracking-widest uppercase">Following</p>
            </button>
          </div>

          {}
          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-tight pt-2">
            <Calendar className="h-3.5 w-3.5 text-gray-700" />
            <span>Member since {formattedDate}</span>
          </div>

        </CardContent>
      </Card>

      {}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#13151a] border border-[#1e222b] text-white max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#e95723]" /> {modalTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Daftar pengguna jaringan internal komunitas sistem.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 pt-2 custom-scrollbar">
            {isModalLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <Loader2 className="h-5 w-5 text-[#e95723] animate-spin" />
                <p className="text-[11px] text-gray-500">Memuat daftar...</p>
              </div>
            ) : userList.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">
                Belum ada pengguna di daftar ini.
              </p>
            ) : (
              userList.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#16181d] border border-[#1e222b]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="w-8 h-8 border border-[#1e222b]">
                      <AvatarImage src={u.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs bg-[#2c323f] text-gray-300 font-bold">
                        {u.username?.[0]?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">@{u.username}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[180px]">
                        {u.bio ?? 'No description.'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/profile/${u.username}`} onClick={() => setModalOpen(false)}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 border-[#2c323f] bg-transparent text-gray-400 hover:bg-[#1e222b] hover:text-white"
                    >
                      Lihat
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {}
      {showEditModal && (
        <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}

export default ProfileCard;