import React, { useState } from 'react';
import Navigation from './components/Navigation';
import SwipeDeck from './components/SwipeDeck';
import RateMyMog from './components/RateMyMog';
import ChatList from './components/ChatList';
import { AppView, ChatMatch, Profile } from './types';

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.SWIPE);
  const [matches, setMatches] = useState<ChatMatch[]>([]);

  const handleMatch = (profile: Profile) => {
    // Avoid duplicates
    if (matches.some(m => m.id === profile.id)) return;

    const newMatch: ChatMatch = {
      id: profile.id,
      profile: profile,
      messages: [],
      lastMessage: "MOG BATTLE INITIATED",
      timestamp: Date.now()
    };
    setMatches(prev => [newMatch, ...prev]);
  };

  const updateMatchMessages = (matchId: string, messages: any[], lastMsg: string) => {
      setMatches(prev => prev.map(m => {
          if (m.id === matchId) {
              return { ...m, messages, lastMessage: lastMsg, timestamp: Date.now() };
          }
          return m;
      }));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.SWIPE:
        return <SwipeDeck onMatch={handleMatch} />;
      case AppView.RATE:
        return <RateMyMog />;
      case AppView.CHAT:
        return <ChatList matches={matches} onUpdateMatch={updateMatchMessages} />;
      default:
        return <SwipeDeck onMatch={handleMatch} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans relative">
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b border-white/10 bg-black/80 backdrop-blur-md z-50 sticky top-0 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
         <div className="flex flex-col items-center leading-none">
            <h1 className="text-2xl font-black tracking-[0.2em] italic text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
              MOG<span className="text-emerald-500">MATCH</span>
            </h1>
            <span className="text-[0.6rem] text-slate-500 uppercase tracking-[0.5em]">Facial Aesthetics Division</span>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative w-full max-w-md mx-auto overflow-hidden">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentView={currentView} setView={setView} />
    </div>
  );
};

export default App;