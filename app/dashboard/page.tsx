"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const quickStats = [
  { title: "Daily sales", value: "₹48.2K" },
  { title: "Orders", value: "126" },
  { title: "Wallet usage", value: "₹7.4K" },
  { title: "Low stock alerts", value: "5" },
];

const menuHighlights = [
  { title: "Cutting Chai", category: "Tea", price: "₹45" },
  { title: "Masala Chai", category: "Tea", price: "₹55" },
  { title: "Cold Coffee", category: "Coffee", price: "₹90" },
  { title: "Sandwich", category: "Snacks", price: "₹120" },
];

const modules = [
  "Authentication system",
  "Menu management",
  "POS billing system",
  "QR ordering system",
  "Kitchen panel",
  "Wallet and payments",
];

import RequireAuth from "@/components/RequireAuth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });

        if (!active) {
          return;
        }

        if (!response.ok) {
          router.replace("/");
          return;
        }

        const data = (await response.json()) as { user: SessionUser };
        setUser(data.user);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    setMessage("");

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.replace("/");
    } catch {
      setMessage("Logout failed. Please try again.");
    }
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#f5f0e6] text-[#16332d]">
        <header className="border-b border-white/50 bg-[#11352e] px-4 py-3 text-white shadow-[0_6px_24px_rgba(0,0,0,0.08)] sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-[#d8e19b] to-[#c5a84d] text-xl font-semibold text-[#16332d]">T</div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#d8e19b]">MITRA Enterprise</p>
                <p className="text-xl font-semibold tracking-[0.18em]">T-CAFE <span className="font-serif italic text-[#76e6d8]">MIST</span></p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a href="/pos" className="rounded-xl bg-[#d8ae39] px-4 py-2 text-sm font-semibold text-[#102e28] transition hover:bg-[#e0bb4b]">POS</a>
              <a href="/kitchen" className="rounded-xl bg-[#76e6d8] px-4 py-2 text-sm font-semibold text-[#102e28] transition hover:opacity-90">Kitchen</a>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-[#d8ae39] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#102e28] transition hover:bg-[#e0bb4b]"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-[2.25rem] bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-[#c79a17]">Admin dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#16332d] sm:text-5xl">
                Popular <span className="font-serif italic text-[#76e6d8]">Menu</span> operations
              </h1>
              <p className="mt-4 max-w-3xl text-slate-600">
                Session is active. Manage the Day 1 and Day 2 assessment flow from this branded workspace.
              </p>

              {loading ? (
                <p className="mt-6 text-sm text-slate-500">Loading session...</p>
              ) : user ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <article className="rounded-3xl border border-[#dde5d9] bg-[#fbfaf7] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signed in as</p>
                    <p className="mt-2 font-semibold text-[#16332d]">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                  </article>
                  <article className="rounded-3xl border border-[#dde5d9] bg-[#fbfaf7] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Role</p>
                    <p className="mt-2 font-semibold text-[#16332d]">{user.role}</p>
                    <p className="mt-1 text-sm text-slate-500">JWT session active</p>
                  </article>
                  <article className="rounded-3xl border border-[#dde5d9] bg-[#fbfaf7] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Created</p>
                    <p className="mt-2 font-semibold text-[#16332d]">{new Date(user.createdAt).toLocaleDateString()}</p>
                    <p className="mt-1 text-sm text-slate-500">Protected dashboard route</p>
                  </article>
                </div>
              ) : null}

              {message ? <p className="mt-4 text-sm text-rose-700">{message}</p> : null}

              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                {quickStats.map((item) => (
                  <article key={item.title} className="rounded-3xl border border-[#dde5d9] bg-[#fbfaf7] p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.title}</p>
                    <p className="mt-3 text-2xl font-semibold text-[#16332d]">{item.value}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold">QR Menu Generator</h3>
                <p className="text-sm text-slate-600">Create a QR link for a table (public QR ordering).</p>
                <QRGenerator />
              </div>
            </article>

            <aside className="space-y-6">
              <article className="rounded-4xl bg-[#11352e] p-6 text-white shadow-[0_20px_60px_rgba(21,41,36,0.16)]">
                <p className="text-xs uppercase tracking-[0.4em] text-[#76e6d8]">Financial potential</p>
                <h2 className="mt-3 text-3xl font-semibold">₹60L - ₹1.2Cr</h2>
                <p className="mt-3 text-sm text-white/75">Restaurant assessment shell aligned to the cafe-inspired presentation style.</p>
              </article>

              <article className="rounded-4xl bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)]">
                <h2 className="text-lg font-semibold text-[#16332d]">Menu highlights</h2>
                <div className="mt-4 grid gap-3">
                  {menuHighlights.map((item) => (
                    <div key={item.title} className="flex items-center justify-between rounded-[1.25rem] border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3">
                      <div>
                        <p className="font-semibold text-[#16332d]">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.category}</p>
                      </div>
                      <span className="rounded-full bg-[#11352e] px-3 py-1 text-xs font-semibold text-[#d8e19b]">{item.price}</span>
                    </div>
                  ))}
                </div>
              </article>
            </aside>
          </div>

          <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-4xl bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)]">
              <h2 className="text-lg font-semibold text-[#16332d]">Build scope</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {modules.map((module) => (
                  <li key={module} className="rounded-[1.25rem] border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3">
                    {module}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-4xl bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)]">
              <h2 className="text-lg font-semibold text-[#16332d]">Working endpoints</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <p className="rounded-[1.25rem] border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3">/api/auth/register</p>
                <p className="rounded-[1.25rem] border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3">/api/auth/login</p>
                <p className="rounded-[1.25rem] border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3">/api/auth/me</p>
                <p className="rounded-[1.25rem] border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3">/api/categories</p>
                <p className="rounded-[1.25rem] border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3">/api/products</p>
                <p className="rounded-[1.25rem] border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3">/api/pos/orders</p>
              </div>
            </article>
          </section>
        </section>
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-[2.25rem] bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)] sm:p-8">
            <h2 className="text-lg font-semibold">Recent orders</h2>
            <RecentOrders />
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}

function QRGenerator() {
  const [table, setTable] = useState(1);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${base}/qr/${table}`;

  return (
    <div className="mt-3 flex items-center gap-4">
      <input type="text" value={String(table)} onChange={(e) => setTable(Number(e.target.value || 1))} className="w-40 rounded border px-3 py-2" />
      <a href={link} target="_blank" rel="noreferrer" className="rounded px-3 py-2 bg-[#11352e] text-white">Open QR Link</a>
      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`} alt="qr" />
    </div>
  );
}

function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/pos/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]));
  }, []);

  if (orders.length === 0) return <p className="mt-4 text-sm text-slate-500">No recent orders.</p>;

  return (
    <div className="mt-4 space-y-3">
      {orders.slice(0, 8).map((o) => (
        <div key={o._id} className="flex items-center justify-between border rounded p-3">
          <div>
            <div className="font-semibold">{o.orderNumber} • {o.source}</div>
            <div className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">₹{o.totalAmount}</div>
            <div className="text-sm">{o.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}