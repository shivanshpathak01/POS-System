"use client";

import React, { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";

type OrderItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type Order = {
  _id: string;
  orderNumber: string;
  source: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/pos/orders", { credentials: "include" });
      if (res.status === 401) {
        // not authorized - redirect to login
        window.location.href = "/";
        return;
      }
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/pos/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err?.message || "Unable to update status");
        return;
      }
      const data = await res.json();
      setOrders((o) => o.map((x) => (x._id === id ? data.order : x)));
    } catch (e) {
      alert("Network error");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl text-gray-800 font-semibold mb-4">Kitchen Orders</h1>

          {loading && <div>Loading orders...</div>}

          {!loading && orders.length === 0 && <div>No current orders</div>}

          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="rounded bg-white p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">{order.orderNumber} • {new Date(order.createdAt).toLocaleString()}</div>
                    <div className="text-lg text-gray-800 font-semibold">{order.source.toUpperCase()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-semibold text-gray-800">{order.status}</div>
                  </div>
                </div>

                <div className="mt-3 border-t pt-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center text-gray-800 justify-between py-1">
                      <div>
                        <div className="font-medium text-gray-800">{it.productName}</div>
                        <div className="text-sm text-gray-600">{it.quantity} x ₹{it.unitPrice}</div>
                      </div>
                      <div className="font-semibold">₹{it.lineTotal}</div>
                    </div>
                  ))}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="font-semibold text-gray-800">₹{order.totalAmount}</div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button disabled={updating === order._id} onClick={() => updateStatus(order._id, "preparing")} className="px-3 py-1 rounded bg-yellow-400">Preparing</button>
                    <button disabled={updating === order._id} onClick={() => updateStatus(order._id, "completed")} className="px-3 py-1 rounded bg-green-500 text-white">Complete</button>
                    <button disabled={updating === order._id} onClick={() => updateStatus(order._id, "cancelled")} className="px-3 py-1 rounded bg-red-500 text-white">Cancel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
