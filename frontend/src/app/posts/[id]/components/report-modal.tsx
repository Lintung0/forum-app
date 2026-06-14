'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'post' | 'comment';
}

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

const REASON_OPTIONS = [
  'Spam / Iklan tidak jelas',
  'Pelecehan / Perundungan (Harassment)',
  'Ujaran Kebencian (Hate Speech)',
  'Konten Seksual / Pornografi',
  'Informasi Palsu / Hoaks',
  'Pelanggaran Hak Cipta',
  'Lainnya'
];

export function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') ?? localStorage.getItem('token') ?? '' : '';

  const reportMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/api/v1/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          target_id: targetId,
          target_type: targetType,
          reason: reason,
          description: description || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal mengirim laporan');
      return json;
    },
    onSuccess: (data) => {
      alert(data.message || 'Laporan berhasil dikirim. Terima kasih atas partisipasi Anda.');
      setReason('');
      setDescription('');
      onClose();
    },
    onError: (err: Error) => {
      alert(err.message || 'Gagal mengirim laporan.');
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert('Silakan pilih salah satu alasan pelaporan.');
      return;
    }
    reportMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f1115] border border-[#1e2129] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden text-gray-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2129]">
          <div className="flex items-center gap-2" style={{ color: '#e95723' }}>
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-bold text-base text-white">Laporkan {targetType === 'post' ? 'Postingan' : 'Komentar'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#161b22] rounded-md transition-colors text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2.5">
            <label className="text-sm font-semibold text-gray-400 block">Pilih Alasan Utama *</label>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {REASON_OPTIONS.map((option) => {
                const isSelected = reason === option;
                return (
                  <label 
                    key={option} 
                    className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-orange-500/10 font-medium' 
                        : 'bg-[#161b22]/50 border-transparent text-gray-300 hover:bg-[#161b22] hover:border-gray-800'
                    }`}
                    style={isSelected ? { borderColor: 'rgba(233, 87, 35, 0.5)', color: '#e95723' } : {}}
                  >
                    <input
                      type="radio"
                      name="report_reason"
                      value={option}
                      checked={isSelected}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-4 w-4 accent-orange-500"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 block">Keterangan Tambahan (Opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Berikan detail konteks pelanggaran agar mempermudah tugas moderator dalam meninjau..."
              rows={4}
              className="w-full text-sm bg-[#161b22] border border-[#1e2129] rounded-lg p-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none transition-colors"
            />
          </div>

          <div className="flex justify-end items-center gap-3 pt-3 border-t border-[#1e2129]">
            <button
              type="button"
              onClick={onClose}
              disabled={reportMutation.isPending}
              className="px-4 py-2 bg-transparent border border-[#1e2129] hover:bg-[#161b22] text-sm font-medium rounded-lg text-gray-400 hover:text-white transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={reportMutation.isPending}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#e95723' }}
            >
              {reportMutation.isPending ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}