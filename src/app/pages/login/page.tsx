"use client";

import axios from "axios";
import Cookies from 'js-cookie';
import LoginView from "./LoginView";
import { LoginFormData } from "./type";
import { useRouter } from "next/navigation"; 

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      console.log("Nembak ke API Laravel Endpoint: /api/v1/auth/login", data);
      
      // Tembak API asli backend Laravel kamu
      const response = await axios.post("http://localhost:8000/api/v1/auth/login", data, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (response.data.success || response.status === 200) {
        const token = response.data.data?.token || response.data.data?.access_token;
        
        // 1. Tetap simpan ke localStorage agar dibaca oleh Navbar kelompokmu
        localStorage.setItem("auth_token", token);
        
        // 2. Kunci Tambahan: Simpan juga ke Cookie agar bisa ditembus oleh Server Action Next.js
        Cookies.set("auth_token", token, { expires: 7 }); // Aktif selama 7 hari

        alert("Login Berhasil, bro! Selamat datang kembali.");
        
        // Redirect otomatis ke halaman utama dan refresh biar Navbar update state login-nya
        router.push("/home");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Login gagal:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Email atau password salah, bro!");
    }
  };

  return <LoginView onSubmit={handleLoginSubmit} />;
}