"use client";

import { useState, useEffect } from "react";

interface SavedDeck {
  _id: string;
  name: string;
  mainDeck: any[];
  extraDeck: any[];
  sideDeck: any[];
  createdAt: string;
  updatedAt: string;
}

export default function SavedDecks({ 
  onLoadDeck,
  onRefresh
}: { 
  onLoadDeck: (deck: SavedDeck) => void;
  onRefresh?: (decks: SavedDeck[]) => void;
}) {
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDecks = async () => {
    try {
      const response = await fetch("/api/decks");
      if (!response.ok) {
        throw new Error("Failed to fetch decks");
      }
      const data = await response.json();
      setDecks(data);
      onRefresh?.(data);
    } catch (err) {
      setError("Fehler beim Laden der Decks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecks();
  }, []);

  const deleteDeck = async (deckId: string) => {
    if (!confirm("Möchten Sie dieses Deck wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete deck");
      }

      // Aktualisiere die Liste nach dem Löschen
      setDecks(decks.filter(deck => deck._id !== deckId));
    } catch (err) {
      console.error("Error deleting deck:", err);
      alert("Fehler beim Löschen des Decks");
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Lade Decks...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  if (decks.length === 0) {
    return (
      <div className="text-center text-gray-600">
        Keine gespeicherten Decks gefunden
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {decks.map((deck) => (
        <div
          key={deck._id}
          className="bg-white p-3 rounded-lg shadow border border-gray-200 hover:border-blue-500 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">{deck.name}</h3>
              <p className="text-sm text-gray-600">
                {new Date(deck.updatedAt).toLocaleDateString("de-DE")}
              </p>
              <p className="text-xs text-gray-500">
                Main: {deck.mainDeck.length} | Extra: {deck.extraDeck.length} | Side: {deck.sideDeck.length}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onLoadDeck(deck)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                Laden
              </button>
              <button
                onClick={() => deleteDeck(deck._id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 