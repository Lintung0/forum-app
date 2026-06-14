'use server';

import { revalidatePath } from 'next/cache';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

export async function createPostAction(data: any) {
  const { token, ...postData } = data;

  try {
    const res = await fetch(`${BACKEND_API_URL}/api/v1/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    const result = await res.json();

    if (!res.ok) {
      return { success: false, message: result.message || "Gagal", errors: result.errors };
    }

    revalidatePath('/posts');
    revalidatePath('/home');

    return { success: true };
  } catch (error) {
    return { success: false, message: "Koneksi server gagal" };
  }
}