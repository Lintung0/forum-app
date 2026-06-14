import ProfilePublicView from './ProfilePublicView';

export default async function ProfilePublicPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <div className="w-full min-h-screen p-4 md:p-6 bg-[#090a0f]">
      <ProfilePublicView username={username} />
    </div>
  );
}
