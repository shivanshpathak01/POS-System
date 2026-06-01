"use client";

import { useEffect, useState } from "react";
import useSession from "@/lib/hooks/useSession";
import AuthenticatedHeader from "@/components/AuthenticatedHeader";

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
  const { user, loading } = useSession();

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#f5f0e6] text-[#16332d]">
        <AuthenticatedHeader currentPage="dashboard" showKitchen={user?.role === "admin" || user?.role === "staff"} title="MITRA Enterprise" />

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-[2.25rem] bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-[#c79a17]">Admin dashboard</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#16332d] sm:text-5xl">
                Popular <span className="font-serif italic text-[#76e6d8]">Menu</span> operations
              </h1>
              

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

  const relativeLink = `/qr/${table}`;
  const [link, setLink] = useState(relativeLink);

  useEffect(() => {
    setLink(relativeLink); // keep in sync immediately

    if (typeof window === "undefined") return;

    try {
      const origin = window.location.origin || "";
      if (origin) setLink(`${origin}${relativeLink}`);
    } catch {
      // ignore
    }
  }, [table, relativeLink]);

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