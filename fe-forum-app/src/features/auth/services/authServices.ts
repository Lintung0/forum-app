import api from "@/lib/axios"



export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  success: boolean
  data: {
    token: string
    user: {
      id: string
      name: string
      email: string
      username: string
      avatar_url: string
      bio: string
      reputation_points: number
      level: number
    }
  }
}

export type User = {
  id: string
  name: string
  email: string
  username: string
  avatar_url: string | null
  bio: string | null
  reputation_points: number
  level: number
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post("/v1/auth/login", payload)
  return data
}

export const getProfile = async (): Promise<User> => {
  const { data } = await api.get("/v1/auth/me")
  return data.data
}