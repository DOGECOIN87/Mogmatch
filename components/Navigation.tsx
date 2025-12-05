import React from 'react';
import { AppView } from '../types';
import { ICONS } from '../constants';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItemClass = (view: AppView) => 
    `flex flex-col items-center justify-center p-2 flex-1 transition-all duration-300 relative ${
      currentView === view ? 'text-emerald-400 scale-110' : 'text-slate-600 hover:text-slate-400'
    }`;

  return (
    <div className="fixed bottom-4 left-4 right-4 h-20 z-50">
        <div className="h-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-around items-center shadow-2xl relative overflow-hidden">
            {/* Active Indicator Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute bottom-0 h-1 bg-emerald-500 w-1/3 transition-all duration-300 ease-out shadow-[0_0_10px_#10b981] ${
                    currentView === AppView.SWIPE ? 'left-0' :
                    currentView === AppView.RATE ? 'left-1/3' : 'left-2/3'
                }`} />
            </div>

            <button className={navItemClass(AppView.SWIPE)} onClick={() => setView(AppView.SWIPE)}>
                {ICONS.SWIPE}
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Stack</span>
            </button>
            <button className={navItemClass(AppView.RATE)} onClick={() => setView(AppView.RATE)}>
                {ICONS.CAMERA}
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Scan</span>
            </button>
            <button className={navItemClass(AppView.CHAT)} onClick={() => setView(AppView.CHAT)}>
                {ICONS.CHAT}
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Comms</span>
            </button>
        </div>
    </div>
  );
};

export default Navigation;