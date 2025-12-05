import React from 'react';
import { Profile } from '../types';

interface ProfileCardProps {
  profile: Profile;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group">
      
      {/* Image */}
      <img 
        src={profile.imageUrl} 
        alt={profile.name} 
        className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] contrast-125 group-hover:scale-105 transition-transform duration-700"
        draggable={false}
      />
      
      {/* HUD Overlay Lines */}
      <div className="absolute inset-0 border-[1px] border-white/5 m-2 rounded-xl pointer-events-none z-20"></div>
      <div className="absolute top-4 right-4 z-20 flex gap-1">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
        <div className="w-2 h-2 bg-emerald-500/30 rounded-full"></div>
        <div className="w-2 h-2 bg-emerald-500/30 rounded-full"></div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-100 z-10" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-3 z-30">
        
        {/* Name Header */}
        <div className="relative border-l-4 border-emerald-500 pl-4 mb-2">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-md">
                {profile.name}
            </h2>
            <div className="flex justify-between items-end w-full">
                <span className="text-xl text-emerald-400 font-bold">{profile.age} <span className="text-xs text-slate-400 font-normal">Y/O</span></span>
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">ID: {profile.id.slice(0,6)}</span>
            </div>
        </div>
        
        {/* Tagline Badge */}
        <div className="flex">
            <span className="px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 text-emerald-300 text-xs font-bold uppercase tracking-widest rounded-sm">
             "{profile.tagline}"
            </span>
        </div>

        {/* Bio */}
        <p className="text-slate-300 text-sm leading-snug opacity-90 font-medium">
          {profile.bio}
        </p>

        {/* Stats HUD */}
        <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 mt-2 backdrop-blur-md rounded-sm overflow-hidden">
           
           {/* Jawline */}
           <div className="bg-black/60 p-2 flex flex-col items-center justify-center relative">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest absolute top-1 left-2">JAW</span>
             <div className="text-xl font-bold text-white mt-2">{profile.stats.jawline}<span className="text-xs text-slate-500">/10</span></div>
             <div className="w-full h-0.5 bg-slate-800 mt-1">
                <div className="h-full bg-emerald-500 shadow-[0_0_5px_#10b981]" style={{width: `${(profile.stats.jawline / 10) * 100}%`}}></div>
             </div>
           </div>

           {/* Eyes */}
           <div className="bg-black/60 p-2 flex flex-col items-center justify-center relative">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest absolute top-1 left-2">EYES</span>
             <div className="text-sm font-bold text-cyan-300 mt-3 truncate w-full text-center uppercase">{profile.stats.canthalTilt}</div>
           </div>

           {/* Streak */}
           <div className="bg-black/60 p-2 flex flex-col items-center justify-center relative">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest absolute top-1 left-2">STREAK</span>
             <div className="text-xl font-bold text-amber-400 mt-2">{profile.stats.mewingStreak}</div>
             <span className="text-[8px] text-amber-400/50 uppercase">DAYS ACTIVE</span>
           </div>

           {/* Height */}
           <div className="bg-black/60 p-2 flex flex-col items-center justify-center relative">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest absolute top-1 left-2">HGT</span>
             <div className="text-xl font-bold text-purple-400 mt-2">{profile.stats.height}</div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileCard;