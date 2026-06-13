"use client";

import Cookies from "js-cookie";
import LoginView from "./LoginView";
import { LoginFormData } from "./type";
import { useRouter } from "next/navigation";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        const message =
          json?.message ||
          (json?.errors ? Object.values(json.errors).flat().join(", ") : null) ||
          "Email atau password salah.";
        alert(message);
        return;
      }

      const token = json.data?.token || json.data?.access_token;
      const user = json.data?.user;

      if (!token) {
        alert("Login gagal: token tidak ditemukan.");
        return;
      }

      // Simpan token & data user
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user ?? {}));
      Cookies.set("auth_token", token, { expires: 7 });

      // Trigger storage event supaya Navbar langsung update
      window.dispatchEvent(new Event("storage"));

      router.push("/home");
      router.refresh();

    } catch (error) {
      console.error("Login gagal:", error);
      alert("Tidak dapat terhubung ke server. Pastikan backend Laravel sedang berjalan.");
    }
  };

  return <LoginView onSubmit={handleLoginSubmit} />;
}
