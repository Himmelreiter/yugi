"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Yu-Gi-Oh! App</h1>
        <div className="space-y-4">
          {session ? (
            <>
              <p className="text-lg mb-4">Willkommen, {session.user?.name}!</p>
              <Link
                href="/duel"
                className="block w-64 mx-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Duel
              </Link>
              <Link
                href="/deckbuilder"
                className="block w-64 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Deck Builder
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="block w-64 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Anmelden
              </Link>
              <Link
                href="/auth/signup"
                className="block w-64 mx-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Registrieren
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
