'use client'



import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { useFollowers, useFollowing, useMe } from "@/features/profile/components/hooks/useProfile"
import ProfileCard from "@/features/profile/components/ProfileCard"


export default function MePage() {
  const { data: user, isLoading } = useMe()
  const { data: followersData } = useFollowers(user?.id || '')
  const { data: followingData } = useFollowing(user?.id || '')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f2937] via-[#283548] to-[#1e293b] flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1f2937] via-[#283548] to-[#1e293b] flex items-center justify-center">
        <p className="text-white">User tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f2937] via-[#283548] to-[#1e293b] px-4 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Profile Card */}
        <ProfileCard user={user} />

        {/* Tabs Followers & Following */}
        <Tabs defaultValue="followers" className="w-full">
          <TabsList className="w-full bg-[#162032]/95 border border-blue-400/40">
            <TabsTrigger value="followers" className="flex-1 text-gray-300 data-[state=active]:text-white">
              Followers ({followersData?.data?.meta?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1 text-gray-300 data-[state=active]:text-white">
              Following ({followingData?.data?.meta?.total || 0})
            </TabsTrigger>
          </TabsList>

          {/* Followers List */}
          <TabsContent value="followers">
            <div className="flex flex-col gap-3 mt-4">
              {followersData?.data?.items?.length === 0 && (
                <p className="text-gray-400 text-center py-4">Belum ada followers</p>
              )}
              {followersData?.data?.items?.map((follower) => (
                <div key={follower.id} className="flex items-center gap-3 bg-[#162032]/95 border border-blue-400/40 rounded-2xl p-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={follower.avatar_url || ''} alt={follower.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-purple-600 text-white">
                      {follower.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{follower.name}</p>
                    <p className="text-gray-400 text-xs">@{follower.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Following List */}
          <TabsContent value="following">
            <div className="flex flex-col gap-3 mt-4">
              {followingData?.data?.items?.length === 0 && (
                <p className="text-gray-400 text-center py-4">Belum ada following</p>
              )}
              {followingData?.data?.items?.map((following) => (
                <div key={following.id} className="flex items-center gap-3 bg-[#162032]/95 border border-blue-400/40 rounded-2xl p-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={following.avatar_url || ''} alt={following.name} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-purple-600 text-white">
                      {following.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{following.name}</p>
                    <p className="text-gray-400 text-xs">@{following.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}