'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserProfileData } from '../type';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

interface EditProfileForm {
  username: string;
  bio: string;
}

interface EditProfileModalProps {
  user: UserProfileData;
  onClose: () => void;
}

async function updateProfile(username: string, data: EditProfileForm, token: string) {
  const res = await fetch(`${BACKEND_API_URL}/api/v1/users/${username}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw { message: json.message, errors: json.errors };
  return json.data;
}

async function uploadAvatar(username: string, file: File, token: string) {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch(`${BACKEND_API_URL}/api/v1/users/${username}/avatar`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw { message: json.message, errors: json.errors };
  return json.data;
}

export function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileForm>({
    defaultValues: {
      username: user.username,
      bio: user.bio ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: EditProfileForm) => {
      const token = localStorage.getItem('auth_token') ?? '';
      let avatarUrl = user.avatar_url;
      if (selectedFile) {
        const avatarResult = await uploadAvatar(user.username, selectedFile, token);
        avatarUrl = avatarResult.avatar_url;
      }
      const updated = await updateProfile(user.username, formData, token);
      return { ...updated, avatar_url: avatarUrl };
    },
    onSuccess: (data) => {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('auth_user', JSON.stringify({ ...parsed, username: data.username }));
      }
      queryClient.invalidateQueries({ queryKey: ['profileMe'] });
      setSuccessMsg('Profil berhasil diperbarui!');
      setTimeout(() => onClose(), 1200);
    },
    onError: (err: any) => {
      setErrorMsg(err?.message ?? 'Gagal memperbarui profil.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 2MB.');
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data: EditProfileForm) => {
    setErrorMsg('');
    setSuccessMsg('');
    mutation.mutate(data);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#0f1115] border border-[#1e2129] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2129]">
          <h2 className="text-sm font-bold text-white">Edit Profil</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1e2129] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-2 border-[#e95723]/30">
                <AvatarImage src={avatarPreview ?? undefined} />
                <AvatarFallback className="text-xl bg-[#16181d] text-gray-300 font-black">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-[#e95723] hover:underline font-medium"
            >
              {selectedFile ? selectedFile.name : 'Ganti foto profil'}
            </button>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Username</label>
            <Input
              {...register('username', {
                required: 'Username wajib diisi',
                minLength: { value: 3, message: 'Minimal 3 karakter' },
                maxLength: { value: 20, message: 'Maksimal 20 karakter' },
                pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Hanya huruf, angka, dan underscore' },
              })}
              placeholder="username"
              className="bg-[#16181d] border-[#22252e] text-white placeholder-gray-600 rounded-xl h-9 text-sm focus-visible:ring-1 focus-visible:ring-[#e95723] focus-visible:border-[#e95723]"
            />
            {errors.username && (
              <p className="text-[11px] text-red-400">{errors.username.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Bio</label>
            <Textarea
              {...register('bio', { maxLength: { value: 200, message: 'Maksimal 200 karakter' } })}
              placeholder="Ceritakan sedikit tentang dirimu..."
              rows={3}
              className="bg-[#16181d] border-[#22252e] text-white placeholder-gray-600 rounded-xl text-sm resize-none focus-visible:ring-1 focus-visible:ring-[#e95723] focus-visible:border-[#e95723]"
            />
            {errors.bio && (
              <p className="text-[11px] text-red-400">{errors.bio.message}</p>
            )}
          </div>

          {/* Feedback */}
          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-9 text-xs border-[#22252e] bg-[#16181d] hover:bg-[#22252e] text-gray-300 rounded-xl font-medium"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 h-9 text-xs bg-[#e95723] hover:bg-[#d0481b] text-white rounded-xl font-bold gap-1.5 disabled:opacity-60"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...</>
              ) : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
