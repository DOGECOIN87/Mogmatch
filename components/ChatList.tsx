import React, { useState, useEffect, useRef } from 'react';
import { ChatMatch, ChatMessage } from '../types';
import { generateChatReply } from '../services/geminiService';

interface ChatListProps {
  matches: ChatMatch[];
  onUpdateMatch: (matchId: string, messages: ChatMessage[], lastMsg: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ matches, onUpdateMatch }) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = matches.find(m => m.id === selectedChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;

    const userMsg: ChatMessage = { role: 'user', text: inputText };
    const newHistory = [...selectedChat.messages, userMsg];
    
    // Optimistic update
    onUpdateMatch(selectedChat.id, newHistory, inputText);
    setInputText("");
    setIsTyping(true);

    try {
      const replyText = await generateChatReply(selectedChat.profile, selectedChat.messages, userMsg.text);
      
      const modelMsg: ChatMessage = { role: 'model', text: replyText };
      onUpdateMatch(selectedChat.id, [...newHistory, modelMsg], replyText);
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setIsTyping(false);
    }
  };

  if (selectedChat) {
    return (
        <div className="flex flex-col h-full bg-black relative">
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
            
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-black/90 backdrop-blur z-10">
                <button onClick={() => setSelectedChatId(null)} className="p-2 text-slate-400 hover:text-white transition-colors">
                   ←
                </button>
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <img src={selectedChat.profile.imageUrl} className="w-full h-full object-cover" alt="avatar"/>
                </div>
                <div>
                   <div className="font-bold text-xl text-white uppercase tracking-wide">{selectedChat.profile.name}</div>
                   <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]"></span>
                      ONLINE
                   </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 relative z-0 pb-24">
                {selectedChat.messages.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
                      <span className="text-4xl mb-4 grayscale">🤫</span>
                      <p className="uppercase tracking-widest text-xs font-bold">Initiate Protocol</p>
                   </div>
                ) : (
                  selectedChat.messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-5 py-3 text-sm font-medium border ${
                        msg.role === 'user' 
                          ? 'bg-emerald-900/40 border-emerald-500/30 text-emerald-100 rounded-2xl rounded-tr-sm shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                          : 'bg-slate-900 border-white/10 text-slate-300 rounded-2xl rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex justify-start">
                     <div className="bg-slate-900 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
             <div className="p-4 border-t border-white/10 bg-black absolute bottom-0 w-full">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter message..." 
                      className="flex-1 bg-slate-900/50 border border-white/10 text-white rounded-sm px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all placeholder:text-slate-600 uppercase tracking-wide font-medium"
                    />
                    <button 
                      type="submit"
                      disabled={!inputText.trim() || isTyping}
                      className="bg-emerald-600 text-white w-12 h-12 flex items-center justify-center rounded-sm hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 pb-24">
      <h1 className="text-3xl font-black text-white mb-8 uppercase italic tracking-tighter">
         Active <span className="text-emerald-500">Comms</span>
      </h1>
      
      {matches.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
          <div className="w-24 h-24 rounded-full border border-dashed border-slate-700 flex items-center justify-center mb-6">
             <span className="text-4xl grayscale opacity-30">⚡</span>
          </div>
          <p className="uppercase tracking-widest text-xs font-bold">No signals detected</p>
        </div>
      ) : (
        <>
          {/* Recent Match Bubbles */}
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar mb-8 min-h-[110px]">
            {matches.map(match => (
              <div 
                key={match.id} 
                onClick={() => setSelectedChatId(match.id)}
                className="flex flex-col items-center space-y-3 min-w-[80px] cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500 p-0.5 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                   <img src={match.profile.imageUrl} alt={match.profile.name} className="w-full h-full rounded-full object-cover grayscale-[0.3] contrast-125" />
                </div>
                <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center uppercase tracking-wider">{match.profile.name}</span>
              </div>
            ))}
          </div>

          <h2 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Encrypted Logs</h2>
          
          <div className="flex flex-col gap-2 overflow-y-auto pb-20 scrollbar-hide">
            {matches.map(match => (
              <div 
                 key={match.id} 
                 onClick={() => setSelectedChatId(match.id)}
                 className="flex items-center gap-4 p-4 rounded-sm border border-transparent hover:border-emerald-500/30 hover:bg-emerald-900/10 transition-all cursor-pointer bg-white/5"
              >
                <div className="relative">
                    <img src={match.profile.imageUrl} alt={match.profile.name} className="w-12 h-12 rounded-full object-cover grayscale-[0.2]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_5px_#10b981]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-white truncate uppercase tracking-wide text-sm">{match.profile.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(match.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className={`text-xs truncate font-medium ${match.messages.length > 0 && match.messages[match.messages.length-1].role === 'model' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {match.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatList;