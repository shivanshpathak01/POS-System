"use client";

import { useMemo, useState, useEffect } from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  category?: { name?: string } | string;
  isVeg?: boolean;
  stock?: number;
};

type CartItem = { product: Product; quantity: number };

import RequireAuth from "@/components/RequireAuth";

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.product._id === product._id);

      if (existing) {
        return current.map((item) => (item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [...current, { product, quantity: 1 }];
    });
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#f5f0e6] text-[#16332d]">
      <header className="border-b border-white/50 bg-[#11352e] px-4 py-3 text-white shadow-[0_6px_24px_rgba(0,0,0,0.08)] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d8e19b]">MITRA Enterprise</p>
            <h1 className="text-2xl font-semibold tracking-[0.18em]">T-CAFE <span className="font-serif italic text-[#76e6d8]">MIST</span></h1>
          </div>
          <a href="/dashboard" className="rounded-xl bg-[#d8ae39] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#102e28] transition hover:bg-[#e0bb4b]">
            Dashboard
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.6em] text-[#c79a17]">POS billing system</p>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight text-[#16332d] sm:text-6xl lg:text-7xl">
            Popular <span className="font-serif italic text-[#76e6d8]">Menu.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-600">
            Select products, build the cart, and generate a clean invoice-style order summary.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2.25rem] bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)] sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {loading && <div>Loading products...</div>}
              {!loading && products.length === 0 && <div>No products found.</div>}
              {products.map((product) => (
                <article key={product._id} className="overflow-hidden rounded-4xl border border-[#dde5d9] bg-[#fbfaf7] p-4">
                  <div className="flex aspect-[1.05] items-end rounded-3xl bg-[linear-gradient(160deg,#3f4e42,#1c302a_56%,#101f1b)] p-4 text-white">
                    <span className="rounded-full bg-white/92 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#c59b18] shadow-sm">
                      {typeof product.category === "string" ? product.category : product.category?.name}
                    </span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-[#16332d]">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{product.isVeg ? "Veg" : "Non-veg"}</p>
                    </div>
                    <span className="rounded-full bg-[#11352e] px-3 py-1 text-xs font-semibold text-[#d8e19b]">₹{product.price}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className="mt-4 w-full rounded-2xl bg-[#d8ae39] px-4 py-3 text-sm font-semibold text-[#102e28] transition hover:bg-[#e0bb4b]"
                  >
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          </section>

          <aside className="rounded-[2.25rem] bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)] sm:p-8">
            <div className="rounded-[1.75rem] bg-[#11352e] p-5 text-white">
              <p className="text-xs uppercase tracking-[0.4em] text-[#76e6d8]">Current order</p>
              <p className="mt-2 text-3xl font-semibold">{cart.length} items</p>
            </div>

            <div className="mt-5 space-y-3">
              {cart.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#cbd6c7] bg-[#fbfaf7] px-4 py-6 text-sm text-slate-500">
                  Cart is empty. Add products from the menu list.
                </p>
              ) : (
                  cart.map((item) => (
                    <div key={item.product._id} className="flex items-center justify-between rounded-3xl border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-[#16332d]">{item.product.name}</p>
                        <p className="text-slate-500">{item.quantity} x ₹{item.product.price}</p>
                      </div>
                      <p className="font-semibold text-[#11352e]">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))
              )}
            </div>

            <div className="mt-6 space-y-2 rounded-[1.75rem] border border-[#dde5d9] bg-[#fbfaf7] p-4 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#dde5d9] pt-2 text-base font-semibold text-[#16332d]">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (cart.length === 0) return;
                setSubmitting(true);
                const body = {
                  source: "pos",
                  taxRate: 5,
                  discountAmount: 0,
                  items: cart.map((c) => ({
                    productId: c.product._id,
                    productName: c.product.name,
                    quantity: c.quantity,
                    unitPrice: c.product.price,
                  })),
                };

                try {
                  const res = await fetch("/api/pos/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    credentials: "include",
                  });

                  if (!res.ok) {
                    const err = await res.json();
                    alert(err?.message || "Unable to create order");
                  } else {
                    const data = await res.json();
                    // redirect to payment page
                    const id = data.order._id || data.order.id || data.order.orderNumber;
                    window.location.href = `/payment/${data.order._id}`;
                  }
                } catch (e) {
                  alert("Network error");
                } finally {
                  setSubmitting(false);
                }
              }}
              className="mt-5 w-full rounded-2xl bg-[#d8ae39] px-4 py-3 font-semibold text-[#102e28] transition hover:bg-[#e0bb4b]"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create order"}
            </button>
          </aside>
        </div>
      </section>
      </main>
    </RequireAuth>
  );
}