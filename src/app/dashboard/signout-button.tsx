"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/15"
    >
      Keluar
    </button>
  );
}

