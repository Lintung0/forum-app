"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Users, FileText, AlertTriangle, MessageSquare } from 'lucide-react';

interface ModStats { total_users: number; total_posts: number; total_comments: number; pending_reports: number; }

export default function ModeratorDashboard() {
  const [stats, setStats] = useState<ModStats>({ total_users: 0, total_posts: 0, total_comments: 0, pending_reports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let response = null;
        try { response = await api.get('/moderator/dashboard-stats'); } catch (e) { response = await api.get('/admin/dashboard-stats'); }
        const payload = response.data?.data || response.data || {};
        const statsSource = payload.stats || payload;
        setStats({
          total_users: statsSource.total_users || statsSource.users_count || 0,
          total_posts: statsSource.total_posts || statsSource.posts_count || 0,
          total_comments: statsSource.total_comments || statsSource.comments_count || 0,
          pending_reports: statsSource.pending_reports || statsSource.reports_pending || 0,
        });
      } catch (error) {
        console.warn('Gagal memuat statistik moderator:', (error as any)?.response?.status || (error as any)?.message || error);
      } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500 text-sm">Memuat statistik moderator...</div>;

  const cardData = [
    { title: 'Total Pengguna', value: stats.total_users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/5' },
    { title: 'Total Postingan', value: stats.total_posts, icon: FileText, color: 'text-green-400', bg: 'bg-green-500/5' },
    { title: 'Total Komentar', value: stats.total_comments, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/5' },
    { title: 'Laporan Aktif', value: stats.pending_reports, icon: AlertTriangle, color: 'text-[#e95723]', bg: 'bg-[#e95723]/5' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderator Dashboard</h1>
        <p className="text-sm text-gray-400">Ringkasan tugas moderator.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-[#161b22]/40 border border-gray-800/80 rounded-xl p-5 flex items-center justify-between group hover:border-gray-700/80 transition-all">
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</span>
                <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl border border-gray-800 ${card.bg} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
