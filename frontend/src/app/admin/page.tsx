"use client";

import React, { useState, useEffect } from 'react';
import { Users, FileText, AlertTriangle, MessageSquare, ArrowUpRight } from 'lucide-react';
import api from '@/lib/axios';

interface DashboardStats {
  total_users: number;
  total_posts: number;
  total_comments: number;
  pending_reports: number;
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_posts: 0,
    total_comments: 0,
    pending_reports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard-stats');
        const payload = response.data?.data || response.data || {};
        const statsSource = payload.stats || payload;
        setStats({
          total_users: statsSource.total_users || statsSource.users_count || statsSource.total_users_count || 0,
          total_posts: statsSource.total_posts || statsSource.posts_count || 0,
          total_comments: statsSource.total_comments || statsSource.comments_count || 0,
          pending_reports: statsSource.pending_reports || statsSource.reports_pending || 0,
        });
      } catch (error) {
        console.warn("Gagal memuat statistik dashboard:", (error as any)?.response?.status || (error as any)?.message || error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cardData = [
    { title: 'Total Pengguna', value: stats.total_users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/5' },
    { title: 'Total Postingan', value: stats.total_posts, icon: FileText, color: 'text-green-400', bg: 'bg-green-500/5' },
    { title: 'Total Komentar', value: stats.total_comments, icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/5' },
    { title: 'Laporan Aktif', value: stats.pending_reports, icon: AlertTriangle, color: 'text-[#e95723]', bg: 'bg-[#e95723]/5' },
  ];

  if (loading) return <div className="text-center py-12 text-gray-500 text-sm">Memuat data ringkasan...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-400">Selamat datang kembali, Admin. Berikut ringkasan aktivitas forum hari ini.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="bg-[#161b22]/40 border border-gray-800/80 rounded-xl p-5 flex items-center justify-between group hover:border-gray-700/80 transition-all"
            >
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
      <div className="bg-[#161b22]/20 border border-gray-800/60 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">Status Integrasi Sistem</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-[#161b22]/40 rounded-lg border border-gray-800/40">
            <span className="text-gray-400">API Gateway Status</span>
            <span className="text-green-400 font-semibold bg-green-950/20 px-2 py-0.5 rounded border border-green-900/30">CONNECTED</span>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-[#161b22]/40 rounded-lg border border-gray-800/40">
            <span className="text-gray-400">Database Driver Sync</span>
            <span className="text-green-400 font-semibold bg-green-950/20 px-2 py-0.5 rounded border border-green-900/30">STABLE</span>
          </div>
        </div>
      </div>

    </div>
  );
}