"use client";

import RegisterView from "./RegisterView";
import { RegisterFormData } from "./type";
import { useRouter } from "next/navigation";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:8000";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        // Ambil pesan error dari backend (validasi, dll)
        const message =
          json?.message ||
          (json?.errors ? Object.values(json.errors).flat().join(", ") : null) ||
          "Registrasi gagal. Coba lagi.";
        alert(message);
        return;
      }

      // Simpan token & user ke localStorage langsung setelah register
      if (json.data?.token) {
        localStorage.setItem("auth_token", json.data.token);
        localStorage.setItem("auth_user", JSON.stringify(json.data.user));
      }

      alert("Registrasi berhasil! Silakan login.");
      router.push("/pages/login");

    } catch (error) {
      console.error("Registrasi gagal:", error);
      alert("Tidak dapat terhubung ke server. Pastikan backend Laravel sedang berjalan.");
    }
  };

  return <RegisterView onSubmit={handleRegisterSubmit} />;
}
