"use client";

import axios from "axios";
import RegisterView from "./RegisterView";
import { RegisterFormData } from "./type";
import { useRouter } from "next/navigation"; 

export default function RegisterPage() {
  const router = useRouter();

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      console.log("Mengirim data registrasi ke Laravel...", data);
      
      const response = await axios.post("http://localhost:8000/api/v1/auth/register", data, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (response.data.success || response.status === 201 || response.status === 200) {
        alert("Registrasi sukses, bro! Mengalihkan ke halaman login...");
        
        // KOREKSI URL REDIRECT SESUAI ROUTE KAMU
        router.push("/pages/login");
      }
    } catch (error: any) {
      console.error("Registrasi gagal:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Terjadi kesalahan saat mendaftar.");
    }
  };

  return <RegisterView onSubmit={handleRegisterSubmit} />;
}