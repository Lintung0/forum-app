"use client";

import api from '@/lib/axios';
import RegisterView from "./RegisterView";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegisterSubmit = async (data: { username: string; email: string; password: string; password_confirmation: string }) => {
    try {
      const response = await api.post("/auth/register", data);
      if (response.data.success || response.status === 201 || response.status === 200) {
        alert("Registrasi sukses! Silakan login.");
        router.push("/pages/login");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Terjadi kesalahan saat mendaftar.");
    }
  };

  return <RegisterView onSubmit={handleRegisterSubmit} />;
}
