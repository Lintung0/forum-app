"use client";

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { ReportModal } from './report-modal';
import { cn } from '@/lib/utils';

interface ReportButtonProps {
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  variant?: 'ghost' | 'icon';
}

export const ReportButton: React.FC<ReportButtonProps> = ({ 
  targetId, 
  targetType, 
  variant = 'ghost' 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "flex items-center gap-2 transition-colors",
          variant === 'ghost' 
            ? "text-gray-500 hover:text-red-400 text-sm font-medium" 
            : "p-2 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400"
        )}
        title="Laporkan"
      >
        <Flag className="w-4 h-4" />
        {variant === 'ghost' && <span>Laporkan</span>}
      </button>

      <ReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetId={targetId}
        targetType={targetType}
      />
    </>
  );
};
