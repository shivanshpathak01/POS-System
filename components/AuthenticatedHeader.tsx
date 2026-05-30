"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSession from "@/lib/hooks/useSession";

type AuthenticatedHeaderProps = {
  currentPage: "dashboard" | "pos" | "kitchen" | "payment" | "wallet" | "qr";
  showKitchen?: boolean;
  showBackToDashboard?: boolean;
  title?: string;
};

export default function AuthenticatedHeader({
  currentPage,
  showKitchen = false,
  showBackToDashboard = false,
  title = "MITRA Enterprise",
}: AuthenticatedHeaderProps) {
  const router = useRouter();
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => {
    if (!user?.name) return "U";

    return user.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";
  }, [user?.name]);

  async function handleLogout() {
    await logout();
    router.replace("/");
    router.refresh();
  }

  const linkClass = (page: AuthenticatedHeaderProps["currentPage"]) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition ${currentPage === page ? "bg-[#d8e19b] text-[#11352e]" : "bg-white/10 text-white hover:bg-white/15"}`;

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-[#11352e]/95 text-white shadow-[0_6px_24px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-[#d8e19b] to-[#c5a84d] text-xl font-semibold text-[#16332d] shadow-sm">
            T
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d8e19b]">{title}</p>
            <p className="text-xl font-semibold tracking-[0.18em]">T-CAFE <span className="font-serif italic text-[#76e6d8]">MIST</span></p>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/dashboard" className={linkClass("dashboard")}>Dashboard</Link>
          <Link href="/pos" className={linkClass("pos")}>POS</Link>
          <Link href="/wallet" className={linkClass("wallet")}>Wallet</Link>
          {showKitchen ? <Link href="/kitchen" className={linkClass("kitchen")}>Kitchen</Link> : null}
          {showBackToDashboard ? <Link href="/dashboard" className={linkClass("dashboard")}>Back to dashboard</Link> : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-left transition hover:bg-white/15"
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#d8e19b] text-sm font-bold text-[#11352e]">{initials}</div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">{user?.name ?? "Signed in user"}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d8e19b]">{user?.role ?? "session"}</p>
            </div>
          </button>

          {open ? (
            <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-[#dce3d8] bg-white p-3 text-[#16332d] shadow-[0_20px_60px_rgba(21,41,36,0.18)]">
              <div className="rounded-2xl bg-[#fbfaf7] p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Profile</p>
                <p className="mt-2 font-semibold">{user?.name ?? "Signed in user"}</p>
                <p className="text-sm text-slate-500">{user?.email ?? "user@example.com"}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#c79a17]">{user?.role ?? "member"}</p>
              </div>

              <div className="mt-3 grid gap-2">
                <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-2xl border border-[#dde5d9] px-4 py-3 text-sm font-semibold hover:bg-[#fbfaf7]">Dashboard</Link>
                <Link href="/pos" onClick={() => setOpen(false)} className="rounded-2xl border border-[#dde5d9] px-4 py-3 text-sm font-semibold hover:bg-[#fbfaf7]">POS</Link>
                <Link href="/wallet" onClick={() => setOpen(false)} className="rounded-2xl border border-[#dde5d9] px-4 py-3 text-sm font-semibold hover:bg-[#fbfaf7]">Wallet</Link>
                {showKitchen ? <Link href="/kitchen" onClick={() => setOpen(false)} className="rounded-2xl border border-[#dde5d9] px-4 py-3 text-sm font-semibold hover:bg-[#fbfaf7]">Kitchen</Link> : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl bg-[#11352e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2d27]"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}