'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle, LogIn } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileCard } from './components/profile-card';
import { ActivityTabs } from './components/activity-tabs';
import { ProfileApiResponse } from './type';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:8000';

async function fetchProfileData(): Promise<ProfileApiResponse['data']> {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('NOT_LOGGED_IN');

    const meRes = await fetch(`${BACKEND_API_URL}/api/v1/auth/me`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (!meRes.ok) throw new Error('Sesi login tidak valid. Silakan login kembali.');

    const meJson = await meRes.json();
    const username = meJson.data?.username;
    if (!username) throw new Error('Gagal mendapatkan data user.');

    const res = await fetch(`${BACKEND_API_URL}/api/v1/users/${username}`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengambil data profil dari server.');

    return {
        user: json.data,
        recent_posts: json.data.recent_posts ?? [],
        recent_comments: json.data.recent_comments ?? [],
    };
}

export function ProfileView() {
    const [mounted, setMounted] = useState(false);
    const queryClient = useQueryClient();
    const [localPosts, setLocalPosts] = useState<any[]>([]);

    useEffect(() => setMounted(true), []);

    const { data: profile, isLoading, isError, error } = useQuery({
        queryKey: ['profileMe'],
        queryFn: fetchProfileData,
        retry: 1,
        staleTime: 0, 
        enabled: mounted,
    });

    
    useEffect(() => {
        if (profile?.recent_posts) {
            setLocalPosts(profile.recent_posts);
        }
    }, [profile?.recent_posts]);

    const handleDeletePost = (postId: string) => {
        
        setLocalPosts((prev) => prev.filter((p) => p.id !== postId));
        
        queryClient.invalidateQueries({ queryKey: ['profileMe'] });
    };

    if (!mounted || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#e95723]" />
                <p className="text-xs text-gray-500 font-medium">
                    {!mounted ? 'Memuat...' : 'Loading profile data...'}
                </p>
            </div>
        );
    }

    if (isError && (error as Error).message === 'NOT_LOGGED_IN') {
        return (
            <div className="max-w-md mx-auto my-16 p-6 bg-[#0f1115] border border-[#1e2129] rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#e95723]/10 border border-[#e95723]/20 flex items-center justify-center mx-auto">
                    <LogIn className="h-6 w-6 text-[#e95723]" />
                </div>
                <h3 className="text-sm font-bold text-white">Kamu belum login</h3>
                <p className="text-xs text-gray-400">Login dulu untuk melihat profil kamu.</p>
                <Link href="/pages/login">
                    <Button className="bg-[#e95723] hover:bg-[#d0481b] text-white rounded-xl text-xs font-bold px-6">
                        Login Sekarang
                    </Button>
                </Link>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-md mx-auto my-12 p-5 bg-red-950/20 border border-red-900/40 rounded-xl text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">Terjadi Kesalahan</h3>
                <p className="text-xs text-gray-400">{(error as Error).message}</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">
                <aside className="w-full md:sticky md:top-6 space-y-4">
                    <ProfileCard user={profile.user} />
                </aside>
                <main className="w-full bg-[#0f1115] border border-[#1e2129] rounded-xl p-4 md:p-6 min-h-[500px]">
                    <Tabs defaultValue="posts" className="w-full space-y-4">
                        <div className="border-b border-[#1e2129] pb-2">
                            <TabsList className="bg-[#16181d] border border-[#22252e] text-gray-400 p-1 rounded-xl">
                                <TabsTrigger
                                    value="posts"
                                    className="data-[state=active]:bg-[#e95723] data-[state=active]:text-white font-semibold rounded-lg px-4 py-1.5 text-xs transition-all"
                                >
                                    My Posts ({localPosts.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="comments"
                                    className="data-[state=active]:bg-[#e95723] data-[state=active]:text-white font-semibold rounded-lg px-4 py-1.5 text-xs transition-all"
                                >
                                    My Comments ({profile.user.comments_count ?? 0})
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="posts" className="outline-none focus-visible:ring-0">
                            <ActivityTabs
                                type="posts"
                                items={localPosts}
                                isOwner={true}
                                onDelete={handleDeletePost}
                            />
                        </TabsContent>

                        <TabsContent value="comments" className="outline-none focus-visible:ring-0">
                            <ActivityTabs type="comments" items={profile.recent_comments} />
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}