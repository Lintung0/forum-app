"use client";

import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Eye, CheckCircle2, Trash } from 'lucide-react';
import api from '@/lib/axios';
import { ReportItemData } from './type';

export default function ReportView() {
  const [reports, setReports] = useState<ReportItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let response = null;
      try { response = await api.get('/admin/reports'); } catch (e) { response = await api.get('/moderator/reports'); }
      const payload = response.data?.data || response.data || [];
      const list = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : (payload?.items || []));
      const normalized = list.map((r: any) => ({
        id: String(r.id || r.uuid),
        reporter_name: r.reporter_name || r.user_name || r.reporter?.username || 'unknown',
        reason: r.reason || r.type || 'report',
        reported_type: r.reported_type || r.type || 'post',
        content_preview: r.content_preview || r.content || (r.post?.title || ''),
        status: r.status || 'pending',
      } as ReportItemData));
      setReports(normalized);
    } catch (error) {
      console.warn('Gagal memuat laporan:', (error as any)?.response?.status || (error as any)?.message || error);
    } finally { setLoading(false); }
  };

  const handleResolve = async (id: string) => {
    if (!confirm('Tandai laporan ini sebagai SELESAI?')) return;
    try {
      const endpoint = `/admin/reports/${id}/resolve`;
      await api.patch(endpoint);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    } catch (err) { console.warn('Gagal resolve:', (err as any)?.response?.status || (err as any)?.message || err); }
  };

  const handleClosePost = async (postId: string) => {
    if (!confirm('Tutup post ini?')) return;
    try {
      await api.patch(`/moderator/posts/${postId}/close`);
      alert('Post ditutup.');
    } catch (err) { console.warn('Gagal menutup post:', (err as any)?.response?.status || (err as any)?.message || err); }
  };

  const handleReopenPost = async (postId: string) => {
    if (!confirm('Buka kembali post ini?')) return;
    try {
      await api.patch(`/moderator/posts/${postId}/reopen`);
      alert('Post dibuka kembali.');
    } catch (err) { console.warn('Gagal membuka post:', (err as any)?.response?.status || (err as any)?.message || err); }
  };

  const handleForceDeletePost = async (postId: string) => {
    if (!confirm('Force delete post ini? Tindakan ini permanen.')) return;
    try {
      await api.delete(`/moderator/posts/${postId}`);
      alert('Post dihapus permanen.');
    } catch (err) { console.warn('Gagal hapus post:', (err as any)?.response?.status || (err as any)?.message || err); }
  };

  const handleForceDeleteComment = async (commentId: string) => {
    if (!confirm('Force delete komentar ini? Tindakan ini permanen.')) return;
    try {
      await api.delete(`/moderator/comments/${commentId}`);
      alert('Komentar dihapus permanen.');
    } catch (err) { console.warn('Gagal hapus komentar:', (err as any)?.response?.status || (err as any)?.message || err); }
  };

  if (loading) return <div className="text-center py-12 text-gray-500 text-sm">Menyelidiki berkas aduan...</div>;

  return (
    <div className="bg-[#161b22]/20 border border-gray-800 rounded-xl overflow-hidden">
      {reports.length === 0 ? (
        <div className="text-center py-16 text-gray-500 space-y-2">
          <ShieldCheck className="w-8 h-8 mx-auto text-green-500" />
          <p className="text-sm">Tidak ada aduan aktif.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#161b22]/60 border-b border-gray-800 text-gray-400 font-medium">
                <th className="p-4 pl-6 w-40">Pelapor</th>
                <th className="p-4 w-44">Alasan Aduan</th>
                <th className="p-4">Isi Konten</th>
                <th className="p-4 text-center w-28">Status</th>
                <th className="p-4 text-center w-40">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-[#161b22]/30 transition-colors">
                  <td className="p-4 pl-6 font-medium text-gray-300">@{r.reporter_name}</td>
                  <td className="p-4 text-red-400/90 font-medium text-xs bg-red-950/5">{r.reason}</td>
                  <td className="p-4 max-w-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Tipe: {r.reported_type}</span>
                      <p className="text-xs text-gray-400 line-clamp-2 italic bg-[#161b22]/40 p-2 rounded border border-gray-800/50">"{r.content_preview}"</p>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {r.status === 'pending' ? (
                      <span className="text-[11px] text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wide">Pending</span>
                    ) : (
                      <span className="text-[11px] text-gray-500 font-medium bg-gray-800/30 px-2 py-0.5 rounded border border-gray-700/40 uppercase tracking-wide">Resolved</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      {r.status === 'pending' ? (
                        <button onClick={() => handleResolve(r.id)} className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-950/20 rounded-lg text-xs font-semibold">Mark Solved</button>
                      ) : null}
                      <button onClick={() => handleClosePost(r.id)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-950/20 rounded-lg text-xs font-semibold">Close Post</button>
                      <button onClick={() => handleReopenPost(r.id)} className="p-2 text-green-400 hover:text-green-300 hover:bg-green-950/20 rounded-lg text-xs font-semibold">Reopen</button>
                      <button onClick={() => handleForceDeletePost(r.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg text-xs font-semibold">Delete Post</button>
                      <button onClick={() => handleForceDeleteComment(r.id)} className="p-2 text-red-500 hover:text-red-300 hover:bg-red-950/20 rounded-lg text-xs font-semibold">Delete Comment</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
