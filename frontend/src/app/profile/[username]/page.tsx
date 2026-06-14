import ProfilePublicView from './ProfilePublicView';

export default function ProfilePublicPage({ params }: { params: { username: string } }) {
  return (
    <div className="w-full min-h-screen p-4 md:p-6 bg-[#090a0f]">
      <ProfilePublicView username={params.username} />
    </div>
  );
}
