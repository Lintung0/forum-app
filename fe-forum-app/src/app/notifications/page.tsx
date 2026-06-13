import React from 'react';
import { NotificationList } from '@/features/notifications/components/notification-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifikasi | Forum Diskusi',
  description: 'Kelola semua notifikasi dan interaksi akun Anda',
};

export default function NotificationsPage() {
  return (

    <main className="min-h-screen bg-[#0d1117] text-gray-200 p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <NotificationList />
      </div>
    </main>
  );
}