"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import AuthenticatedHeader from "@/components/AuthenticatedHeader";

export default function PaymentClient({ orderId, initialOrder }: { orderId: string; initialOrder?: any | null }) {
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(initialOrder ?? null);
  const [loading, setLoading] = useState(!initialOrder);
  const [checking, setChecking] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pos/orders/${orderId}`);
      if (!res.ok) {
        setOrder(null);
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!order) {
      load();
    }

    const socket: Socket = io({
      path: "/socket.io",
      transports: ["websocket"],
    });

    socket.emit("order:subscribe", orderId);

    socket.on("payment:updated", (payload: { orderId?: string; order?: any }) => {
      if (payload?.orderId === orderId && payload?.order) {
        setOrder(payload.order);
        setLoading(false);
      }
    });

    socket.on("order:updated", (payload: { orderId?: string; order?: any }) => {
      if (payload?.orderId === orderId && payload?.order) {
        setOrder(payload.order);
        setLoading(false);
      }
    });

    return () => {
      socket.emit("order:unsubscribe", orderId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function simulatePay() {
    setChecking(true);
    try {
      const res = await fetch(`/api/payments/${orderId}/pay`, { method: "POST" });
      if (res.ok) {
        await load();
      } else {
        alert("Payment failed to record");
      }
    } catch {
      alert("Network error");
    } finally {
      setChecking(false);
    }
  }

  async function simulateFail() {
    setChecking(true);
    try {
      const res = await fetch(`/api/payments/${orderId}/fail`, { method: "POST" });
      if (res.ok) {
        await load();
      } else {
        alert("Failed to update payment status");
      }
    } catch {
      alert("Network error");
    } finally {
      setChecking(false);
    }
  }

  async function payWithWallet() {
    setChecking(true);
    try {
      const res = await fetch(`/api/payments/${orderId}/wallet`, { method: "POST", credentials: "include" });
      if (res.ok) {
        await load();
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? "Wallet payment failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setChecking(false);
    }
  }

  if (loading) return <div className="p-6">Loading payment...</div>;
  if (!order) return <div className="p-6">Order not found.</div>;

  const payUrl = `/api/payments/${orderId}/pay`;

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedHeader currentPage="payment" title="MITRA Enterprise" />
      <div className="mx-auto max-w-3xl p-6">
        <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl text-gray-800 font-semibold">Pay for order {order.orderNumber}</h2>
        <p className="mt-2 text-gray-600">Amount: ₹{order.totalAmount}</p>

        <div className="mt-4 flex items-center gap-4">
          <div>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payUrl)}`} alt="qr" />
          </div>
          <div>
            <p className="text-sm text-slate-600">Scan this QR to complete payment (simulated).</p>
            <button onClick={simulatePay} disabled={checking} className="mt-3 rounded bg-green-600 px-3 py-2 text-white">Simulate Pay</button>
            <button onClick={simulateFail} disabled={checking} className="mt-3 ml-2 rounded bg-red-600 px-3 py-2 text-white">Simulate Fail</button>
            <button onClick={payWithWallet} disabled={checking} className="mt-3 ml-2 rounded bg-[#11352e] px-3 py-2 text-white">Pay With Wallet</button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-600">Payment status: <strong>{order.paymentStatus}</strong></p>
          <p className="text-gray-600">Order status: <strong>{order.status}</strong></p>
        </div>

        <div className="mt-6">
          <button onClick={() => router.push('/dashboard')} className="rounded px-3 py-2 bg-[#11352e] text-white">Back to dashboard</button>
        </div>
      </div>
      </div>
    </div>
  );
}
