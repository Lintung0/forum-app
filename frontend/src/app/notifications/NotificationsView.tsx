"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCheck, Bell, SlidersHorizontal, Trash2, MessageSquare, ThumbsUp, CheckCircle2, Check, UserPlus, AtSign } from "lucide-react";
import { Notification, NotificationCategory } from './type';
import { fetchNotificationsApi, markAsReadApi, markAllAsReadApi, deleteNotificationApi } from '@/features/notifications/services/notification-api';

export default function NotificationView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetchNotificationsApi();
        setNotifications(response.data || response);
      } catch (error) {
        console.error("Gagal memuat notifikasi:", error);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const filteredNotifications = notifications.filter(item => {
    if (activeCategory === 'semua') return true;
    if (activeCategory === 'belum_dibaca') return !item.isRead;
    return item.type === activeCategory;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Gagal memperbarui semua notifikasi:", error);
    }
  };

  const handleMarkSingleAsRead = async (id: string) => {
    try {
      await markAsReadApi(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Gagal memperbarui status notifikasi:", error);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus notifikasi ini?')) return;
    try {
      await deleteNotificationApi(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error("Gagal menghapus notifikasi:", error);
    }
  };

  const handleSelectChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFilteredIds = filteredNotifications.map(n => n.id);
      setSelectedIds(allFilteredIds);
    } else {
      setSelectedIds([]);
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'solusi': return <CheckCircle2 className="w-5 h-5" style={{ color: '#e95723' }} />;
      case 'balasan': return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'suka': return <ThumbsUp className="w-5 h-5 text-pink-500 fill-pink-500/10" />;
      case 'sebutan': return <AtSign className="w-5 h-5 text-purple-400" />;
      case 'pengikut': return <UserPlus className="w-5 h-5 text-teal-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const isAllFilteredSelected = filteredNotifications.length > 0 && selectedIds.length === filteredNotifications.length;

  if (loading) return <div className="text-center py-10 text-gray-400">Memuat notifikasi...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6">

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6" style={{ color: '#e95723' }} /> Notifikasi
          </h1>
          {unreadCount > 0 && (
            <Badge className="text-white text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: '#e95723' }}>
              {unreadCount} baru
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-800/80 pb-4">
        {(['semua', 'balasan', 'suka', 'sebutan', 'pengikut', 'solusi', 'sistem'] as NotificationCategory[]).map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIds([]);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                !isActive ? 'bg-[#161b22] text-gray-400 hover:bg-[#21262d] hover:text-white' : ''
              }`}
              style={isActive ? { backgroundColor: 'rgba(233, 87, 35, 0.1)', color: '#e95723', border: '1px solid rgba(233, 87, 35, 0.3)' } : {}}
            >
              {cat}
            </button>
          );
        })}
        
        <button
          onClick={() => {
            setActiveCategory('belum_dibaca');
            setSelectedIds([]);
          }}
          className={`ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory !== 'belum_dibaca' ? 'bg-[#161b22] text-gray-400 border border-gray-800 hover:bg-[#21262d]' : ''
          }`}
          style={activeCategory === 'belum_dibaca' ? { backgroundColor: 'rgba(233, 87, 35, 0.1)', color: '#e95723', border: '1px solid rgba(233, 87, 35, 0.3)' } : {}}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Belum Dibaca
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 px-3 bg-[#161b22]/20 py-2.5 rounded-lg border border-gray-800/40">
        <label className="flex items-center gap-2 cursor-pointer hover:text-gray-200 transition-colors">
          <input 
            type="checkbox" 
            checked={isAllFilteredSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-700 bg-gray-900 accent-[#e95723] h-3.5 w-3.5 cursor-pointer"
          />
          <span>Pilih Semua Halaman Ini ({selectedIds.length} terpilih)</span>
        </label>

        <button onClick={handleMarkAllAsRead} className="flex items-center gap-1.5 hover:text-white transition-colors">
          <CheckCheck className="w-4 h-4 text-green-400" />
          Tandai semua dibaca
        </button>
      </div>

      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-14 text-sm text-gray-500 border border-dashed border-gray-800 rounded-xl bg-[#161b22]/10">
            Tidak ada notifikasi di kategori ini.
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div 
                key={item.id}
                className={`relative flex items-start gap-4 p-5 rounded-xl border transition-all ${
                  !item.isRead ? 'bg-[#161b22]/70 border-y-gray-800 border-r-gray-800' : 'bg-[#161b22]/30 border-gray-800/60'
                }`}
                style={!item.isRead ? { borderLeft: '3px solid #e95723' } : {}}
              >
                <div className="pt-1">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectChange(item.id, !!checked)}
                    className="border-gray-600 data-[state=checked]:bg-[#e95723] data-[state=checked]:border-[#e95723]"
                  />
                </div>

                <div className="p-2 bg-[#0d1117] rounded-full border border-gray-800 flex items-center justify-center">
                  {getCategoryIcon(item.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-300 leading-relaxed pr-16">
                    <span className="font-semibold text-white mr-1">@{item.user}</span>
                    {item.actionText}{' '}
                    <span className="font-medium hover:underline cursor-pointer" style={{ color: '#e95723' }}>
                      {item.targetTitle}
                    </span>
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.timeAgo}</span>
                    <span>•</span>
                    <span className="capitalize px-2 py-0.5 bg-[#21262d] text-gray-400 rounded text-[11px]">
                      {item.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-center pl-2">
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkSingleAsRead(item.id)}
                      title="Tandai telah dibaca"
                      className="p-2 text-gray-400 hover:text-green-400 hover:bg-[#21262d] rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSingle(item.id)}
                    title="Hapus notifikasi"
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#21262d] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}