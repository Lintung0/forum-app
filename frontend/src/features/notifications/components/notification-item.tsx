"use client";

import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Bell, CheckCircle2, Check, Trash2 } from "lucide-react";

export type NotificationCategory = 'semua' | 'balasan' | 'suka' | 'sebutan' | 'pengikut' | 'solusi' | 'sistem' | 'belum_dibaca';

export interface Notification {
  id: string;
  type: Exclude<NotificationCategory, 'semua' | 'belum_dibaca'>;
  user: string;
  actionText: string;
  targetTitle: string;
  timeAgo: string;
  isRead: boolean;
}

interface NotificationItemProps {
  item: Notification;
  isSelected: boolean;
  onSelectChange: (checked: boolean) => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  item, 
  isSelected, 
  onSelectChange,
  onMarkAsRead,
  onDelete
}) => {
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'solusi': return <CheckCircle2 className="w-5 h-5 text-amber-500" />;
      case 'balasan': return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'suka': return <ThumbsUp className="w-5 h-5 text-green-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div 
      className={`relative flex items-start gap-4 p-5 rounded-xl border transition-all ${
        !item.isRead 
          ? 'bg-[#161b22]/70 border-l-2 border-l-orange-500 border-y-gray-800 border-r-gray-800' 
          : 'bg-[#161b22]/30 border-gray-800/60'
      }`}
    >
      <div className="pt-1">
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelectChange(!!checked)}
          className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
        />
      </div>

      <div className="p-2 bg-[#0d1117] rounded-full border border-gray-800 flex items-center justify-center">
        {getCategoryIcon(item.type)}
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-base text-gray-300 leading-relaxed pr-16">
          <span className="font-semibold text-white mr-1">{item.user}</span>
          {item.actionText}{' '}
          <span className="text-orange-400 font-medium hover:underline cursor-pointer">
            {item.targetTitle}
          </span>
        </p>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{item.timeAgo}</span>
          <span>•</span>
          <span className="capitalize px-3 py-1 bg-[#21262d] text-gray-400 rounded text-sm">
            {item.type}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-center pl-2">
        {!item.isRead && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMarkAsRead}
            title="Tandai telah dibaca"
            className="w-9 h-9 text-gray-400 hover:text-green-400 hover:bg-[#21262d] rounded-lg transition-colors"
          >
            <Check className="w-5 h-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          title="Hapus notifikasi"
          className="w-9 h-9 text-gray-400 hover:text-red-400 hover:bg-[#21262d] rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};