"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/layouts/AuthLayout";

interface RegisterViewProps {
  onSubmit: (data: { username: string; email: string; password?: string; password_confirmation?: string }) => void;
}

export default function RegisterView({ onSubmit }: RegisterViewProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState(""); // <-- State baru

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi kecil di client-side sebelum nembak API
    if (password !== passwordConfirmation) {
      alert("Password dan Confirm Password tidak cocok, bro!");
      return;
    }

    onSubmit({ 
      username, 
      email, 
      password, 
      password_confirmation: passwordConfirmation // <-- Dikirim ke page.tsx
    });
  };

  return (
    <AuthLayout>
      <Card className="bg-zinc-900/40 border-zinc-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.3)] space-y-6">
        
        {/* Header Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-orange-500 items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)] mb-2">
            <span className="text-white font-black text-base">X</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            Join <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">ForumX</span> Today
          </h1>
          <p className="text-xs text-zinc-400 font-light">Buat akunmu sekarang dan mulai bagikan mockup UI/UX terbaikmu.</p>
        </div>

        {/* Form Utama */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 px-1">Username</label>
            <Input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-purple-500 rounded-xl py-5"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 px-1">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-purple-500 rounded-xl py-5"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 px-1">Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-purple-500 rounded-xl py-5"
            />
          </div>

          {/* INPUT FIELD BARU: CONFIRM PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 px-1">Confirm Password</label>
            <Input
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-purple-500 rounded-xl py-5"
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-xl py-5 shadow-[0_0_20px_rgba(147,51,234,0.2)] transition-all mt-2">
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-500 font-light pt-2 border-t border-zinc-800/60">
          Sudah punya akun? <a href="/login" className="text-purple-400 hover:underline font-medium">Masuk di sini</a>
        </div>
      </Card>
    </AuthLayout>
  );
}