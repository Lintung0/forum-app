export interface User {
  id: string
  name: string
  username: string
  email: string
  avatar_url: string | null
  bio: string | null
  reputation_points: number
  level: number
  is_banned: boolean
  created_at: string
}

export interface FollowUser {
  id: string
  name: string
  username: string
  avatar_url: string | null
}

export interface FollowListResponse {
  success: boolean
  data: {
    items: FollowUser[]
    meta: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }
}