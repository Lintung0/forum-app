"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/layouts/AuthLayout";

const schema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(30),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Password tidak cocok",
  path: ["password_confirmation"],
});

type RegisterFormData = z.infer<typeof schema>;

interface RegisterViewProps {
  onSubmit: (data: RegisterFormData) => void;
}

export default function RegisterView({ onSubmit }: RegisterViewProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  });

  return (
    <AuthLayout>
      <Card className="bg-zinc-900/40 border-zinc-800/80 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.3)] space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-orange-500 items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)] mb-2">
            <span className="text-white font-black text-base">X</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            Join <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">ForumX</span> Today
          </h1>
          <p className="text-xs text-zinc-400 font-light">Buat akunmu sekarang dan mulai diskusi.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { label: "Username", name: "username" as const, type: "text", placeholder: "johndoe" },
            { label: "Email Address", name: "email" as const, type: "email", placeholder: "name@example.com" },
            { label: "Password", name: "password" as const, type: "password", placeholder: "••••••••" },
            { label: "Confirm Password", name: "password_confirmation" as const, type: "password", placeholder: "••••••••" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name} className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 px-1">{label}</label>
              <Input
                type={type}
                {...register(name)}
                placeholder={placeholder}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-purple-500 rounded-xl py-5"
              />
              {errors[name] && <p className="text-xs text-red-400 px-1">{errors[name]?.message}</p>}
            </div>
          ))}

          <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-xl py-5 shadow-[0_0_20px_rgba(147,51,234,0.2)] transition-all mt-2">
            {isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-xs text-zinc-500 font-light pt-2 border-t border-zinc-800/60">
          Sudah punya akun? <a href="/pages/login" className="text-purple-400 hover:underline font-medium">Masuk di sini</a>
        </div>
      </Card>
    </AuthLayout>
  );
}
