"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

export default function UserProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (!session || pathname !== "/") {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4 border border-gray-200">
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500">
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-2xl text-gray-500">
            {session.user?.name?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500">{session.user?.email}</p>
        <button
          onClick={handleSignOut}
          className="text-sm text-red-600 hover:text-red-700 font-medium mt-1"
        >
          Ausloggen
        </button>
      </div>
    </div>
  );
} 