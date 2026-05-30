"use client";

import { useCallback, useEffect, useState } from "react";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheUser = useCallback((nextUser: SessionUser | null) => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      if (nextUser) {
        window.sessionStorage.setItem("mitra_session_user", JSON.stringify(nextUser));
      } else {
        window.sessionStorage.removeItem("mitra_session_user");
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        cacheUser(null);
        return;
      }
      const data = await res.json();
      const nextUser = data.user ?? null;
      setUser(nextUser);
      cacheUser(nextUser);
    } catch (e) {
      setError("Network error");
      setUser(null);
      cacheUser(null);
    } finally {
      setLoading(false);
    }
  }, [cacheUser]);

  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem("mitra_session_user");

      if (cached) {
        setUser(JSON.parse(cached) as SessionUser);
        setLoading(false);
      } else {
        load();
      }
    } catch {
      load();
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        load();
      }
    }

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [load]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setUser(null);
      cacheUser(null);
    } catch {
      // ignore
    }
  }

  return { user, loading, error, reload: load, logout };
}
