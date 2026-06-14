"use client";

import axios from "axios";
import Cookies from 'js-cookie';
import api from '@/lib/axios';
import LoginView from "./LoginView";
import { LoginFormData } from "./type";
import { useRouter } from "next/navigation"; 

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      console.log("Nembak ke API Laravel Endpoint: /api/v1/auth/login", data);
      
      
      const response = await axios.post("http://localhost:8000/api/v1/auth/login", data, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      if (response.data.success || response.status === 200) {
        const token = response.data.data?.token || response.data.data?.access_token;
        
        
        if (!token) {
          console.error('No token in login response', response.data);
          alert('Login sukses tapi token tidak ditemukan. Cek respons API.');
        }

        localStorage.setItem('auth_token', token || '');
        localStorage.setItem('token', token || '');

        Cookies.set('auth_token', token || '', { expires: 7 });

        try {
          if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (e) {
          console.warn('Failed to set api auth header', e);
        }

        alert("Login Berhasil, bro! Selamat datang kembali.");

        console.log('login response token:', token);

        const userFromLogin = response.data.data?.user || response.data.user || response.data.data?.user_data || null;
        if (userFromLogin) {
          try { localStorage.setItem('user', JSON.stringify(userFromLogin)); } catch (e) { console.warn('failed to store user payload', e); }
        }

        const extractRole = (u: any) => {
          if (!u) return '';
          if (typeof u.user_role === 'string') return u.user_role.toLowerCase();
          if (typeof u.role === 'string') return u.role.toLowerCase();
          if (Array.isArray(u.roles)) {
            const lower = u.roles.map((r: any) => (typeof r === 'string' ? r.toLowerCase() : (r.name || r.role || '').toString().toLowerCase()));
            if (lower.includes('admin')) return 'admin';
            return lower[0] || '';
          }
          if (typeof u.role === 'object' && u.role && (u.role.name || u.role.role)) {
            return (u.role.name || u.role.role).toString().toLowerCase();
          }
          return '';
        };

        let role = extractRole(userFromLogin);
        if (role) {
          console.log('role from login payload:', role);
          if (role === 'admin') router.push('/admin');
          else router.push('/home');
          router.refresh();
        } else {

          try {
            const meRes = await api.get('/auth/me');
            const user = meRes.data?.user || meRes.data?.data || meRes.data;
            role = extractRole(user);
            console.log('role from /user:', role, user);
            if (role === 'admin') router.push('/admin');
            else router.push('/home');
            router.refresh();
          } catch (e) {
            console.error('failed to fetch /user after login', e);
            router.push('/home');
            router.refresh();
          }
        }
      }
    } catch (error: any) {
      console.error("Login gagal:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Email atau password salah, bro!");
    }
  };

  return <LoginView onSubmit={handleLoginSubmit} />;
}