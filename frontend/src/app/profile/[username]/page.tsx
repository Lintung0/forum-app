'use client';

import { use } from 'react';
import ProfilePublicView from './ProfilePublicView';

export default function ProfilePublicPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  return (
    <div className="w-full min-h-screen p-4 md:p-6 bg-[#090a0f]">
      <ProfilePublicView username={username} />
    </div>
  );
}