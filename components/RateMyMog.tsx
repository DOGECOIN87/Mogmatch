import React, { useState, useRef } from 'react';
import { ICONS } from '../constants';
import { analyzeUserPhoto } from '../services/geminiService';
import { AnalysisResult } from '../types';

const RateMyMog: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setResult(null);
    
    const base64Data = image.split(',')[1];
    const data = await analyzeUserPhoto(base64Data);
    
    setResult(data);
    setAnalyzing(false);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  const ProgressBar = ({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => (
    <div className="flex flex-col gap-1 mb-3">
      <div className="flex justify-between items-end">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
         <span className="text-xs font-bold text-white font-mono">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-900 rounded-sm overflow-hidden border border-white/5">
        <div 
           className={`h-full transition-all duration-1000 ${colorClass} shadow-[0_0_8px_currentColor]`} 
           style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  const getVerdict = (score: number) => {
    if (score >= 9.5) return "GOD TIER";
    if (score >= 9) return "GIGACHAD";
    if (score >= 8) return "CHAD";
    if (score >= 7) return "CHADLITE";
    if (score >= 6) return "HTN";
    if (score >= 5) return "NORMIE";
    if (score >= 4) return "SUB-5";
    return "IT'S OVER";
  };

  const getVerdictColor = (score: number) => {
    if (score >= 8) return "text-emerald-500 drop-shadow-[0_0_10px_#10b981]";
    if (score >= 6) return "text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]";
    if (score >= 5) return "text-yellow-400 drop-shadow-[0_0_10px_#facc15]";
    return "text-rose-600 drop-shadow-[0_0_10px_#e11d48]";
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 pb-28 scrollbar-hide">
      <h1 className="text-3xl font-black text-center mb-8 uppercase italic tracking-tighter">
        <span className="text-white">Aesthetic</span> <span className="text-emerald-500">Analysis</span>
      </h1>

      {!image ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/20 rounded-2xl bg-white/5 p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
           <div className="absolute inset-0 bg-scanlines opacity-20"></div>
           
           <div className="w-24 h-24 bg-black border border-white/10 rounded-full flex items-center justify-center mb-6 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-float group-hover:scale-110 transition-transform">
             {ICONS.CAMERA}
           </div>
           
           <h3 className="text-white font-bold uppercase tracking-widest mb-2">Initialize Scan</h3>
           <p className="text-slate-500 text-center mb-8 max-w-xs text-xs font-mono">
             Upload facial data for biometric breakdown. Analysis utilizes advanced Looksmaxxing algorithms.
           </p>
           
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="px-8 py-3 bg-emerald-600 rounded-sm font-black text-white uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
           >
             Upload Source
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             accept="image/*" 
             className="hidden" 
           />
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6 animate-fade-in w-full">
           {/* Image Container with Scanner */}
           <div className="relative w-full aspect-square rounded-sm overflow-hidden border-2 border-white/20 shadow-2xl">
             <img src={image} alt="Upload" className="w-full h-full object-cover filter contrast-110 grayscale-[0.3]" />
             
             {/* Tech Corners */}
             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 z-20"></div>
             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 z-20"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 z-20"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 z-20"></div>

             {/* Scanner Overlay */}
             {analyzing && (
               <div className="absolute inset-0 z-10 pointer-events-none">
                 <div className="w-full h-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] absolute animate-scan"></div>
                 <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay"></div>
                 <div className="absolute top-1/2 left-0 right-0 text-center text-4xl font-black text-emerald-500 uppercase tracking-widest animate-pulse opacity-50">Processing</div>
               </div>
             )}

             {/* Result Overlay when done */}
             {!analyzing && result && (
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-20">
                  <div className="flex justify-between items-center mb-1 border-b border-white/20 pb-2">
                      <span className="text-[10px] font-bold tracking-widest text-emerald-400">ANALYSIS_COMPLETE</span>
                      <span className="text-[10px] font-mono text-slate-500">SECURE_CHANNEL</span>
                  </div>
                  <h2 className="text-3xl font-black text-white leading-none uppercase italic mt-2">{result.title}</h2>
                  <div className="text-xs font-bold text-emerald-500 uppercase tracking-[0.2em] mt-1">{result.breakdown.phenotype}</div>
               </div>
             )}
           </div>

           {!result && !analyzing && (
             <div className="flex gap-4 w-full">
               <button 
                 onClick={reset}
                 className="flex-1 py-4 bg-black border border-white/20 text-slate-400 hover:text-white uppercase font-bold tracking-widest transition-colors text-xs"
               >
                 Abort
               </button>
               <button 
                 onClick={handleAnalyze}
                 className="flex-1 py-4 bg-emerald-600 text-white uppercase font-black tracking-widest hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-xs"
               >
                 Execute Scan
               </button>
             </div>
           )}

           {result && (
             <div className="w-full space-y-4 animate-fade-in-up pb-8">
               {/* Main Score Card */}
               <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-20 text-6xl font-black italic select-none">MOG</div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                     <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">Aesthetic Grade</h3>
                     <div className={`text-4xl font-black ${
                         result.score >= 8 ? 'text-emerald-500' :
                         result.score >= 5 ? 'text-yellow-500' : 'text-rose-500'
                     }`}>
                       {result.score}<span className="text-lg text-slate-500">/10</span>
                     </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium">
                    "{result.analysis}"
                  </p>
               </div>

               {/* Detailed Breakdown */}
               <div className="bg-black border border-white/10 p-6">
                  <h3 className="text-emerald-500 font-bold text-xs uppercase tracking-[0.3em] mb-6 border-b border-emerald-500/30 pb-2">
                    Biometric Breakdown
                  </h3>
                  <ProgressBar label="Jawline" value={result.breakdown.jawline} colorClass="bg-blue-500 text-blue-500" />
                  <ProgressBar label="Canthal Tilt" value={result.breakdown.eyes} colorClass="bg-purple-500 text-purple-500" />
                  <ProgressBar label="Dermis" value={result.breakdown.skin} colorClass="bg-rose-400 text-rose-400" />
                  <ProgressBar label="Symmetry" value={result.breakdown.symmetry} colorClass="bg-amber-400 text-amber-400" />
               </div>

               {/* Improvements */}
               <div className="bg-rose-950/20 border border-rose-500/20 p-6">
                 <h3 className="text-rose-500 font-bold text-xs uppercase tracking-[0.3em] mb-4">
                    Corrective Measures
                 </h3>
                 <div className="space-y-2">
                   {result.improvements.map((imp, idx) => (
                     <div key={idx} className="flex items-center gap-3 text-xs font-bold text-rose-200 uppercase tracking-wide">
                       <div className="w-1 h-1 bg-rose-500 rotate-45"></div> 
                       {imp}
                     </div>
                   ))}
                 </div>
               </div>
               
               <div className="py-6 flex flex-col items-center justify-center border-t border-b border-white/10 bg-black/50">
                  <div className="text-[10px] text-slate-500 uppercase tracking-[0.5em] mb-2">Final Verdict</div>
                  <div className={`text-5xl font-black italic uppercase tracking-tighter ${getVerdictColor(result.score)}`}>
                    {getVerdict(result.score)}
                  </div>
               </div>

               <button 
                 onClick={reset}
                 className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors border border-white/10"
               >
                 Re-Calibrate
               </button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default RateMyMog;