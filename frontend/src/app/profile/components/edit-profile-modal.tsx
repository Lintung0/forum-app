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

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#13151a] border border-[#1e222b] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e222b] bg-[#16181d]/50">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Edit Profile</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Customize your identity</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-[#1e222b] transition-all border border-transparent hover:border-[#22252e]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

          {}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#e95723]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Avatar className="w-24 h-24 border-4 border-[#1e222b] group-hover:border-[#e95723] transition-all duration-300 relative z-10 shadow-2xl">
                <AvatarImage src={avatarPreview ?? undefined} />
                <AvatarFallback className="text-2xl bg-[#1a1d24] text-gray-300 font-black">
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
              >
                <Camera className="h-6 w-6 text-white" />
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
              className="text-[11px] text-[#e95723] hover:text-[#ff6a3a] font-black uppercase tracking-widest transition-colors"
            >
              {selectedFile ? selectedFile.name : 'Change Profile Picture'}
            </button>
          </div>

          {}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Username</label>
              <Input
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                  maxLength: { value: 20, message: 'Maximum 20 characters' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Alphanumeric and underscores only' },
                })}
                placeholder="your_username"
                className="bg-[#0f1115] border-[#1e222b] text-white placeholder-gray-700 rounded-2xl h-11 text-sm font-medium focus-visible:ring-1 focus-visible:ring-[#e95723] focus-visible:border-[#e95723] transition-all shadow-inner"
              />
              {errors.username && (
                <p className="text-[10px] font-bold text-red-400 ml-1 uppercase tracking-tight">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Bio</label>
              <Textarea
                {...register('bio', { maxLength: { value: 200, message: 'Maximum 200 characters' } })}
                placeholder="Tell us something interesting about yourself..."
                rows={4}
                className="bg-[#0f1115] border-[#1e222b] text-white placeholder-gray-700 rounded-2xl text-sm font-medium resize-none focus-visible:ring-1 focus-visible:ring-[#e95723] focus-visible:border-[#e95723] transition-all shadow-inner p-4"
              />
              {errors.bio && (
                <p className="text-[10px] font-bold text-red-400 ml-1 uppercase tracking-tight">{errors.bio.message}</p>
              )}
            </div>
          </div>

          {}
          {successMsg && (
            <div className="flex items-center gap-3 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 animate-in slide-in-from-bottom-2 duration-300">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {successMsg.toUpperCase()}
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-3 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 animate-in slide-in-from-bottom-2 duration-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {errorMsg.toUpperCase()}
            </div>
          )}

          {}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-11 text-[11px] font-black uppercase tracking-widest border-[#1e222b] bg-[#1a1d24] hover:bg-[#22252e] text-gray-400 hover:text-white rounded-2xl transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 h-11 text-[11px] font-black uppercase tracking-widest bg-[#e95723] hover:bg-[#d0481b] text-white rounded-2xl shadow-lg shadow-[#e95723]/20 gap-2 disabled:opacity-60 transition-all"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
