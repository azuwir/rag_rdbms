import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignOutButton from "./signout-button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen p-6 bg-[radial-gradient(60%_60%_at_20%_20%,rgba(99,102,241,0.28),transparent_60%),radial-gradient(60%_60%_at_80%_70%,rgba(16,185,129,0.22),transparent_60%)]">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="glass shadow-glass rounded-2xl p-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-white/70 mt-1">
              Login sebagai <b>{session.user.email}</b>
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass shadow-glass rounded-2xl p-6">
            <div className="text-sm text-white/70">Akses</div>
            <div className="mt-1 font-semibold">RAG (Data Terstruktur)</div>
            <p className="text-sm text-white/70 mt-2">
              Gunakan halaman utama untuk bertanya Production/Revenue/LOP.
            </p>
            <Link
              className="inline-block mt-4 rounded-xl bg-white text-black font-semibold px-4 py-2 hover:bg-white/90"
              href="/"
            >
              Buka RAG
            </Link>
          </div>

          <div className="glass shadow-glass rounded-2xl p-6">
            <div className="text-sm text-white/70">Tips Keamanan</div>
            <p className="text-sm text-white/70 mt-2">
              Untuk produksi, sebaiknya tambah allowlist SQL yang lebih ketat atau ubah
              pipeline menjadi parameter terstruktur (bukan raw SQL).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

