"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createReportApi } from '../services/report-api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam' },
  { id: 'harassment', label: 'Pelecehan/Harassment' },
  { id: 'inappropriate', label: 'Konten Tidak Pantas' },
  { id: 'hate_speech', label: 'Ujaran Kebencian' },
  { id: 'other', label: 'Lainnya' },
];

export const ReportModal: React.FC<ReportModalProps> = ({ 
  isOpen, 
  onClose, 
  targetId, 
  targetType 
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setIsLoading(true);
    try {
      await createReportApi({
        target_id: targetId,
        target_type: targetType,
        reason,
        description
      });
      alert("Laporan berhasil dikirim.");
      onClose();
    } catch (error) {
      console.error("Gagal mengirim laporan:", error);
      alert("Gagal mengirim laporan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#161b22] border-gray-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Laporkan Konten</DialogTitle>
          <DialogDescription className="text-gray-400">
            Pilih alasan mengapa Anda melaporkan {targetType} ini.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            {REPORT_REASONS.map((r) => (
              <label 
                key={r.id} 
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 hover:bg-[#21262d] cursor-pointer transition-colors"
              >
                <input 
                  type="radio" 
                  name="reason" 
                  value={r.id} 
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm">{r.label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Keterangan Tambahan (Opsional)</label>
            <textarea 
              className="w-full min-h-[100px] bg-[#0d1117] border border-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
              placeholder="Berikan detail lebih lanjut..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-400">
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason || isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white border-none"
          >
            {isLoading ? "Mengirim..." : "Kirim Laporan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
