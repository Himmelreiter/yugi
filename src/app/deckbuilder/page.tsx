'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import SavedDecks from "@/components/SavedDecks";
import AttributeIcon from "@/components/AttributeIcons";
import CardTypeIcon from "@/components/CardTypeIcons";

interface Card {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  card_images: {
    image_url: string;
  }[];
}

interface Deck {
  mainDeck: Card[];
  extraDeck: Card[];
  sideDeck: Card[];
}

interface StoredData {
  cards: Card[];
  timestamp: number;
}

// IndexedDB Setup
const DB_NAME = 'yugiohDB';
const STORE_NAME = 'cards';
const DB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

const saveToDB = async (data: StoredData): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, 'cardData');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const getFromDB = async (): Promise<StoredData | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('cardData');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
};

export default function DeckBuilder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deckName, setDeckName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'level' | 'atk' | 'def' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const cardsPerPage = 32;
  const [currentDeck, setCurrentDeck] = useState<Deck>({
    mainDeck: [],
    extraDeck: [],
    sideDeck: []
  });
  const [draggedCard, setDraggedCard] = useState<{card: Card, source: 'mainDeck' | 'extraDeck' | 'sideDeck'} | null>(null);

  // Funktion zum Laden aller Karten
  const loadAllCards = async () => {
    try {
      const response = await axios.get('https://db.ygoprodeck.com/api/v7/cardinfo.php');
      const data: StoredData = {
        cards: response.data.data,
        timestamp: Date.now()
      };
      await saveToDB(data);
      return response.data.data;
    } catch (err) {
      console.error('Error loading cards:', err);
      return [];
    }
  };

  // Funktion zum Filtern der Karten
  const filterCards = (allCards: Card[], search: string) => {
    const searchLower = search.toLowerCase();
    let filteredCards = allCards.filter(card => {
      // Textsuche
      const matchesSearch = !search.trim() || 
        card.name.toLowerCase().includes(searchLower) ||
        card.type.toLowerCase().includes(searchLower) ||
        card.race.toLowerCase().includes(searchLower);

      // Typ-Filter
      const matchesType = selectedTypes.length === 0 || 
        selectedTypes.some(type => card.type.toLowerCase().includes(type.toLowerCase()));

      // Attribut-Filter
      const matchesAttribute = selectedAttributes.length === 0 || 
        (card.attribute && selectedAttributes.includes(card.attribute));

      // Level-Filter
      const matchesLevel = selectedLevels.length === 0 || 
        (card.level && selectedLevels.includes(card.level));

      return matchesSearch && matchesType && matchesAttribute && matchesLevel;
    });

    // Sortiere nach Level, wenn aktiviert
    if (sortBy) {
      filteredCards.sort((a, b) => {
        let valueA = 0;
        let valueB = 0;

        switch (sortBy) {
          case 'level':
            valueA = a.level || 0;
            valueB = b.level || 0;
            break;
          case 'atk':
            valueA = a.atk || 0;
            valueB = b.atk || 0;
            break;
          case 'def':
            valueA = a.def || 0;
            valueB = b.def || 0;
            break;
        }

        return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
      });
    }

    return filteredCards;
  };

  // Berechne die aktuellen Karten für die aktuelle Seite
  const getCurrentCards = () => {
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    return cards.slice(startIndex, endIndex);
  };

  // Berechne die Gesamtanzahl der Seiten
  const totalPages = Math.ceil(cards.length / cardsPerPage);

  useEffect(() => {
    const fetchAndFilterCards = async () => {
      setLoading(true);
      setError('');

      try {
        // Prüfe, ob wir gespeicherte Daten haben
        const storedData = await getFromDB();
        let allCards: Card[] = [];

        if (storedData) {
          const isDataOld = Date.now() - storedData.timestamp > 24 * 60 * 60 * 1000; // 24 Stunden

          if (!isDataOld) {
            allCards = storedData.cards;
          } else {
            allCards = await loadAllCards();
          }
        } else {
          allCards = await loadAllCards();
        }

        // Filtere die Karten basierend auf dem Suchbegriff und den Filtern
        const filteredCards = filterCards(allCards, searchTerm);
        setCards(filteredCards);
      } catch (err) {
        setError('Failed to fetch cards. Please try again.');
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce die Suche
    const timeoutId = setTimeout(() => {
      fetchAndFilterCards();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTypes, selectedAttributes, selectedLevels, sortBy, sortOrder]);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest('.group');
      if (!card) return;

      const hoverInfo = card.querySelector('.hover-info') as HTMLElement;
      if (!hoverInfo) return;

      const cardRect = card.getBoundingClientRect();
      const hoverRect = hoverInfo.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Wenn der Hover-Effekt am oberen Rand abgeschnitten würde
      if (cardRect.top - hoverRect.height < 0) {
        hoverInfo.classList.add('top');
      } else {
        hoverInfo.classList.remove('top');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, []);

  const addCardToDeck = (card: Card) => {
    setCurrentDeck(prevDeck => {
      const newDeck = { ...prevDeck };
      
      // Zähle, wie oft die Karte bereits im Deck ist
      const countInMainDeck = newDeck.mainDeck.filter(c => c.id === card.id).length;
      const countInExtraDeck = newDeck.extraDeck.filter(c => c.id === card.id).length;
      const countInSideDeck = newDeck.sideDeck.filter(c => c.id === card.id).length;
      const totalCount = countInMainDeck + countInExtraDeck + countInSideDeck;

      // Prüfe, ob die Karte bereits 3 Mal im Deck ist
      if (totalCount >= 3) {
        alert('You can only have up to 3 copies of the same card in your deck!');
        return prevDeck;
      }
      
      if (card.type.includes('Fusion') || card.type.includes('Synchro') || 
          card.type.includes('XYZ') || card.type.includes('Link')) {
        if (newDeck.extraDeck.length < 15) {
          newDeck.extraDeck = [...prevDeck.extraDeck, card];
        } else {
          alert('Extra Deck can only contain up to 15 cards!');
        }
      } else {
        if (newDeck.mainDeck.length < 40) {
          newDeck.mainDeck = [...prevDeck.mainDeck, card];
        } else {
          alert('Main Deck can only contain up to 40 cards!');
        }
      }
      
      return newDeck;
    });
  };

  const removeCardFromDeck = (cardIndex: number, deckType: 'mainDeck' | 'extraDeck' | 'sideDeck') => {
    setCurrentDeck(prevDeck => {
      const newDeck = { ...prevDeck };
      newDeck[deckType] = prevDeck[deckType].filter((_, index) => index !== cardIndex);
      return newDeck;
    });
  };

  const handleDragStart = (card: Card, source: 'mainDeck' | 'extraDeck' | 'sideDeck') => {
    setDraggedCard({ card, source });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetDeck: 'mainDeck' | 'extraDeck' | 'sideDeck') => {
    if (!draggedCard) return;

    setCurrentDeck(prevDeck => {
      const newDeck = { ...prevDeck };
      
      // Entferne die Karte aus dem Quell-Deck
      newDeck[draggedCard.source] = prevDeck[draggedCard.source].filter(
        card => card.id !== draggedCard.card.id
      );

      // Füge die Karte zum Ziel-Deck hinzu, wenn es die Limits erlaubt
      if (targetDeck === 'mainDeck' && newDeck.mainDeck.length < 60) {
        newDeck.mainDeck = [...newDeck.mainDeck, draggedCard.card];
      } else if (targetDeck === 'extraDeck' && newDeck.extraDeck.length < 15) {
        newDeck.extraDeck = [...newDeck.extraDeck, draggedCard.card];
      } else if (targetDeck === 'sideDeck' && newDeck.sideDeck.length < 15) {
        newDeck.sideDeck = [...newDeck.sideDeck, draggedCard.card];
      }

      return newDeck;
    });

    setDraggedCard(null);
  };

  const renderHoverInfo = (card: Card) => (
    <>
      {/* Unsichtbarer Verbindungsbereich */}
      <div className="absolute z-40 hidden group-hover:block w-full h-4 bottom-full"></div>
      <div className="absolute z-50 hidden group-hover:block bg-white p-2 rounded-lg shadow-xl border border-gray-200 w-64 left-1/2 -translate-x-1/2 hover-info">
        <div className="text-sm max-h-48 overflow-y-auto pr-1">
          <h4 className="font-bold text-gray-800 mb-1">{card.name}</h4>
          <p className="text-gray-600 mb-1">{card.type}</p>
          {card.attribute && (
            <p className="text-gray-600 mb-1">Attribute: {card.attribute}</p>
          )}
          {card.level && (
            <p className="text-gray-600 mb-1">Level: {card.level}</p>
          )}
          {card.race && (
            <p className="text-gray-600 mb-1">Type: {card.race}</p>
          )}
          {card.atk !== undefined && (
            <p className="text-gray-600 mb-1">ATK: {card.atk} / DEF: {card.def}</p>
          )}
          <p className="text-gray-600 text-xs mt-1">{card.desc}</p>
        </div>
        {/* Pfeil nach unten/oben */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
      </div>
    </>
  );

  const renderDeckSection = (deckType: 'mainDeck' | 'extraDeck' | 'sideDeck', title: string, maxCards: number) => (
    <div 
      className="mb-4"
      onDragOver={handleDragOver}
      onDrop={() => handleDrop(deckType)}
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-800">
        {title} <span className="text-blue-600">({currentDeck[deckType].length}/{maxCards})</span>
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
        {/* Karten im Deck */}
        {currentDeck[deckType].map((card, index) => (
          <div 
            key={`${card.id}-${index}`} 
            className="relative group"
            draggable
            onDragStart={() => handleDragStart(card, deckType)}
          >
            <img
              src={card.card_images[0].image_url}
              alt={card.name}
              className="w-full h-auto rounded-sm"
            />
            <button
              onClick={() => removeCardFromDeck(index, deckType)}
              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 text-xs"
            >
              ×
            </button>
            {renderHoverInfo(card)}
          </div>
        ))}
        {/* Leere Slots */}
        {Array.from({ length: maxCards - currentDeck[deckType].length }).map((_, index) => (
          <div 
            key={`empty-${index}`}
            className="aspect-[59/86] border-2 border-dashed border-gray-300 rounded-sm bg-gray-50 flex items-center justify-center"
          >
            <div className="text-gray-400 text-xs">Empty</div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleDecksLoaded = (decks: any[]) => {
    if (decks.length > 0 && !deckName) {
      // Lade das erste Deck, wenn noch kein Deck geladen ist
      loadDeck(decks[0]);
    }
  };

  const saveDeck = async () => {
    if (!deckName.trim()) {
      alert('Bitte geben Sie einen Namen für das Deck ein.');
      return;
    }

    if (currentDeck.mainDeck.length === 0) {
      alert('Das Deck muss mindestens eine Karte enthalten.');
      return;
    }

    setSaveStatus('saving');
    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: deckName,
          mainDeck: currentDeck.mainDeck,
          extraDeck: currentDeck.extraDeck,
          sideDeck: currentDeck.sideDeck,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save deck');
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
      
      // Aktualisiere die Deck-Liste
      const decksResponse = await fetch('/api/decks');
      if (decksResponse.ok) {
        const decks = await decksResponse.json();
        handleDecksLoaded(decks);
      }
    } catch (error) {
      console.error('Error saving deck:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const loadDeck = (deck: any) => {
    setCurrentDeck({
      mainDeck: deck.mainDeck,
      extraDeck: deck.extraDeck,
      sideDeck: deck.sideDeck,
    });
    setDeckName(deck.name);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[1800px] mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Main Menu
          </Link>
          <h1 className="text-4xl font-bold text-center text-gray-800">Deck Builder</h1>
          <div className="w-[120px]"></div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Linke Seite: Deck-Bearbeitungsmenü */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Deck Tools</h2>
              <div className="space-y-3">
                <div className="mb-4">
                  <input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    placeholder="Deck Name"
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                  />
                </div>
                <button 
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  onClick={saveDeck}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Speichern...
                    </>
                  ) : saveStatus === 'success' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Gespeichert!
                    </>
                  ) : saveStatus === 'error' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Fehler!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V12a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Deck speichern
                    </>
                  )}
                </button>
                <button 
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your deck?')) {
                      setCurrentDeck({ mainDeck: [], extraDeck: [], sideDeck: [] });
                      setDeckName('');
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Clear Deck
                </button>
              </div>
            </div>

            {/* Gespeicherte Decks */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Gespeicherte Decks</h2>
              <SavedDecks onLoadDeck={loadDeck} onRefresh={handleDecksLoaded} />
            </div>
          </div>

          {/* Mittlere Seite: Deck-Bereich */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Current Deck</h2>
            
            {renderDeckSection('mainDeck', 'Main Deck', 40)}
            {renderDeckSection('extraDeck', 'Extra Deck', 15)}
            {renderDeckSection('sideDeck', 'Side Deck', 15)}
          </div>

          {/* Rechte Seite: Suchbereich */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="sticky top-4">
              <div className="mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search for cards..."
                  className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Filter-Bereich */}
              <div className="mb-4 space-y-4">
                {/* Level Filter */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((level) => (
                      <button
                        key={level}
                        onClick={() => {
                          setSelectedLevels(prev => 
                            prev.includes(level) 
                              ? prev.filter(l => l !== level)
                              : [...prev, level]
                          );
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                          selectedLevels.includes(level)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <AttributeIcon 
                          attribute="LEVEL" 
                          className={`w-4 h-4 ${
                            selectedLevels.includes(level)
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        />
                        <span>{level}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sortierung */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Sortierung</h3>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-full overflow-hidden border border-gray-200">
                      <button
                        onClick={() => {
                          setSortBy(sortBy === 'level' ? null : 'level');
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${
                          sortBy === 'level'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <AttributeIcon 
                          attribute="LEVEL" 
                          className={`w-4 h-4 ${
                            sortBy === 'level'
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        />
                        <span className="text-sm">Level</span>
                      </button>
                      <button
                        onClick={() => {
                          setSortBy(sortBy === 'atk' ? null : 'atk');
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 transition-colors border-l border-r border-gray-300 ${
                          sortBy === 'atk'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <span className="font-bold text-sm">ATK</span>
                      </button>
                      <button
                        onClick={() => {
                          setSortBy(sortBy === 'def' ? null : 'def');
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${
                          sortBy === 'def'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <span className="font-bold text-sm">DEF</span>
                      </button>
                    </div>
                    {sortBy && (
                      <button
                        onClick={() => {
                          setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                          setCurrentPage(1);
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        title={sortOrder === 'desc' ? 'Höchste Werte zuerst' : 'Niedrigste Werte zuerst'}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Karten-Typ Filter */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Card Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { type: 'Ritual', label: 'Ritual' },
                      { type: 'Quick-Play', label: 'Quick-Play' },
                      { type: 'Continuous', label: 'Continuous' },
                      { type: 'Equip', label: 'Equip' },
                      { type: 'Field', label: 'Field' },
                      { type: 'Counter', label: 'Counter' }
                    ].map(({ type, label }) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedTypes(prev => 
                            prev.includes(type) 
                              ? prev.filter(t => t !== type)
                              : [...prev, type]
                          );
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                          selectedTypes.includes(type)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <CardTypeIcon 
                          type={type} 
                          className={`w-5 h-5 ${
                            selectedTypes.includes(type)
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attribut Filter */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">Attributes</h3>
                  <div className="flex flex-wrap gap-2">
                    {['DARK', 'LIGHT', 'WATER', 'FIRE', 'EARTH', 'WIND', 'DIVINE'].map((attribute) => (
                      <button
                        key={attribute}
                        onClick={() => {
                          setSelectedAttributes(prev => 
                            prev.includes(attribute) 
                              ? prev.filter(a => a !== attribute)
                              : [...prev, attribute]
                          );
                          setCurrentPage(1);
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          selectedAttributes.includes(attribute)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title={attribute}
                      >
                        <AttributeIcon 
                          attribute={attribute} 
                          className={`w-6 h-6 ${
                            selectedAttributes.includes(attribute)
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading && <p className="text-center text-gray-600">Loading...</p>}
              {error && <p className="text-red-600 text-center font-medium">{error}</p>}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1 auto-rows-fr">
                {getCurrentCards().map((card) => (
                  <div 
                    key={card.id} 
                    className="relative group border rounded-lg p-1 hover:shadow-lg transition-shadow cursor-pointer bg-white hover:border-blue-500 flex flex-col"
                    onClick={() => addCardToDeck(card)}
                  >
                    {card.card_images[0] && (
                      <img
                        src={card.card_images[0].image_url}
                        alt={card.name}
                        className="w-full h-auto object-contain"
                      />
                    )}
                    <div className="mt-1">
                      <h3 className="font-semibold text-[10px] text-gray-800 line-clamp-2">{card.name}</h3>
                      {card.atk !== undefined && (
                        <p className="text-[10px] text-gray-700">
                          ATK: {card.atk} / DEF: {card.def}
                        </p>
                      )}
                    </div>
                    {renderHoverInfo(card)}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {cards.length > 0 && (
                <div className="flex justify-center items-center mt-4 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .group {
          position: relative;
        }
        .group:hover > div[class*="absolute"] {
          display: block !important;
        }
        .hover-info {
          bottom: 100%;
          margin-bottom: 0.5rem;
        }
        .hover-info.top {
          bottom: auto;
          top: 100%;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        .hover-info.top .rotate-45 {
          top: 0;
          bottom: auto;
          transform: translate(-50%, -50%) rotate(45deg);
        }
      `}</style>
    </div>
  );
}