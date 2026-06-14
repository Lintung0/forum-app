"use client";

import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';
import { UserItemData } from './type';

export default function UserView() {
  const [users, setUsers] = useState<UserItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');

      const payload = response.data?.data || response.data;
      const list = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : (payload?.items || []));

      const normalized = list.map((u: any) => {
        const roleStr = (Array.isArray(u.roles) && (typeof u.roles[0] === 'string' ? u.roles[0] : u.roles[0]?.name)) || u.role || 'user';
        return {
          id: String(u.id || u.uuid || u.user_id || u.username || ''),
          username: u.username || u.name || u.user_name || undefined,
          name: u.name || u.username || u.user_name || (u.email || '').split('@')[0] || '',
          email: u.email || '',
          role: roleStr as 'admin' | 'moderator' | 'user',
          is_banned: !!u.is_banned,
          posts_count: u.posts_count || u.posts?.length || 0,
          created_at: u.created_at || u.createdAt || undefined,
        } as UserItemData;
      });
      setUsers(normalized || []);
    } catch (error) {
      console.warn("Gagal memuat data users:", (error as any)?.response?.status || (error as any)?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (usernameOrId: string | undefined, currentBanStatus: boolean, displayName: string) => {
    const actionText = currentBanStatus ? 'membuka blokir (unban)' : 'memblokir (ban)';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} user "${displayName}"?`)) return;

    try {
      const target = usernameOrId || '';
      const endpoint = currentBanStatus ? `/admin/users/${target}/unban` : `/admin/users/${target}/ban`;
      await api.patch(endpoint);

      setUsers(prev => prev.map(user => 
        (user.username === usernameOrId || user.id === usernameOrId) ? { ...user, is_banned: !currentBanStatus } : user
      ));
    } catch (error) {
      console.warn("Gagal mengubah status ban user:", (error as any)?.response?.status || (error as any)?.message || error);
      alert("Gagal mengeksekusi tindakan moderasi.");
    }
  };

  const filteredUsers = users.filter(user =>
    (user.name || user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800/80 pb-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Users className="w-6 h-6" style={{ color: '#e95723' }} /> Kelola Pengguna
        </h1>
        <p className="text-xs text-gray-400 mt-1">Pantau hak akses anggota forum dan berikan sanksi pemblokiran jika diperlukan.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
        <Input
          type="text"
          placeholder="Cari nama atau email pengguna..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-[#161b22]/60 border-gray-800 text-gray-200 text-sm placeholder:text-gray-500 focus-visible:ring-[#e95723]/40 h-10 rounded-xl"
        />
      </div>

      <div className="bg-[#161b22]/20 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Memuat daftar pengguna...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-500 space-y-2">
            <UserCheck className="w-8 h-8 mx-auto text-gray-600" />
            <p className="text-sm">Tidak ada pengguna yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#161b22]/60 border-b border-gray-800 text-gray-400 font-medium">
                  <th className="p-4 pl-6">Nama Pengguna</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Role</th>
                  <th className="p-4 text-center">Status Akun</th>
                  <th className="p-4 text-center w-32">Aksi Sanksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#161b22]/30 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-white">{user.name}</td>
                    <td className="p-4 font-mono text-xs text-gray-400">{user.email}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        user.role === 'admin' 
                          ? 'bg-red-950/30 text-red-400 border-red-900/40' 
                          : user.role === 'moderator' 
                            ? 'bg-blue-950/30 text-blue-400 border-blue-900/40' 
                            : 'bg-gray-800/40 text-gray-400 border-gray-700/50'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {user.is_banned ? (
                        <span className="text-xs text-red-400 font-medium bg-red-500/5 px-2 py-0.5 rounded border border-red-500/20">Banned</span>
                      ) : (
                        <span className="text-xs text-green-400 font-medium bg-green-500/5 px-2 py-0.5 rounded border border-green-500/20">Aktif</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleBan(user.username || user.id, user.is_banned, user.username || user.name)}
                          disabled={user.role === 'admin'}
                          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                            user.is_banned 
                              ? 'text-green-400 hover:bg-green-950/20' 
                              : 'text-red-400 hover:bg-red-950/20 disabled:opacity-30 disabled:hover:bg-transparent'
                          }`}
                        >
                          {user.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          {user.is_banned ? 'Unban' : 'Ban Account'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}