import React from 'react';
import ProfilePublicView from './ProfilePublicView';

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

// Menggunakan async/await Server Component sesuai standar Next.js App Router terbaru
export default async function PublicProfilePage({ params }: PageProps) {
  
  // 1. Bongkar Promise params dengan aman
  const resolvedParams = await params;
  
  // 2. Ambil nilai username dan bersihkan (decode) jika ada karakter unik/spasi dari URL
  const rawUsername = resolvedParams?.username;
  const username = rawUsername ? decodeURIComponent(rawUsername) : '';

  // 3. Validasi cadangan jika username kosong atau tidak terbaca
  if (!username || username === 'undefined') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-sm font-bold text-white">Profil Tidak Ditemukan</h2>
        <p className="text-xs text-gray-400 mt-1">Username tidak valid di dalam URL rute.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-2">
      {/* Mengalirkan username yang sudah bersih dan tervalidasi ke Client View */}
      <ProfilePublicView username={username} />
    </div>
  );
}