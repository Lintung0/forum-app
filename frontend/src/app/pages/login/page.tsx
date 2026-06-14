"use client";

import api from '@/lib/axios';
import LoginView from "./LoginView";
import { LoginFormData } from "./type";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post("/auth/login", data);
      if (response.data.success || response.status === 200) {
        const token = response.data.data?.token || response.data.data?.access_token;
        if (!token) { alert('Login sukses tapi token tidak ditemukan.'); return; }

        localStorage.setItem('auth_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const user = response.data.data?.user ?? null;
        if (user) localStorage.setItem('auth_user', JSON.stringify(user));

        const getRoles = (u: any): string[] =>
          (u?.roles ?? (u?.role ? [u.role] : []))
            .map((r: any) => (typeof r === 'string' ? r : r?.name ?? '').toLowerCase());

        let roles = getRoles(user);
        if (!roles.length) {
          try {
            const me = await api.get('/auth/me');
            const u = me.data?.data ?? me.data;
            if (u) localStorage.setItem('auth_user', JSON.stringify(u));
            roles = getRoles(u);
          } catch {}
        }

        router.push(roles.includes('admin') ? '/admin' : '/home');
        router.refresh();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Email atau password salah.");
    }
  };

  return <LoginView onSubmit={handleLoginSubmit} />;
}
