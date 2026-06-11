'use client'

import { Card, CardContent } from "@/app/components/ui/card"
import { User } from "../types/profileTypes"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Badge } from "@/app/components/ui/badge"
import { Separator } from "@/app/components/ui/separator"


interface ProfileCardProps {
  user: User 
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="bg-[#162032]/95 border border-blue-400/40 rounded-3xl shadow-2xl"
      style={{boxShadow: '0 0 30px rgba(96, 165, 250, 0.3), 0 0 60px rgba(96, 165, 250, 0.1)'}}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center gap-4">

          {/* Avatar */}
          <Avatar className="w-24 h-24 border-4 border-blue-400/40">
            <AvatarImage src={user.avatar_url || ''} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-purple-600 text-white text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Name & Username */}
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-400 text-sm">@{user.username}</p>
          </div>

          {/* Badge Level */}
          <Badge className="bg-gradient-to-r from-purple-600 to-orange-500 text-white border-0">
            Level {user.level}
          </Badge>

          {/* Bio */}
          {user.bio && (
            <p className="text-gray-300 text-sm text-center">{user.bio}</p>
          )}

          <Separator className="bg-blue-400/20" />

          {/* Stats */}
          <div className="flex gap-8 text-center">
            <div>
              <p className="text-white font-bold text-xl">{user.reputation_points}</p>
              <p className="text-gray-400 text-xs">Reputasi</p>
            </div>
            <div>
              <p className="text-white font-bold text-xl">{user.level}</p>
              <p className="text-gray-400 text-xs">Level</p>
            </div>
          </div>

          <Separator className="bg-blue-400/20" />

          {/* Joined */}
          <p className="text-gray-400 text-xs">
            Bergabung sejak {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

        </div>
      </CardContent>
    </Card>
  )
}