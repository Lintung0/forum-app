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

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-8 h-8 border-2 border-[#e95723]/20 border-t-[#e95723] rounded-full animate-spin" />
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Memuat notifikasi...</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-6 py-10 pb-32">

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#e95723]/10 rounded-2xl border border-[#e95723]/20">
            <Bell className="w-6 h-6 text-[#e95723]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="text-[11px] font-black bg-[#e95723] text-white px-2.5 py-1 rounded-full shadow-lg shadow-[#e95723]/20 uppercase tracking-tight">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Updates on your activity and community</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#1e222b] pb-6">
        {(['semua', 'balasan', 'suka', 'sebutan', 'pengikut', 'solusi', 'sistem'] as NotificationCategory[]).map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIds([]);
              }}
              className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 border ${
                isActive 
                  ? 'bg-[#e95723] text-white border-[#e95723] shadow-lg shadow-[#e95723]/20' 
                  : 'bg-[#16181d] text-gray-500 border-[#22252e] hover:border-gray-700 hover:text-gray-300'
              }`}
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
          className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 border ${
            activeCategory === 'belum_dibaca'
              ? 'bg-[#e95723] text-white border-[#e95723] shadow-lg shadow-[#e95723]/20'
              : 'bg-[#16181d] text-gray-500 border-[#22252e] hover:border-gray-700 hover:text-gray-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Unread
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-500 px-4 bg-[#16181d]/50 py-3 rounded-2xl border border-[#22252e]">
        <label className="flex items-center gap-3 cursor-pointer hover:text-gray-300 transition-colors">
          <input 
            type="checkbox" 
            checked={isAllFilteredSelected}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-[#2c323f] bg-[#0f1115] checked:bg-[#e95723] h-4 w-4 cursor-pointer accent-[#e95723]"
          />
          <span>{selectedIds.length} Selected</span>
        </label>

        <button onClick={handleMarkAllAsRead} className="flex items-center gap-2 hover:text-white transition-colors group">
          <CheckCheck className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500 border-2 border-dashed border-[#1e222b] rounded-3xl space-y-4 bg-[#13151a]/50">
            <div className="w-16 h-16 bg-[#1a1d24] rounded-full flex items-center justify-center mx-auto border border-[#22252e]">
              <Bell className="w-7 h-7 text-gray-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-white uppercase tracking-tight">No notifications found</p>
              <p className="text-xs text-gray-600">We'll notify you when something important happens.</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div 
                key={item.id}
                className={`group relative flex items-start gap-5 p-5 rounded-2xl border transition-all duration-300 ${
                  !item.isRead ? 'bg-[#16181d] border-[#e95723]/30 shadow-lg shadow-[#e95723]/5' : 'bg-[#13151a] border-[#1e222b] hover:border-gray-800'
                }`}
              >
                {!item.isRead && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#e95723] rounded-l-2xl" />
                )}

                <div className="pt-1">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectChange(item.id, !!checked)}
                    className="border-[#2c323f] data-[state=checked]:bg-[#e95723] data-[state=checked]:border-[#e95723] w-4 h-4"
                  />
                </div>

                <div className="p-2.5 bg-[#0f1115] rounded-xl border border-[#1e222b] flex items-center justify-center shadow-inner">
                  {getCategoryIcon(item.type)}
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <p className="text-sm text-gray-300 leading-relaxed pr-20 font-medium">
                    <span className="font-black text-white mr-1.5 cursor-pointer hover:text-[#e95723] transition-colors">@{item.user}</span>
                    <span className="text-gray-400">{item.actionText}</span>{' '}
                    <span className="font-bold hover:underline cursor-pointer text-[#e95723] ml-1">
                      {item.targetTitle}
                    </span>
                  </p>
                  
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tight text-gray-600">
                    <span>{item.timeAgo}</span>
                    <span className="text-gray-800">•</span>
                    <span className="px-2 py-0.5 bg-[#1a1d24] text-gray-500 rounded-md border border-[#22252e]">
                      {item.type}
                    </span>
                  </div>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkSingleAsRead(item.id)}
                      title="Mark as read"
                      className="p-2 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSingle(item.id)}
                    title="Delete"
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
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