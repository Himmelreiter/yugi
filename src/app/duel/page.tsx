'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Duel() {
  const [opponentLP, setOpponentLP] = useState(8000);
  const [playerLP, setPlayerLP] = useState(8000);
  const [opponentLPChange, setOpponentLPChange] = useState('');
  const [playerLPChange, setPlayerLPChange] = useState('');

  const handleLPChange = (isOpponent: boolean, isAddition: boolean) => {
    const changeValue = isOpponent ? opponentLPChange : playerLPChange;
    const currentLP = isOpponent ? opponentLP : playerLP;
    const setLP = isOpponent ? setOpponentLP : setPlayerLP;
    const setLPChange = isOpponent ? setOpponentLPChange : setPlayerLPChange;

    const change = parseInt(changeValue) || 0;
    const newLP = isAddition ? currentLP + change : currentLP - change;
    
    // Ensure LP doesn't go below 0
    setLP(Math.max(0, newLP));
    setLPChange('');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header mit Zurück-Button */}
      <div className="flex justify-between items-center p-2">
        <Link 
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Main Menu
        </Link>
        <h1 className="text-3xl font-bold text-center text-gray-800">Duel</h1>
        <div className="w-[120px]"></div>
      </div>

      {/* Hauptcontainer für das Spielfeld */}
      <div className="flex-1 flex flex-col justify-center items-center p-2">
        {/* Spielfeld */}
        <div className="bg-[#1a472a] rounded-lg p-2 shadow-xl w-full max-w-[1000px]">
          {/* Gegnerische Spielfeldhälfte */}
          <div className="relative mb-2">
            {/* Extra Zone (halb eingeblendet) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-24 h-4 bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-t-lg" />
            
            {/* Container für die Zonen */}
            <div className="w-[420px] mx-auto flex">
              {/* Linke Seite - Extra Deck */}
              <div className="w-[60px] h-[90px] bg-green-500 border border-dashed border-green-400 rounded-sm mr-1" />
              
              {/* Hauptfeld */}
              <div className="w-[300px]">
                {/* Obere Reihe - Monster Zonen */}
                <div className="flex mb-1">
                  <div className="bg-red-500 border border-dashed border-red-400 rounded-sm w-[60px] h-[90px]" />
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`opponent-monster-${i}`}
                      className="bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-sm w-[60px] h-[90px]"
                    />
                  ))}
                  <div className="bg-blue-500 border border-dashed border-blue-400 rounded-sm w-[60px] h-[90px]" />
                </div>

                {/* Mittlere Reihe - Zauber/Fallen Zonen */}
                <div className="flex mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={`opponent-spell-${i}`}
                      className="bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-sm w-[60px] h-[90px]"
                    />
                  ))}
                </div>

                {/* Untere Reihe - Pendulum Zonen */}
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={`opponent-pendulum-${i}`}
                      className="bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-sm w-[60px] h-[90px]"
                    />
                  ))}
                </div>
              </div>

              {/* Rechte Seite - Deck und Friedhof */}
              <div className="ml-1">
                <div className="w-[60px] h-[90px] bg-gray-500 border border-dashed border-gray-400 rounded-sm mb-1" />
                <div className="w-[60px] h-[90px] bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-sm" />
              </div>
            </div>
          </div>

          {/* Phase area */}
          <div className="flex justify-center items-center gap-1 h-12 mb-2">
            {['DP', 'SP', 'M1', 'BP', 'M2', 'EP'].map((phase) => (
              <div key={phase} className="flex flex-col items-center">
                <div className="w-6 h-6 bg-[#2a623d] rounded-full flex items-center justify-center text-[#e8f5e9] text-xs font-bold">
                  {phase}
                </div>
                <span className="text-[8px] text-[#e8f5e9] mt-0.5">
                  {phase === 'DP' ? 'Draw Phase' :
                   phase === 'SP' ? 'Standby Phase' :
                   phase === 'M1' ? 'Main Phase 1' :
                   phase === 'BP' ? 'Battle Phase' :
                   phase === 'M2' ? 'Main Phase 2' : 'End Phase'}
                </span>
              </div>
            ))}
          </div>

          {/* Spieler Spielfeldhälfte */}
          <div className="relative">
            {/* Extra Zone (halb eingeblendet) */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-24 h-4 bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-b-lg" />
            
            {/* Container für die Zonen */}
            <div className="w-[420px] mx-auto flex">
              {/* Linke Seite - Extra Deck */}
              <div className="w-[60px] h-[90px] bg-green-500 border border-dashed border-green-400 rounded-sm mr-1" />
              
              {/* Hauptfeld */}
              <div className="w-[300px]">
                {/* Obere Reihe - Pendulum Zonen */}
                <div className="flex mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={`player-pendulum-${i}`}
                      className="bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-sm w-[60px] h-[90px]"
                    />
                  ))}
                </div>

                {/* Mittlere Reihe - Zauber/Fallen Zonen */}
                <div className="flex mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={`player-spell-${i}`}
                      className="bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-sm w-[60px] h-[90px]"
                    />
                  ))}
                </div>

                {/* Untere Reihe - Monster Zonen */}
                <div className="flex">
                  <div className="bg-blue-500 border border-dashed border-blue-400 rounded-sm w-[60px] h-[90px]" />
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`player-monster-${i}`}
                      className="bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-sm w-[60px] h-[90px]"
                    />
                  ))}
                  <div className="bg-red-500 border border-dashed border-red-400 rounded-sm w-[60px] h-[90px]" />
                </div>
              </div>

              {/* Rechte Seite - Deck und Friedhof */}
              <div className="ml-1">
                <div className="w-[60px] h-[90px] bg-gray-500 border border-dashed border-gray-400 rounded-sm mb-1" />
                <div className="w-[60px] h-[90px] bg-[#2a623d] border border-dashed border-[#3a7d4f] rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Spieler-Informationen */}
        <div className="grid grid-cols-2 gap-4 mt-2 w-full max-w-[1000px]">
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-1 text-gray-900">Opponent</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-medium">LP:</p>
                <span className="text-gray-900 font-bold">{opponentLP}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    onClick={() => handleLPChange(true, false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    placeholder="LP Change"
                    value={opponentLPChange}
                    onChange={(e) => setOpponentLPChange(e.target.value)}
                    className="w-24 text-center border-x border-gray-300 py-1 focus:outline-none text-gray-900"
                  />
                  <button 
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    onClick={() => handleLPChange(true, true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-1 text-gray-900">Player</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-medium">LP:</p>
                <span className="text-gray-900 font-bold">{playerLP}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    onClick={() => handleLPChange(false, false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    placeholder="LP Change"
                    value={playerLPChange}
                    onChange={(e) => setPlayerLPChange(e.target.value)}
                    className="w-24 text-center border-x border-gray-300 py-1 focus:outline-none text-gray-900"
                  />
                  <button 
                    className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    onClick={() => handleLPChange(false, true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 