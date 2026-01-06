
import React, { useState, useCallback } from 'react';
import { WorldCondition, RandomEvent } from './types';
import { generateInitialConditions, advanceTurn } from './services/worldEngine';
import Header from './components/Header';
import EntropyCard from './components/EntropyCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import TurnResult from './components/TurnResult';
import { SparklesIcon, HourglassIcon } from './components/Icons';

const loadingMessages = [
  "Consulting the cosmos...",
  "Shuffling the deck of fate...",
  "Observing celestial alignments...",
  "Whispering with ancient spirits...",
  "Scrying the threads of destiny...",
  "Rolling the bones of chance...",
];

const timeLapseOptions = [
    { label: 'Short Rest', duration: '1 Hour' },
    { label: 'Long Rest', duration: '8 Hours' },
    { label: 'Travel Day', duration: '1 Day' },
    { label: 'Downtime', duration: '1 Week' },
];

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdvancingTurn, setIsAdvancingTurn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [turn, setTurn] = useState(0);
  const [worldConditions, setWorldConditions] = useState<WorldCondition[]>([]);
  const [eventsLog, setEventsLog] = useState<RandomEvent[]>([]);
  const [lastUpdateMessage, setLastUpdateMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  const handleStartNewWorld = useCallback(async () => {
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    setIsLoading(true);
    setError(null);
    setGameStarted(false);
    setLastUpdateMessage(null);
    try {
      // Simulate a short delay for a better user experience
      await new Promise(res => setTimeout(res, 500));
      const initialConditions = generateInitialConditions();
      setWorldConditions(initialConditions.map(c => ({ ...c, lastUpdatedTurn: 1 })));
      setEventsLog([]);
      setTurn(1);
      setGameStarted(true);
      setLastUpdateMessage("A new world has been born! The initial conditions are set.");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while creating the world.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAdvanceTurn = useCallback(async (duration: string) => {
    setIsAdvancingTurn(true);
    setError(null);
    setLastUpdateMessage(null);

    try {
      // Simulate a short delay for processing
      await new Promise(res => setTimeout(res, 300));
      const currentTurn = turn + 1;
      const update = advanceTurn(worldConditions, duration);
      
      if (update.mutation) {
        const { key, newValue, reason } = update.mutation;
        setWorldConditions(prev => prev.map(cond => 
            cond.key === key 
                ? { ...cond, currentValue: newValue, lastUpdatedTurn: currentTurn } 
                : cond
        ));
        setLastUpdateMessage(`[Mutation] After ${duration}, ${key} is now ${newValue}. Reason: ${reason}`);
      } else if (update.newEvent) {
        const newEvent: RandomEvent = {
            ...update.newEvent,
            type: 'Random Event',
            turnTriggered: currentTurn,
        };
        setEventsLog(prev => [newEvent, ...prev]);
        setLastUpdateMessage(`[Event] After ${duration}, ${newEvent.name} has occurred!`);
      } else {
        setLastUpdateMessage(`After ${duration}, the world remains stable... for now.`);
      }
      setTurn(currentTurn);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during turn advancement.');
    } finally {
      setIsAdvancingTurn(false);
    }

  }, [worldConditions, turn]);

  const anyLoading = isLoading || isAdvancingTurn;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center opacity-10" 
        style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')"}}>
      </div>
      <div className="relative container mx-auto max-w-7xl">
        <Header />

        <main className="mt-8">
          <div className="text-center">
            {!gameStarted && (
              <button
                onClick={handleStartNewWorld}
                disabled={anyLoading}
                className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-bold text-lg py-3 px-8 rounded-full shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                {isLoading ? <LoadingSpinner /> : <SparklesIcon />}
                {isLoading ? 'Creating World...' : 'Start New World'}
              </button>
            )}
          </div>
          
           {isLoading && !gameStarted && (
            <div className="flex flex-col items-center justify-center text-center text-gray-400 my-16">
              <LoadingSpinner />
              <p className="mt-4 text-lg">{loadingMessage}</p>
            </div>
          )}
          {error && <ErrorMessage message={error} />}
          
          {lastUpdateMessage && <TurnResult message={lastUpdateMessage} />}

          {!gameStarted && !isLoading && !error && (
            <div className="text-center text-gray-500 mt-16">
                <h2 className="text-2xl font-bold">Welcome, Dungeon Master</h2>
                <p className="mt-2 max-w-xl mx-auto">Click the button above to generate a unique set of initial world conditions for your next adventure.</p>
            </div>
          )}

          {gameStarted && (
            <>
              <div className="sticky top-4 z-10 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-xl p-4 mb-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="font-orbitron text-2xl text-gray-300">
                      Turn: <span className="font-bold text-purple-400">{turn}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HourglassIcon />
                    <h3 className="text-lg font-bold text-gray-200">Advance Time & Risk Entropy</h3>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                      {timeLapseOptions.map(({ label, duration }) => (
                          <button
                            key={duration}
                            onClick={() => handleAdvanceTurn(duration)}
                            disabled={anyLoading}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md shadow-md shadow-green-500/10 transition-all duration-200 transform hover:scale-105 disabled:scale-100 text-sm"
                          >
                            {isAdvancingTurn ? <LoadingSpinner /> : label}
                          </button>
                      ))}
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-orbitron font-bold text-center mb-6 text-cyan-300">World Conditions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {worldConditions.map((item) => (
                  <EntropyCard key={item.key} item={item} currentTurn={turn} />
                ))}
              </div>

              {eventsLog.length > 0 && (
                 <>
                  <h2 className="text-3xl font-orbitron font-bold text-center mb-6 text-amber-300">Events Log</h2>
                   <div className="space-y-6">
                    {eventsLog.map((item, index) => (
                      <EntropyCard key={`${item.name}-${item.turnTriggered}-${index}`} item={item} currentTurn={turn} />
                    ))}
                  </div>
                 </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
