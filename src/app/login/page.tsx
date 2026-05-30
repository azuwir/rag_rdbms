import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center p-6 bg-[radial-gradient(60%_60%_at_30%_20%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(60%_60%_at_70%_80%,rgba(16,185,129,0.25),transparent_60%)]">
      <div className="w-full max-w-md glass shadow-glass rounded-2xl p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight">Masuk</h1>
          <p className="text-sm text-white/70 mt-1">
            Login untuk mengakses dashboard.
          </p>
        </div>

        <Suspense fallback={<div className="text-sm text-white/70">Memuat...</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-5 text-sm text-white/70">
          Belum punya akun?{" "}
          <Link className="text-white underline underline-offset-4" href="/register">
            Daftar
          </Link>
        </div>

        <div className="mt-6 text-xs text-white/50">
          Tip: setelah login, buka{" "}
          <Link className="underline underline-offset-4" href="/dashboard">
            /dashboard
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
