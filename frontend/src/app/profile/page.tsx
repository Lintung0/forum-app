"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfileRedirect() {
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkAndRedirect = () => {
      try {
        const stored = localStorage.getItem("auth_user");
        if (stored) {
          const user = JSON.parse(stored);
          if (user?.username) {
            router.replace(`/profile/${user.username}`);
            return;
          }
        }
        
        
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.replace("/pages/login");
          return;
        }

        
        
        setError(true);
      } catch (e) {
        console.error("Redirect error:", e);
        router.replace("/pages/login");
      }
    };

    checkAndRedirect();
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Failed to resolve profile</p>
        <button 
          onClick={() => router.replace("/pages/login")}
          className="px-6 py-2 bg-[#e95723] text-white rounded-xl text-xs font-black uppercase tracking-widest"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-[#e95723]" />
      <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Resolving Profile...</p>
    </div>
  );
}
