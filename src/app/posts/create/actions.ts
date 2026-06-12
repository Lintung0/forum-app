'use server';

import { revalidatePath } from 'next/cache';
import { CreatePostInput, LaravelApiResponse, CreatedPostData } from './type';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function createPostAction(data: CreatePostInput) {
  try {
    // Sesuai koordinasi merge kelompok, token sanctum ditaruh di sini nantinya
    const token = 'AMBIL_TOKEN_SANCTUM_USER_DISINI'; 

    const response = await fetch(`${BACKEND_API_URL}/api/v1/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
      body: JSON.stringify({
        title: data.title,
        body: data.body,
        category_id: data.category_id,
        tags: data.tags, // Mengirimkan Array UUID String secara Real ke Laravel
      }),
    });

    // Ambil respon berekstensi generic type yang sudah kamu set di type.ts
    const result: LaravelApiResponse<CreatedPostData> = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Gagal membuat postingan.',
        errors: result.errors // Parsing object validation error dari FormRequest Laravel
      };
    }

    // Bersihkan cache Next.js Router Cache agar data terbaru langsung ditarik
    revalidatePath('/home');
    revalidatePath('/posts');

    return {
      success: true,
      message: 'Postingan berhasil diterbitkan!',
      errors: null
    };

  } catch (error) {
    console.error('Error saat melakukan submit post ke Laravel:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan sistem server. Sila coba beberapa saat lagi.',
      errors: null
    };
  }
}