"use client";

import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          {session?.user?.name || session?.user?.email}
        </span>
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
          {(session?.user?.name || session?.user?.email || "?")[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
