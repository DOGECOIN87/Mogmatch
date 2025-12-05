import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Profile } from '../types';
import { generateLooksMaxxProfile } from '../services/geminiService';
import ProfileCard from './ProfileCard';
import { ICONS } from '../constants';

interface SwipeDeckProps {
  onMatch: (profile: Profile) => void;
}

const SWIPE_THRESHOLD = 100;

const SwipeDeck: React.FC<SwipeDeckProps> = ({ onMatch }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Gesture State
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [exitDuration, setExitDuration] = useState(400);

  // Physics & Refs
  const lastDragRef = useRef({ x: 0, time: 0 });
  const velocityRef = useRef(0);
  const hapticTriggeredRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await generateLooksMaxxProfile();
      setProfiles(prev => [...prev, profile]);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProfile();
      await fetchProfile(); // Buffer
      setLoading(false);
    };
    if (profiles.length === 0) init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Buffer management
  useEffect(() => {
    if (profiles.length - currentIndex < 3 && !loading) {
      fetchProfile();
    }
  }, [currentIndex, profiles.length, loading, fetchProfile]);

  // --- Gesture Handlers ---

  const handleStart = (clientX: number, clientY: number) => {
    if (exitDirection || profiles.length === 0) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    lastDragRef.current = { x: clientX, y: clientY, time: Date.now() };
    velocityRef.current = 0;
    hapticTriggeredRef.current = false;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || exitDirection) return;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    setOffset({ x: dx, y: dy });

    // Calculate Velocity
    const now = Date.now();
    const dt = now - lastDragRef.current.time;
    if (dt > 16) { // Update approx every frame
        velocityRef.current = (clientX - lastDragRef.current.x) / dt;
        lastDragRef.current = { x: clientX, y: clientY, time: now };
    }

    // Haptic Feedback
    const passedThreshold = Math.abs(dx) > SWIPE_THRESHOLD;
    if (passedThreshold && !hapticTriggeredRef.current) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
        hapticTriggeredRef.current = true;
    } else if (!passedThreshold && hapticTriggeredRef.current) {
        hapticTriggeredRef.current = false;
    }
  };

  const handleEnd = () => {
    if (!isDragging || exitDirection) return;
    setIsDragging(false);

    const velocity = velocityRef.current;
    const swipedFast = Math.abs(velocity) > 0.8; // High velocity swipe
    const passedThreshold = Math.abs(offset.x) > SWIPE_THRESHOLD;

    if (passedThreshold || (swipedFast && Math.abs(offset.x) > 30)) {
      const direction = offset.x > 0 ? 'right' : 'left';
      triggerSwipe(direction, Math.abs(velocity));
    } else {
      // Snap back
      setOffset({ x: 0, y: 0 });
    }
  };

  const triggerSwipe = (direction: 'left' | 'right', speed = 0) => {
    setExitDirection(direction);
    
    // Calculate dynamic duration based on speed
    // Base 400ms, faster if high velocity, min 200ms
    const duration = speed > 0 ? Math.max(200, 500 - (speed * 150)) : 400;
    setExitDuration(duration);

    const screenW = window.innerWidth;
    const endX = direction === 'right' ? screenW + 200 : -screenW - 200;
    
    // Project trajectory
    const slope = offset.x !== 0 ? offset.y / offset.x : 0;
    const endY = offset.y + (slope * Math.abs(endX - offset.x));
    
    setOffset({ x: endX, y: endY });

    if (direction === 'right') {
        onMatch(profiles[currentIndex]);
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setExitDirection(null);
      setOffset({ x: 0, y: 0 });
      setExitDuration(400); // Reset default
    }, duration);
  };

  // --- Mouse/Touch Wrappers ---
  
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();

  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => {
      if(isDragging) handleMove(e.clientX, e.clientY);
  };
  const onMouseUp = () => {
      if(isDragging) handleEnd();
  };
  const onMouseLeave = () => {
      if(isDragging) handleEnd();
  };

  // --- Render Helpers ---

  if (loading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
         <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-emerald-500 animate-pulse">LOADING</div>
         </div>
         <h2 className="text-2xl font-black uppercase italic tracking-widest text-white">Acquiring Targets</h2>
         <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Calibrating fWHR measurements...</p>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
         <div className="text-center p-6 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl max-w-xs">
           <div className="text-4xl mb-4">💀</div>
           <h2 className="text-2xl font-black text-white mb-2 uppercase italic">Database Empty</h2>
           <p className="text-slate-400 mb-6 text-sm font-mono">You have exhausted the local supply of moggers.</p>
           <button onClick={() => window.location.reload()} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-sm text-white font-black uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
             Reset Sim
           </button>
         </div>
      </div>
    );
  }

  // Animation Variables
  const rotateVal = offset.x * 0.05; 
  const opacity = exitDirection ? 0 : 1;
  const scale = exitDirection ? 0.95 : 1;
  
  // Dynamic transition string
  const transition = isDragging 
    ? 'none' 
    : `transform ${exitDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity ${exitDuration}ms ease-out`;

  const cardTransform = `translate(${offset.x}px, ${offset.y}px) rotate(${rotateVal}deg) scale(${scale})`;
  
  const shadowIntensity = Math.min(Math.abs(offset.x) / 500, 1);
  const dynamicShadow = `0px ${10 + shadowIntensity * 20}px ${20 + shadowIntensity * 40}px -5px rgba(0,0,0, ${0.5 + shadowIntensity * 0.5})`;

  const likeOpacity = Math.min(Math.max(offset.x / (SWIPE_THRESHOLD * 0.8), 0), 1);
  const nopeOpacity = Math.min(Math.max(-offset.x / (SWIPE_THRESHOLD * 0.8), 0), 1);

  // Background card scale effect
  const absOffset = Math.min(Math.abs(offset.x), 300);
  const bgScale = 0.92 + (absOffset / 300) * 0.08;
  const bgOpacity = 0.6 + (absOffset / 300) * 0.4;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="relative w-full max-w-sm aspect-[3/4]">
        
        {/* Background Card */}
        {nextProfile && (
           <div 
             key={nextProfile.id}
             className="absolute inset-0 z-0 transition-transform duration-150 ease-out"
             style={{
                 transform: `scale(${bgScale})`,
                 opacity: bgOpacity,
                 filter: 'brightness(0.5) blur(1px) grayscale(1)'
             }}
           >
             <ProfileCard profile={nextProfile} />
           </div>
        )}

        {/* Chromatic Aberration Trails (Glitch Effect) */}
        {(isDragging || exitDirection) && (
            <>
                 {/* Cyan Trail */}
                 <div 
                    key={`cyan-${currentProfile.id}`}
                    className="absolute inset-0 z-5 pointer-events-none"
                    style={{
                        transform: `translate(${offset.x * 0.8}px, ${offset.y * 0.8}px) rotate(${rotateVal * 0.8}deg) scale(0.95)`,
                        transition: transition,
                        opacity: 0.6,
                        filter: 'blur(2px) contrast(200%)'
                    }}
                >
                    <ProfileCard profile={currentProfile} />
                    <div className="absolute inset-0 bg-cyan-500/40 mix-blend-color-dodge rounded-2xl"></div>
                </div>
                {/* Red Trail */}
                <div 
                    key={`red-${currentProfile.id}`}
                    className="absolute inset-0 z-6 pointer-events-none"
                    style={{
                        transform: `translate(${offset.x * 0.9}px, ${offset.y * 0.9}px) rotate(${rotateVal * 0.9}deg) scale(0.98)`,
                        transition: transition,
                        opacity: 0.6,
                        filter: 'blur(1px) contrast(200%)'
                    }}
                >
                    <ProfileCard profile={currentProfile} />
                    <div className="absolute inset-0 bg-red-500/40 mix-blend-color-dodge rounded-2xl"></div>
                </div>
            </>
        )}

        {/* Foreground Card */}
        <div 
          key={currentProfile.id}
          className="absolute inset-0 z-10 touch-none select-none cursor-grab active:cursor-grabbing will-change-transform"
          style={{
              transform: cardTransform,
              transition: transition,
              opacity: opacity,
              boxShadow: dynamicShadow
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
           <ProfileCard profile={currentProfile} />
           
           {/* Stamp Overlays - UPDATED STYLING */}
           <div 
             className="absolute top-8 left-6 border-4 border-emerald-500 text-emerald-500 px-4 py-2 text-5xl font-black uppercase tracking-tighter transform -rotate-12 bg-black/80 backdrop-blur-md shadow-[0_0_20px_#10b981] pointer-events-none transition-opacity duration-200 z-50"
             style={{ opacity: likeOpacity }}
           >
             MOG
           </div>
           
           <div 
             className="absolute top-8 right-6 border-4 border-rose-600 text-rose-600 px-4 py-2 text-5xl font-black uppercase tracking-tighter transform rotate-12 bg-black/80 backdrop-blur-md shadow-[0_0_20px_#e11d48] pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap"
             style={{ opacity: nopeOpacity }}
           >
             IT'S OVER
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mt-8 w-full max-w-sm z-20">
        <button 
          onClick={() => triggerSwipe('left')}
          disabled={!!exitDirection}
          className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-700 text-rose-600 flex items-center justify-center shadow-lg transform active:scale-95 transition-all hover:bg-rose-950 hover:border-rose-600 hover:shadow-[0_0_15px_#e11d48] group"
        >
          <div className="group-hover:scale-110 transition-transform">{ICONS.ITS_OVER}</div>
        </button>

        <button 
          onClick={() => triggerSwipe('right')}
          disabled={!!exitDirection}
          className="w-16 h-16 rounded-full bg-slate-900 border-2 border-emerald-900 text-emerald-500 flex items-center justify-center shadow-lg transform active:scale-95 transition-all hover:bg-emerald-950 hover:border-emerald-500 hover:shadow-[0_0_15px_#10b981] group"
        >
          <div className="group-hover:scale-110 transition-transform">{ICONS.MOG}</div>
        </button>
      </div>
    </div>
  );
};

export default SwipeDeck;