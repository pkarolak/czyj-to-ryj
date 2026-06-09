"use client";

import Link from "next/link";

export function FirebaseNotice() {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
      <h2 className="font-display text-2xl text-amber-400">
        Firebase nie skonfigurowany
      </h2>
      <p className="mt-3 text-sm text-cream/60">
        Skopiuj <code className="text-cream/80">.env.local.example</code> do{" "}
        <code className="text-cream/80">.env.local</code> i uzupełnij klucze z
        Firebase Console (Realtime Database).
      </p>
      <p className="mt-2 text-xs text-cream/40">
        W Firebase Console → Realtime Database → Rules wklej reguły z{" "}
        <code className="text-cream/60">firebase.database.rules.json</code> i
        kliknij Publish
      </p>
      <Link
        href="/"
        className="mt-4 inline-block text-sm text-gold underline hover:text-gold-light"
      >
        Wróć na stronę główną
      </Link>
    </div>
  );
}
