"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerAction, type RegisterState } from "./actions";

export default function RegisterForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState<RegisterState | null, FormData>(
    registerAction,
    null
  );

  useEffect(() => {
    if (state?.ok) {
      router.push("/login");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-sm text-white/80">Nama (opsional)</label>
        <input
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300/50"
          name="name"
          placeholder="Nama Anda"
          autoComplete="name"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-white/80">Email</label>
        <input
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300/50"
          type="email"
          name="email"
          placeholder="nama@company.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-white/80">Password</label>
        <input
          className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300/50"
          type="password"
          name="password"
          placeholder="Minimal 6 karakter"
          autoComplete="new-password"
          required
        />
      </div>

      {state && !state.ok ? (
        <div className="text-sm text-red-200 bg-red-500/10 border border-red-400/20 rounded-xl p-3">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-white text-black font-semibold py-2.5 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Membuat akun..." : "Daftar"}
      </button>

      <div className="text-xs text-white/50">
        Dengan mendaftar, Anda menyetujui penggunaan aplikasi ini untuk demo/internal.
      </div>
    </form>
  );
}

