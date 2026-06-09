"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl text-gold">Jesteś offline</h1>
      <p className="mt-4 max-w-sm text-cream/60">
        Brak połączenia z internetem. Aplikacja działa lokalnie — wróć na
        stronę główną, aby kontynuować.
      </p>
      <Link href="/" className="mt-8">
        <Button>Strona główna</Button>
      </Link>
    </div>
  );
}
