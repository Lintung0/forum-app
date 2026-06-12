import type { Metadata } from "next";
// Hapus Inter dari import karena Geist sudah mencakup Sans dan Mono yang sangat modern
import { Geist, Geist_Mono } from "next/font/google"; 
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layouts/Navbar";
import Sidebar from "@/components/layouts/Sidebar";

// 1. Inisialisasi Geist Sans (Font utama untuk teks biasa, heading, dll)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Memastikan font langsung siap pakai saat hydration
});

// 2. Inisialisasi Geist Mono (Font untuk blok kode / teks monospace jika ada)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ForumX - Developer Community",
  description: "Ultra modern discussion forum built with Next.js and Laravel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // Tambahkan suppressHydrationWarning di html agar ekstensi browser/password manager tidak memicu error merah lagi
      suppressHydrationWarning 
      className={cn(
        "h-full", 
        "antialiased", 
        "dark" // Mode dark aktif global
      )}
    >
      {/* Tempelkan variabel font di body, 
        lalu panggil font-sans (dari Geist) sebagai standard font aplikasi kamu 
      */}
      <body 
        className={cn(
          "min-h-full flex flex-col bg-[#0f1115] text-[#f8fafc]",
          geistSans.variable,
          geistMono.variable,
          "font-sans" // Menjadikan Geist Sans sebagai default font aplikasi
        )}
      >
        {/* 1. Navbar nempel di atas global */}
        <Navbar />
        
        {/* Wadah utama setelah terpotong tinggi Navbar (h-16 = pt-16) */}
        <div className="flex pt-16 max-w-[1440px] w-full mx-auto flex-1">
          {/* 2. Sidebar nempel di kiri global */}
          <Sidebar />
          
          {/* 3. Area konten dinamis (Halaman Home / Detail Post) */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}