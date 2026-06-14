"use client";

import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, Bell, SlidersHorizontal } from "lucide-react";
import { NotificationItem, Notification, NotificationCategory } from './notification-item';
import { fetchNotificationsApi, markAsReadApi, markAllAsReadApi } from '../services/notification-api';

export const NotificationList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('semua');
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

  if (loading) return <div className="text-center py-10 text-gray-400">Memuat notifikasi...</div>;

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-orange-500" /> Notifikasi
          </h1>
          {unreadCount > 0 && (
            <Badge className="bg-orange-600 text-white text-sm px-3 py-0.4 rounded-full">
              {unreadCount} baru
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-4">
        {(['semua', 'balasan', 'suka', 'sebutan', 'pengikut', 'solusi', 'sistem'] as NotificationCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-base font-medium capitalize transition-colors ${
              activeCategory === cat 
                ? 'bg-orange-950/40 text-orange-400 border border-orange-500/30' 
                : 'bg-[#161b22] text-gray-400 hover:bg-[#21262d] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
        
        <button
          onClick={() => setActiveCategory('belum_dibaca')}
          className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-base font-medium transition-colors ${
            activeCategory === 'belum_dibaca'
              ? 'bg-orange-950/40 text-orange-400 border border-orange-500/30'
              : 'bg-[#161b22] text-gray-400 border border-gray-800 hover:bg-[#21262d]'
          }`}
        >
          <SlidersHorizontal className="w-4.5 h-4.5" />
          Belum Dibaca
        </button>
      </div>

      <div className="flex items-center justify-end text-base text-gray-400 px-2">
        <button onClick={handleMarkAllAsRead} className="flex items-center gap-2 hover:text-white transition-colors text-base">
          <CheckCheck className="w-5 h-5 text-green-400" />
          Tandai semua dibaca
        </button>
      </div>

      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
            Tidak ada notifikasi di kategori ini.
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <NotificationItem 
              key={item.id}
              item={item}
              isSelected={false}
              onSelectChange={() => {}}
              onMarkAsRead={() => handleMarkSingleAsRead(item.id)}
              onDelete={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
};