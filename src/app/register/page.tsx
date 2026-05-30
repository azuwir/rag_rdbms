import Link from "next/link";
import RegisterForm from "./register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center p-6 bg-[radial-gradient(60%_60%_at_30%_20%,rgba(236,72,153,0.30),transparent_60%),radial-gradient(60%_60%_at_70%_80%,rgba(59,130,246,0.30),transparent_60%)]">
      <div className="w-full max-w-md glass shadow-glass rounded-2xl p-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight">Buat Akun</h1>
          <p className="text-sm text-white/70 mt-1">
            Daftar untuk mengakses dashboard.
          </p>
        </div>

        <RegisterForm />

        <div className="mt-5 text-sm text-white/70">
          Sudah punya akun?{" "}
          <Link className="text-white underline underline-offset-4" href="/login">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}

