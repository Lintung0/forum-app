import { LoginType, RegisterType, AuthResponse } from './Auth.type'

const BASE_URL = 'http://127.0.0.1:8000/api'
export const registerApi = async (data: RegisterType): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    }),
  })

  const result = await res.json()

  if (!res.ok) throw new Error(result.message || 'Registrasi gagal')

  return result
}



export const loginApi = async (data: LoginType): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
    }),
  })

  const result = await res.json()

  if (!res.ok) throw new Error(result.message || 'Login gagal')

  return result
}