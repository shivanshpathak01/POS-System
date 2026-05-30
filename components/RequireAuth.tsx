"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSession from "@/lib/hooks/useSession";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  if (!loading && !user) {
    return null;
  }

  return <>{children}</>;
}
