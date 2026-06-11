import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { followUser, getFollowers, getFollowing, getMe, unfollowUser } from "../../services/profilServices"


export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  })
}

export const useFollowers = (userId: string) => {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
  })
}

export const useFollowing = (userId: string) => {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
  })
}

export const useFollow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] })
      queryClient.invalidateQueries({ queryKey: ["following"] })
    },
  })
}

export const useUnfollow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] })
      queryClient.invalidateQueries({ queryKey: ["following"] })
    },
  })
}