import Link from "next/link";
import { auth } from "@/auth";
import RagChat from "./rag-chat";

export default async function Home() {
  const session = await auth();
  return (
    <div className="min-h-screen p-6 bg-[radial-gradient(60%_60%_at_20%_20%,rgba(99,102,241,0.28),transparent_60%),radial-gradient(60%_60%_at_80%_70%,rgba(16,185,129,0.18),transparent_60%),radial-gradient(40%_40%_at_60%_10%,rgba(236,72,153,0.20),transparent_60%)]">
      <main className="max-w-4xl mx-auto space-y-4">
        <header className="glass shadow-glass rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              RAG untuk Data Terstruktur
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Tanyakan apa pun tentang <b>Production</b>, <b>Revenue</b>, dan{" "}
              <b>LOP</b>. Sistem akan membuat SQL, query ke PostgreSQL, lalu merangkum jawabannya.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {session?.user?.email ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl bg-white text-black px-3 py-2 text-sm font-semibold hover:bg-white/90"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/15"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </header>

        <section className="glass shadow-glass rounded-2xl p-5">
          <RagChat />
        </section>
      </main>
    </div>
  );
}
