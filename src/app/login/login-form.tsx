"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("Email atau password salah.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-sm text-white/80">Email</label>
        <input
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400/60"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@company.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-white/80">Password</label>
        <input
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-300/50"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 6 karakter"
          autoComplete="current-password"
          required
        />
      </div>

      {error ? (
        <div className="text-sm text-red-200 bg-red-500/10 border border-red-400/20 rounded-xl p-3">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-white text-black font-semibold py-2.5 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}

