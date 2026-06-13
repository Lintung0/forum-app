    'use client';

    import { Card } from '@/components/ui/card';
    import { Separator } from '@/components/ui/separator';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { Button } from '@/components/ui/button';
    import { ArrowUp, Eye, MessageSquare, Star } from 'lucide-react';
    import { PostDetail } from '../type';

    interface AuthorSidebarProps {
    post: PostDetail;
    }

    export function AuthorSidebar({ post }: AuthorSidebarProps) {
    return (
        <div className="space-y-4 w-full">
        {/* Posted By */}
        <Card className="bg-[#13151a] border border-[#1e222b] rounded-xl overflow-hidden w-full">
            <div className="bg-[#1a1d24] px-4 py-2.5 border-b border-[#1e222b]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Posted By
            </p>
            </div>
            <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-[#e95723]/30">
                <AvatarImage src={post.user?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-[#2c323f] text-gray-300 text-sm font-bold">
                    {post.user?.username?.[0]?.toUpperCase() ?? 'A'}
                </AvatarFallback>
                </Avatar>
                <div>
                <p className="text-sm font-bold text-white tracking-tight">
                    @{post.user?.username ?? 'author'}
                </p>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                    Expert
                </span>
                </div>
            </div>

            <p className="text-[11px] text-gray-400 font-normal leading-relaxed">
                {post.user?.bio ?? 'Active community member.'}
            </p>

            <Separator className="bg-[#1e222b]" />

            <div className="space-y-2 text-xs font-medium">
                <div className="flex justify-between items-center">
                <span className="text-gray-500">Reputation</span>
                <span className="font-bold text-[#e95723] tabular-nums">
                    {post.user?.reputation_points?.toLocaleString() ?? 0}
                </span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-500">Level</span>
                <span className="font-bold text-white tabular-nums">
                    {post.user?.level ?? 1}
                </span>
                </div>
                <div className="flex justify-between items-center">
                <span className="text-gray-500">Responses</span>
                <span className="font-bold text-white tabular-nums">
                    {post.comments?.length ?? 0}
                </span>
                </div>
            </div>

            <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold border-[#2c323f] bg-transparent text-gray-400 hover:bg-[#1e222b] hover:text-white h-8 tracking-wide"
            >
                View Profile
            </Button>
            </div>
        </Card>

        {/* Post Stats */}
        <Card className="bg-[#13151a] border border-[#1e222b] rounded-xl p-4 space-y-3 w-full">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Post Stats
            </p>
            <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1">
                <ArrowUp className="h-3 w-3 text-gray-600" /> Votes
                </span>
                <span className="font-bold text-[#e95723] tabular-nums">{post.vote_score ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1">
                <Eye className="h-3 w-3 text-gray-600" /> Views
                </span>
                <span className="font-bold text-white tabular-nums">{post.view_count ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-gray-600" /> Responses
                </span>
                <span className="font-bold text-white tabular-nums">{post.comments?.length ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1">
                <Star className="h-3 w-3 text-gray-600" /> Status
                </span>
                <span className={`font-bold ${post.is_answered ? 'text-emerald-400' : 'text-amber-400'}`}>
                {post.is_answered ? 'Solved' : 'Open'}
                </span>
            </div>
            </div>
        </Card>
        </div>
    );
    }