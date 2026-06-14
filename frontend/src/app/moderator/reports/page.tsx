import ReportView from './ReportView';

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800/80 pb-5">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">Laporan Moderator</h1>
        <p className="text-xs text-gray-400 mt-1">Kelola laporan pelanggaran sebagai moderator.</p>
      </div>

      <ReportView />
    </div>
  );
}
