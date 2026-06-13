"use client"; // <-- WAJIB TAMBAHKAN INI DI BARIS PERTAMA, BRO!

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/layouts/AuthLayout";

interface LoginViewProps {
  onSubmit: (data: { email: string; password?: string }) => void;
}

export default function LoginView({ onSubmit }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
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
            Welcome Back to <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">ForumX</span>
          </h1>
          <p className="text-xs text-zinc-400 font-light">Masuk untuk melanjutkan diskusi dengan developer lainnya.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <a href="#" className="text-xs text-purple-400 hover:underline font-light">Forgot?</a>
            </div>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-purple-500 rounded-xl py-5"
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-xl py-5 shadow-[0_0_20px_rgba(147,51,234,0.2)] transition-all mt-2">
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-500 font-light pt-2 border-t border-zinc-800/60">
          Belum punya akun?{" "}
          <a href="/register" className="text-orange-400 hover:underline font-medium">Daftar Sekarang</a>
        </div>
      </Card>
    </AuthLayout>
  );
}