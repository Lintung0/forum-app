'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Loader2, AlertCircle, Bell, BellOff, MessageSquare,
  Reply, ThumbsUp, CheckCircle2, UserPlus, CheckCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Notification, NotificationType } from './type';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') ?? '' : '';
}

async function fetchNotifications() {
  const token = getToken();
  const res = await fetch(`${BACKEND_API_URL}/api/v1/notifications`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengambil notifikasi');
  return json.data;
}

async function markAllRead() {
  const token = getToken();
  const res = await fetch(`${BACKEND_API_URL}/api/v1/notifications/read-all`, {
    method: 'PATCH',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
}

async function markOneRead(id: string) {
  const token = getToken();
  await fetch(`${BACKEND_API_URL}/api/v1/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
}

const NOTIF_META: Record<NotificationType, { icon: React.ReactNode; label: string; color: string }> = {
  new_comment: {
    icon: <MessageSquare className="h-3.5 w-3.5" />,
    label: 'mengomentari postinganmu',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  new_reply: {
    icon: <Reply className="h-3.5 w-3.5" />,
    label: 'membalas komentarmu',
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  new_upvote: {
    icon: <ThumbsUp className="h-3.5 w-3.5" />,
    label: 'memberi upvote',
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
  answer_accepted: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: 'menerima jawabanmu',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  new_follower: {
    icon: <UserPlus className="h-3.5 w-3.5" />,
    label: 'mulai mengikutimu',
    color: 'text-[#e95723] bg-[#e95723]/10 border-[#e95723]/20',
  },
};

function getNotifLink(notif: Notification): string {
  if (notif.type === 'new_follower') return `/profile/${notif.actor.username}`;
  if (notif.reference_type === 'comment') return `/posts/${notif.reference_id}`;
  return `/posts/${notif.reference_id}`;
}

function NotificationItem({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) {
  const meta = NOTIF_META[notif.type] ?? NOTIF_META.new_comment;
  const timeAgo = formatDistanceToNow(new Date(notif.created_at), {
    addSuffix: true,
    locale: localeId,
  });

  return (
    <Link
      href={getNotifLink(notif)}
      onClick={() => { if (!notif.is_read) onRead(notif.id); }}
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all group ${
        notif.is_read
          ? 'bg-[#0f1115] border-[#1e2129] hover:border-[#2c323f]'
          : 'bg-[#13151a] border-[#e95723]/20 hover:border-[#e95723]/40'
      }`}
    >
      {/* Unread dot */}
      {!notif.is_read && (
        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#e95723] flex-shrink-0" />
      )}

      {/* Actor Avatar */}
      <Avatar className="w-9 h-9 border border-[#22252e] flex-shrink-0">
        <AvatarImage src={notif.actor.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs bg-[#16181d] text-gray-300 font-black">
          {notif.actor.username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-xs text-gray-300 leading-relaxed">
          <span className="font-bold text-white group-hover:text-[#e95723] transition-colors">
            @{notif.actor.username}
          </span>{' '}
          {meta.label}
        </p>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${meta.color}`}>
            {meta.icon}
            {notif.type.replace('_', ' ')}
          </span>
          <span className="text-[10px] text-gray-600">{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
}

export function NotificationsView() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    staleTime: 1000 * 30,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleReadOne = async (id: string) => {
    await markOneRead(id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
  };

  const unreadCount = data?.items?.filter((n: Notification) => !n.is_read).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#e95723]" />
        <p className="text-xs text-gray-500 font-medium">Memuat notifikasi...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto my-12 p-5 bg-red-950/20 border border-red-900/40 rounded-xl text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
        <p className="text-xs text-gray-400">{(error as Error).message}</p>
      </div>
    );
  }

  const notifications: Notification[] = data?.items ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#e95723]" />
          <h1 className="text-base font-bold text-white">Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="text-[10px] font-black bg-[#e95723] text-white px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="h-7 text-[11px] border-[#22252e] bg-[#16181d] hover:bg-[#22252e] text-gray-300 rounded-lg gap-1.5"
          >
            {markAllMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCheck className="h-3 w-3" />
            )}
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
          <BellOff className="h-10 w-10 text-gray-700" />
          <p className="text-sm font-semibold text-gray-500">Belum ada notifikasi</p>
          <p className="text-xs text-gray-600">Notifikasi akan muncul saat ada aktivitas baru.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <NotificationItem key={notif.id} notif={notif} onRead={handleReadOne} />
          ))}
        </div>
      )}

      {/* Pagination info */}
      {data?.meta && data.meta.total > 0 && (
        <p className="text-center text-[11px] text-gray-600 pt-2">
          Menampilkan {notifications.length} dari {data.meta.total} notifikasi
        </p>
      )}
    </div>
  );
}
