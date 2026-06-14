"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/layouts/AuthLayout";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormData = z.infer<typeof schema>;

interface LoginViewProps {
  onSubmit: (data: LoginFormData) => void;
}

export default function LoginView({ onSubmit }: LoginViewProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  });

  return (
    <AuthLayout>
      <Card className="bg-zinc-900/40 border-zinc-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.3)] space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e95723] to-[#f59e0b] items-center justify-center shadow-[0_0_20px_rgba(233,87,35,0.4)] mb-2">
            <span className="text-white font-black text-base">V</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            Welcome Back to <span className="bg-gradient-to-r from-[#e95723] to-[#f59e0b] bg-clip-text text-transparent">Voxra</span>
          </h1>
          <p className="text-xs text-zinc-400 font-light">Masuk untuk melanjutkan diskusi dengan developer lainnya.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 px-1">Email Address</label>
            <Input
              type="email"
              {...register("email")}
              placeholder="name@example.com"
              className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-[#e95723] rounded-xl py-5"
            />
            {errors.email && <p className="text-xs text-red-400 px-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-medium text-zinc-400">Password</label>
            </div>
            <Input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-[#e95723] rounded-xl py-5"
            />
            {errors.password && <p className="text-xs text-red-400 px-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#e95723] to-[#d0481b] hover:from-[#f06030] hover:to-[#e95723] text-white font-semibold rounded-xl py-5 shadow-[0_0_20px_rgba(233,87,35,0.2)] transition-all mt-2">
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-500 font-light pt-2 border-t border-zinc-800/60">
          Belum punya akun?{" "}
          <a href="/pages/register" className="text-orange-400 hover:underline font-medium">Daftar Sekarang</a>
        </div>
      </Card>
    </AuthLayout>
  );
}
