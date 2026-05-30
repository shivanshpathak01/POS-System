"use client";

import { useMemo, useState, useEffect } from "react";
import useSession from "@/lib/hooks/useSession";
import AuthenticatedHeader from "@/components/AuthenticatedHeader";

type Product = {
  _id: string;
  name: string;
  price: number;
  category?: { name?: string } | string;
  isVeg?: boolean;
  stock?: number;
};

type CartItem = { product: Product; quantity: number };

function getCartStorageKey(userId?: string) {
  return userId ? `mitra_cart:${userId}` : "mitra_cart:guest";
}

function readStoredCart(storageKey: string) {
  if (typeof window === "undefined") {
    return [] as CartItem[];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [] as CartItem[];

    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as CartItem[];
  }
}

import RequireAuth from "@/components/RequireAuth";

export default function PosPage() {
  const { user } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const storageKey = getCartStorageKey(user?.id);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    setCart(readStoredCart(storageKey));
  }, [storageKey, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      // ignore storage failures
    }
  }, [cart, storageKey, user?.id]);

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

  function increaseQuantity(productId: string) {
    setCart((current) =>
      current.map((item) => (item.product._id === productId ? { ...item, quantity: item.quantity + 1 } : item))
    );
  }

  function decreaseQuantity(productId: string) {
    setCart((current) =>
      current
        .map((item) => (item.product._id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setCart([]);

    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore storage failures
    }
  }

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[#f5f0e6] text-[#16332d]">
        <AuthenticatedHeader currentPage="pos" title="MITRA Enterprise" />

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
                  <div key={item.product._id} className="flex items-center justify-between gap-4 rounded-3xl border border-[#dde5d9] bg-[#fbfaf7] px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-[#16332d]">{item.product.name}</p>
                      <p className="text-slate-500">₹{item.product.price} each</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-2xl border border-[#d8e0d6] bg-white">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.product._id)}
                          className="grid h-9 w-9 place-items-center rounded-l-2xl text-lg font-semibold text-[#11352e] transition hover:bg-[#f3f6f0]"
                          aria-label={`Decrease ${item.product.name}`}
                        >
                          -
                        </button>
                        <span className="min-w-10 px-3 text-center font-semibold text-[#16332d]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.product._id)}
                          className="grid h-9 w-9 place-items-center rounded-r-2xl text-lg font-semibold text-[#11352e] transition hover:bg-[#f3f6f0]"
                          aria-label={`Increase ${item.product.name}`}
                        >
                          +
                        </button>
                      </div>

                      <p className="min-w-24 text-right font-semibold text-[#11352e]">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
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
                    window.location.href = `/payment/${data.order._id}`;
                    clearCart();
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

            <button
              type="button"
              onClick={clearCart}
              className="mt-3 w-full rounded-2xl border border-[#d8ae39] bg-transparent px-4 py-3 font-semibold text-[#11352e] transition hover:bg-[#fbfaf7]"
              disabled={submitting || cart.length === 0}
            >
              Clear cart
            </button>
          </aside>
        </div>
      </section>
      </main>
    </RequireAuth>
  );
}