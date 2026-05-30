"use client";

import React, { useEffect, useState } from "react";
import AuthenticatedHeader from "@/components/AuthenticatedHeader";

type Product = {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
};

export default function QRTablePage({ params }: { params: { table: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const table = params.table || "guest";

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  function addToCart(p: Product) {
    setCart((c) => {
      const found = c.find((x) => x.product._id === p._id);
      if (found) {
        return c.map((x) => (x.product._id === p._id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...c, { product: p, qty: 1 }];
    });
  }

  function updateQty(id: string, qty: number) {
    setCart((c) => c.map((x) => (x.product._id === id ? { ...x, qty: Math.max(1, qty) } : x)));
  }

  function removeItem(id: string) {
    setCart((c) => c.filter((x) => x.product._id !== id));
  }

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const taxRate = 5;
  const taxAmount = +(subtotal * (taxRate / 100)).toFixed(2);
  const total = +(subtotal + taxAmount).toFixed(2);

  async function submitOrder() {
    if (cart.length === 0) return;
    setSubmitting(true);
    const body = {
      source: "qr",
      taxRate,
      discountAmount: 0,
      items: cart.map((c) => ({
        productId: c.product._id,
        productName: c.product.name,
        quantity: c.qty,
        unitPrice: c.product.price,
      })),
    };

    try {
      const res = await fetch("/api/pos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err?.message || "Unable to place order");
        return;
      }

      const data = await res.json();
      // redirect to payment page for QR orders
      window.location.href = `/payment/${data.order._id}`;
    } catch (err) {
      alert("Network error placing order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedHeader currentPage="qr" title="MITRA Enterprise" />
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold mb-4">QR Menu — Table {table}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading && <div>Loading menu...</div>}
              {!loading && products.length === 0 && <div>No products available.</div>}
              {products.map((p) => (
                <div key={p._id} className="p-3 bg-white rounded shadow">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium">{p.name}</h3>
                      <div className="text-sm text-gray-600">₹{p.price.toFixed(2)}</div>
                    </div>
                    <div>
                      <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => addToCart(p)}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="p-3 bg-white rounded shadow">
            <h2 className="font-semibold">Cart</h2>
            {cart.length === 0 && <div className="text-sm text-gray-600">Cart is empty</div>}
            {cart.map((c) => (
              <div key={c.product._id} className="flex items-center justify-between gap-2 py-2 border-b">
                <div>
                  <div className="font-medium">{c.product.name}</div>
                  <div className="text-sm text-gray-600">₹{c.product.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={c.qty} min={1} onChange={(e) => updateQty(c.product._id, Number(e.target.value))} className="w-16 p-1 border rounded" />
                  <button onClick={() => removeItem(c.product._id)} className="text-red-500">Remove</button>
                </div>
              </div>
            ))}

            <div className="mt-3 text-sm">
              <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
              <div>Tax ({taxRate}%): ₹{taxAmount.toFixed(2)}</div>
              <div className="font-semibold">Total: ₹{total.toFixed(2)}</div>
            </div>

            <div className="mt-4">
              <button onClick={submitOrder} disabled={submitting || cart.length === 0} className="w-full px-3 py-2 bg-blue-600 text-white rounded">
                {submitting ? "Placing..." : "Place Order"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
