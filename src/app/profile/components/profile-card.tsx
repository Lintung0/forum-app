'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfileData } from '../type';
import { Calendar, Edit3, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { EditProfileModal } from './edit-profile-modal';

export function ProfileCard({ user }: { user: UserProfileData }) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  // Gunakan useEffect agar tidak ada hydration mismatch — localStorage hanya dibaca di client
  const [isMyOwnProfile, setIsMyOwnProfile] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    const currentUser = stored ? JSON.parse(stored) : null;
    setIsMyOwnProfile(currentUser?.id === user.id);
  }, [user.id]);

  const formattedDate = new Date(user.created_at).toLocaleDateString('en-US', {
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

  return (
    <>
      <Card className="bg-[#0f1115] border-[#1e2129] text-white rounded-xl overflow-hidden shadow-xl">
        <CardContent className="p-5 flex flex-col items-center text-center space-y-4">

          {/* Avatar */}
          <div className="relative group pt-2">
            <Avatar className="w-24 h-24 border-2 border-[#e95723]/30 group-hover:border-[#e95723] transition-colors shadow-lg">
              <AvatarImage src={user.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl bg-[#16181d] text-gray-300 font-black">
                {user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-1 bg-[#e95723] text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-[#0f1115]">
              LVL {user.level}
            </span>
          </div>

          {/* Username & Bio */}
          <div className="space-y-1 w-full">
            <h2 className="text-lg font-bold tracking-tight">@{user.username}</h2>
            <p className="text-xs text-gray-400 font-normal leading-relaxed px-2 line-clamp-3">
              {user.bio || 'No bio description written yet.'}
            </p>
          </div>

          {/* Tombol Edit & Logout — hanya profil sendiri */}
          {isMyOwnProfile && (
            <div className="w-full space-y-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowEditModal(true)}
                className="w-full text-xs h-8 border-[#22252e] bg-[#16181d] hover:bg-[#22252e] text-gray-300 hover:text-white rounded-lg gap-1.5 font-medium"
              >
                <Edit3 className="h-3 w-3" /> Edit Profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="w-full text-xs h-8 border-red-900/40 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-lg gap-1.5 font-medium"
              >
                <LogOut className="h-3 w-3" /> Logout
              </Button>
            </div>
          )}

          <div className="w-full border-t border-[#1e2129] my-1" />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 w-full text-center">
            <div className="p-2 bg-[#16181d] rounded-xl border border-[#22252e]">
              <p className="text-xs font-black text-white">{user.reputation_points}</p>
              <p className="text-[9px] text-gray-500 font-bold mt-0.5 tracking-wide uppercase">Rep</p>
            </div>
            <div className="p-2 bg-[#16181d] rounded-xl border border-[#22252e]">
              <p className="text-xs font-black text-[#e95723]">{user.accepted_answers_count ?? 0}</p>
              <p className="text-[9px] text-gray-500 font-bold mt-0.5 tracking-wide uppercase">Solusi</p>
            </div>
            <div className="p-2 bg-[#16181d] rounded-xl border border-[#22252e]">
              <p className="text-xs font-black text-white">{user.posts_count}</p>
              <p className="text-[9px] text-gray-500 font-bold mt-0.5 tracking-wide uppercase">Posts</p>
            </div>
          </div>

          {/* Member since */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium pt-1">
            <Calendar className="h-3 w-3 text-gray-600" />
            <span>Member sejak {formattedDate}</span>
          </div>

        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal user={user} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}

export default ProfileCard;
