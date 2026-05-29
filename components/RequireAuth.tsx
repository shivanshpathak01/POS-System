"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useSession from "@/lib/hooks/useSession";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  if (loading) {
    return <div className="p-6">Loading session...</div>;
  }

  if (!user) {
    // client redirect to landing
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }

  return <>{children}</>;
}
