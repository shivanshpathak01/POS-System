"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import AuthenticatedHeader from "@/components/AuthenticatedHeader";
import useSession from "@/lib/hooks/useSession";

type WalletTransaction = {
  _id: string;
  type: string;
  amount: number;
  credits: number;
  balanceBefore: number;
  balanceAfter: number;
  note?: string;
  reference?: string;
  createdAt: string;
};

type Wallet = {
  _id: string;
  balance: number;
  credits: number;
  currency?: string;
  isActive?: boolean;
};

export default function WalletPage() {
  const { user } = useSession();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [amount, setAmount] = useState("500");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadWallet() {
      if (!user?.id) return;

      setLoading(true);

      try {
        const walletResponse = await fetch("/api/wallets", { credentials: "include" });
        if (!walletResponse.ok) {
          setWallet(null);
          setTransactions([]);
          return;
        }

        const walletData = await walletResponse.json();
        const nextWallet = walletData.wallet ?? null;
        setWallet(nextWallet);

        if (nextWallet?._id) {
          const txResponse = await fetch(`/api/wallets/${nextWallet._id}/transactions`, { credentials: "include" });
          if (txResponse.ok) {
            const txData = await txResponse.json();
            setTransactions(txData.transactions || []);
          } else {
            setTransactions([]);
          }
        }
      } catch {
        setWallet(null);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    loadWallet();
  }, [user?.id]);

  async function handleTopUp() {
    if (!wallet?._id) return;

    setSubmitting(true);
    try {
      const parsedAmount = Number(amount);

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        alert("Enter a valid amount");
        return;
      }

      const res = await fetch(`/api/wallets/${wallet._id}/topup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, creditMultiplier: 1, reference: "manual", note: "User top-up" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? "Unable to top up wallet");
        return;
      }

      const data = await res.json();
      setWallet(data.wallet);
      setTransactions((current) => [data.transaction, ...current]);
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#f5f0e6] text-[#16332d]">
        <AuthenticatedHeader currentPage="wallet" title="MITRA Enterprise" />

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2.25rem] bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-[#c79a17]">Wallet</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#16332d] sm:text-5xl">Your balance</h1>

              {loading ? (
                <p className="mt-6 text-sm text-slate-500">Loading wallet...</p>
              ) : wallet ? (
                <>
                  <div className="mt-6 rounded-[2rem] bg-[#11352e] p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.4em] text-[#76e6d8]">Available balance</p>
                    <p className="mt-3 text-4xl font-semibold">₹{wallet.balance.toFixed(2)}</p>
                    <p className="mt-2 text-sm text-white/70">Credits: {wallet.credits.toFixed(2)} • {wallet.currency ?? "INR"}</p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      type="number"
                      min="1"
                      className="rounded-2xl border border-[#d8e0d6] bg-[#fbfaf7] px-4 py-3 outline-none focus:border-[#11352e]"
                      placeholder="Top-up amount"
                    />
                    <button
                      type="button"
                      onClick={handleTopUp}
                      disabled={submitting}
                      className="rounded-2xl bg-[#d8ae39] px-5 py-3 font-semibold text-[#102e28] transition hover:bg-[#e0bb4b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Updating..." : "Top up"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-6 text-sm text-slate-500">Wallet not found for this account.</p>
              )}
            </article>

            <article className="rounded-[2.25rem] bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-[#c79a17]">Transactions</p>
              <h2 className="mt-4 text-3xl font-semibold text-[#16332d]">Recent activity</h2>

              <div className="mt-6 space-y-3">
                {transactions.length === 0 ? (
                  <p className="rounded-3xl border border-dashed border-[#cbd6c7] bg-[#fbfaf7] px-4 py-6 text-sm text-slate-500">No wallet transactions yet.</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction._id} className="rounded-3xl border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-[#16332d]">{transaction.type}</p>
                          <p className="text-sm text-slate-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                        </div>
                        <p className="font-semibold text-[#11352e]">₹{transaction.amount.toFixed(2)}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">Balance: ₹{transaction.balanceBefore.toFixed(2)} → ₹{transaction.balanceAfter.toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>
        </section>
      </main>
    </RequireAuth>
  );
}