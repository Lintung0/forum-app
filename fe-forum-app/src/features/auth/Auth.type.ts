export interface RegisterType {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginType {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data: {
    token: string
    user: {
      id: string
      name: string
      email: string
    }
  }
}