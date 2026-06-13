export interface RegisterFormData {
  username: string;
  email: string;
  password?: string;
  password_confirmation?: string; // <-- Tambahan untuk sinkronisasi dengan validator Laravel
}