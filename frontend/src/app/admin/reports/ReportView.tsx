"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Eye, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { ReportItemData } from './type';

export default function ReportView() {
  const [reports, setReports] = useState<ReportItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports');
      setReports(response.data?.data || response.data || []);
    } catch (error) {
      console.warn("Gagal memuat berkas laporan:", (error as any)?.response?.status || (error as any)?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (id: string) => {
    if (!confirm('Tandai laporan ini sebagai SELESAI ditinjau?')) return;

    try {
      await api.patch(`/admin/reports/${id}/resolve`);
      setReports(prev => prev.map(rep => 
        rep.id === id ? { ...rep, status: 'resolved' } : rep
      ));
    } catch (error) {
      console.warn("Gagal menyelesaikan status laporan:", (error as any)?.response?.status || (error as any)?.message || error);
      alert("Gagal memperbarui status aduan.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800/80 pb-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <AlertTriangle className="w-6 h-6" style={{ color: '#e95723' }} /> Laporan Pelanggaran
        </h1>
        <p className="text-xs text-gray-400 mt-1">Daftar laporan aduan konten spam, sara, atau melanggar aturan komunitas forum.</p>
      </div>

      <div className="bg-[#161b22]/20 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Menyelidiki berkas aduan...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-gray-500 space-y-2">
            <ShieldCheck className="w-8 h-8 mx-auto text-green-500" />
            <p className="text-sm">Forum bersih! Tidak ada aduan pelanggaran aktif saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#161b22]/60 border-b border-gray-800 text-gray-400 font-medium">
                  <th className="p-4 pl-6 w-40">Pelapor</th>
                  <th className="p-4 w-44">Alasan Aduan</th>
                  <th className="p-4">Isi Konten Bermasalah</th>
                  <th className="p-4 text-center w-28">Status</th>
                  <th className="p-4 text-center w-32">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#161b22]/30 transition-colors">
                    <td className="p-4 pl-6 font-medium text-gray-300">@{report.reporter_name}</td>
                    <td className="p-4 text-red-400/90 font-medium text-xs bg-red-950/5">{report.reason}</td>
                    <td className="p-4 max-w-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                          Tipe: {report.reported_type}
                        </span>
                        <p className="text-xs text-gray-400 line-clamp-2 italic bg-[#161b22]/40 p-2 rounded border border-gray-800/50">
                          "{report.content_preview}"
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {report.status === 'pending' ? (
                        <span className="text-[11px] text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wide">Pending</span>
                      ) : (
                        <span className="text-[11px] text-gray-500 font-medium bg-gray-800/30 px-2 py-0.5 rounded border border-gray-700/40 uppercase tracking-wide">Resolved</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        {report.status === 'pending' ? (
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-950/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all border border-orange-900/30"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Solved
                          </button>
                        ) : (
                          <span className="text-xs text-gray-600 italic">Telah Ditinjau</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}