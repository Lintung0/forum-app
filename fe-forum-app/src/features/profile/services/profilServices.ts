
import api from "@/lib/axios"
import { FollowListResponse, User } from "../types/profileTypes"

export const getMe = async (): Promise<User> => {
  const { data } = await api.get("/v1/auth/me")
  return data.data
}

export const getFollowers = async (userId: string): Promise<FollowListResponse> => {
  const { data } = await api.get(`/v1/users/${userId}/followers`)
  return data
}

export const getFollowing = async (userId: string): Promise<FollowListResponse> => {
  const { data } = await api.get(`/v1/users/${userId}/following`)
  return data
}

export const followUser = async (userId: string): Promise<void> => {
  await api.post(`/v1/users/${userId}/follow`)
}

export const unfollowUser = async (userId: string): Promise<void> => {
  await api.delete(`/v1/users/${userId}/unfollow`)
}