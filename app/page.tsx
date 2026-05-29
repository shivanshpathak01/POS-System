"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

const menuCards = [
  { title: "Cutting Chai", tag: "Tea", tone: "from-amber-950 via-amber-800 to-stone-900" },
  { title: "Masala Chai", tag: "Tea", tone: "from-stone-900 via-amber-900 to-yellow-950" },
  { title: "Cold Coffee", tag: "Coffee", tone: "from-slate-900 via-zinc-800 to-stone-700" },
  { title: "Sandwich", tag: "Snacks", tone: "from-amber-900 via-orange-800 to-emerald-950" },
];

const loungeFeatures = [
  { title: "Digital Workstations", note: "Gigabit WiFi and charging ports" },
  { title: "Private Meeting Rooms", note: "Soundproof glass pods" },
  { title: "Premium Seating", note: "Ergonomic lounge layout" },
  { title: "Grooming Services", note: "Quick premium touch-ups" },
];

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const response = await fetch("/api/auth/me", { credentials: "include" });

      if (!active) {
        return;
      }

      if (response.ok) {
        router.replace("/dashboard");
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login" ? { email, password } : { name, email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "Authentication failed");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f0e6] text-[#16332d]">
      <header className="sticky top-0 z-20 border-b border-white/50 bg-[#11352e]/95 text-white shadow-[0_6px_24px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-[#d8e19b] to-[#c5a84d] text-xl font-semibold text-[#16332d] shadow-sm">
              T
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#d8e19b]">MITRA Enterprise</p>
              <p className="text-xl font-semibold tracking-[0.18em]">T-CAFE <span className="font-serif italic text-[#76e6d8]">MIST</span></p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-[0.22em] lg:flex">
            <a href="#menu" className="transition hover:text-[#d8e19b]">Home</a>
            <a href="#about" className="transition hover:text-[#d8e19b]">About</a>
            <a href="#gallery" className="transition hover:text-[#d8e19b]">Gallery</a>
            <a href="#auth" className="transition hover:text-[#d8e19b]">Contact</a>
          </nav>

          <a
            href="#auth"
            className="rounded-xl bg-[#d8ae39] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#102e28] transition hover:bg-[#e0bb4b]"
          >
            Login
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.6em] text-[#c79a17]">Product Fidelity</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-[#16332d] sm:text-6xl lg:text-7xl">
            Popular <span className="font-serif italic text-[#76e6d8]">Menu.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base text-slate-600 sm:text-lg">
            High-demand vegetarian selection engineered for repeat customers.
          </p>
        </div>

        <div id="menu" className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {menuCards.map((card) => (
            <article key={card.title} className="overflow-hidden rounded-4xl bg-white p-3 shadow-[0_20px_60px_rgba(21,41,36,0.14)]">
              <div className={`flex aspect-[1.08] items-end rounded-3xl bg-linear-to-br ${card.tone} p-4`}>
                <span className="rounded-full bg-white/92 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#c59b18] shadow-sm">
                  {card.tag}
                </span>
              </div>
              <h2 className="py-5 text-center text-2xl font-semibold text-[#16332d]">{card.title}</h2>
            </article>
          ))}
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <article className="overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-[0_20px_60px_rgba(21,41,36,0.12)]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex min-h-112 flex-col justify-between rounded-4xl bg-[linear-gradient(160deg,#47584b,#19362f_55%,#101f1b)] p-6 text-white md:row-span-2">
                <span className="w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#76e6d8]">
                  Flagship
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.45em] text-[#d8e19b]">The next level</p>
                  <h2 className="mt-4 max-w-md text-5xl font-semibold tracking-tight text-white">
                    Lounge+ <span className="font-serif italic text-[#76e6d8]">Premium Experience</span>
                  </h2>
                  <p className="mt-4 text-lg text-white/80">Co-working | Meetings | Lifestyle Cafe</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 md:self-start">
                {loungeFeatures.map((feature) => (
                  <div key={feature.title} className="rounded-3xl border border-[#dfe7de] bg-[#fbfaf7] p-5 shadow-sm">
                    <div className="h-12 w-12 rounded-2xl bg-[#11352e]" />
                    <h3 className="mt-4 text-lg font-semibold text-[#16332d]">{feature.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{feature.note}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.75rem] bg-[#11352e] p-6 text-white md:col-span-2">
                <p className="text-xs uppercase tracking-[0.4em] text-[#76e6d8]">Financial potential</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold">₹60L - ₹1.2Cr</p>
                    <p className="mt-2 max-w-2xl text-sm text-white/70">
                      Assessment-ready restaurant shell with modular menu, login, dashboard, and POS flow.
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-white/15 bg-white/10" />
                </div>
              </div>
            </div>
          </article>

          <aside id="auth" className="rounded-[2.25rem] border border-[#dde5d9] bg-white p-6 shadow-[0_20px_60px_rgba(21,41,36,0.12)] sm:p-8">
            <div className="flex gap-2 rounded-full bg-[#f2eee3] p-1 text-sm font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                className={`flex-1 rounded-full px-4 py-2 transition ${mode === "login" ? "bg-[#11352e] text-white" : "text-slate-600"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
                className={`flex-1 rounded-full px-4 py-2 transition ${mode === "register" ? "bg-[#11352e] text-white" : "text-slate-600"}`}
              >
                Register
              </button>
            </div>

            <h2 className="mt-6 text-3xl font-semibold text-[#16332d]">
              {mode === "login" ? "Sign in to continue" : "Create a customer account"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Use the same email/password here and on the dashboard. Registration now signs you in immediately.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <label className="block space-y-2 text-sm font-medium text-[#16332d]">
                  <span>Full name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-2xl border border-[#d8e0d6] bg-[#fbfaf7] px-4 py-3 text-[#16332d] outline-none transition placeholder:text-slate-400 focus:border-[#11352e]"
                    placeholder="Enter full name"
                  />
                </label>
              ) : null}

              <label className="block space-y-2 text-sm font-medium text-[#16332d]">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[#d8e0d6] bg-[#fbfaf7] px-4 py-3 text-[#16332d] outline-none transition placeholder:text-slate-400 focus:border-[#11352e]"
                  placeholder="name@company.com"
                />
              </label>

              <label className="block space-y-2 text-sm font-medium text-[#16332d]">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[#d8e0d6] bg-[#fbfaf7] px-4 py-3 text-[#16332d] outline-none transition placeholder:text-slate-400 focus:border-[#11352e]"
                  placeholder="Enter password"
                />
              </label>

              {message ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#d8ae39] px-4 py-3 font-semibold text-[#102e28] transition hover:bg-[#e0bb4b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Please wait..." : mode === "login" ? "Login" : "Register and continue"}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}