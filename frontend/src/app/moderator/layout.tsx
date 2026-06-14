"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import api from '@/lib/axios';

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkModerator = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
        if (!token) { router.push('/pages/login'); return; }

        const localUserRaw = localStorage.getItem('user') || localStorage.getItem('auth_user');
        let localUser = null;
        try { localUser = localUserRaw ? JSON.parse(localUserRaw) : null; } catch (e) { localUser = null; }

        const extractRole = (u: any) => {
          if (!u) return '';
          if (typeof u.user_role === 'string') return u.user_role.toLowerCase();
          if (typeof u.role === 'string') return u.role.toLowerCase();
          if (Array.isArray(u.roles)) {
            const lower = u.roles.map((r: any) => (typeof r === 'string' ? r.toLowerCase() : (r.name || r.role || '').toString().toLowerCase()));
            if (lower.includes('moderator')) return 'moderator';
            if (lower.includes('admin')) return 'admin';
            return lower[0] || '';
          }
          if (typeof u.role === 'object' && u.role && (u.role.name || u.role.role)) {
            return (u.role.name || u.role.role).toString().toLowerCase();
          }
          return '';
        };

        const localRole = extractRole(localUser);
        if (localRole === 'moderator' || localRole === 'admin') {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        try {
          const res = await api.get('/auth/me');
          const user = res.data?.user || res.data?.data || res.data;
          const role = extractRole(user);
          if (role === 'moderator' || role === 'admin') setAuthorized(true);
          else router.push('/');
        } catch (err) {
          console.warn('Error fetching auth/me for moderator:', (err as any)?.response?.status || (err as any)?.message || err);
          if (localRole === 'moderator' || localRole === 'admin') setAuthorized(true);
          else router.push('/pages/login');
        }
      } catch (e) {
        router.push('/pages/login');
      } finally { setLoading(false); }
    };
    checkModerator();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-gray-400 gap-3">
      <ShieldAlert className="w-10 h-10 animate-pulse text-[#e95723]" />
      <p className="text-sm font-medium tracking-wide">Memverifikasi Hak Akses Moderator...</p>
    </div>
  );

  if (!authorized) return null;

  return (
    <div className="p-6 md:p-8 max-w-5xl w-full mx-auto">
      {children}
    </div>
  );
}
