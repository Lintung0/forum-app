"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, Mail, Lock, User } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", data);
      const { token, user } = response.data.data;
      
      setToken(token);
      setUser(user);
      
      toast.success("Account created successfully!");
      router.push("/home");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
          <p className="text-secondary">Join our community today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-secondary">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                {...register("username")}
                type="text"
                placeholder="johndoe"
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-secondary">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-secondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-secondary">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                {...register("password_confirmation")}
                type="password"
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {errors.password_confirmation && <p className="text-xs text-red-400 mt-1">{errors.password_confirmation.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline font-semibold">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
