import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Flame, Sparkles, Volume2, VolumeX, MessageSquare, ListMusic, Loader2, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';

interface HearthChatProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerGuide?: (tab?: string) => void;
}

export default function HearthChat({ isOpen, onClose, onTriggerGuide }: HearthChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'model',
      text: "As-salamu alaykum, my dear friend. Welcome to Haven. I have just stoked the hearth fire, and Farida is brewing a fresh copper samovar of spice-infused Kahwa. Sit with us, wrap a warm wool blanket around, and tell us: what brings you to our quiet valley?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom Audio ASMR state
  const [isAsmrPlaying, setIsAsmrPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const asmrIntervalRef = useRef<any>(null);
  const noiseNodeRef = useRef<any>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat thread
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Clean ASMR sound synthesis on unmount
  useEffect(() => {
    return () => stopAsmr();
  }, []);

  // Quick Chat Suggested Prompts
  const SUGGESTIONS = [
    "Tell me about the Hearth Suite",
    "How do we make Saffron Kahwa?",
    "Show me some un-tourist lake secrets",
    "Can you arrange host tours?"
  ];

  // ASMR Sound Synthesizer: Synthesizes low roaring wind and high crackling ember logs pops using native Web Audio context
  const startAsmr = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // 1. Create continuous quiet low-end rumbling wind/fire noise floor
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter noise to a narrow, warm fireplace low frequency
      const lowFilter = ctx.createBiquadFilter();
      lowFilter.type = 'lowpass';
      lowFilter.frequency.value = 180;

      const windGain = ctx.createGain();
      windGain.gain.value = 0.04; // quiet base low-end hum

      whiteNoise.connect(lowFilter);
      lowFilter.connect(windGain);
      windGain.connect(ctx.destination);
      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;

      // 2. Synthesize random 'cedar wood logs popping' clicks
      // Renders random high-end impulses through bandpass filter to sound exactly like dry wood popping!
      asmrIntervalRef.current = setInterval(() => {
        if (ctx.state === 'suspended') return;
        
        // Random popping rate
        if (Math.random() > 0.4) {
          const popSource = ctx.createBufferSource();
          const popBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
          const popData = popBuffer.getChannelData(0);
          
          // Exponential decay spike
          for (let i = 0; i < popData.length; i++) {
            popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
          }
          popSource.buffer = popBuffer;

          // Bandpass filter centered at 800-1500Hz for crisp organic wooden pop timbre
          const popFilter = ctx.createBiquadFilter();
          popFilter.type = 'bandpass';
          popFilter.frequency.value = 900 + Math.random() * 600;
          popFilter.Q.value = 3.0;

          const popGain = ctx.createGain();
          popGain.gain.value = 0.12 + Math.random() * 0.18; // varying crackle volume

          popSource.connect(popFilter);
          popFilter.connect(popGain);
          popGain.connect(ctx.destination);
          popSource.start();
        }
      }, 350);

      setIsAsmrPlaying(true);
    } catch (err) {
      console.warn("AudioContext prohibited. User interaction required first:", err);
    }
  };

  const stopAsmr = () => {
    try {
      if (asmrIntervalRef.current) {
        clearInterval(asmrIntervalRef.current);
      }
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    } catch (err) {}
    setIsAsmrPlaying(false);
  };

  const toggleAsmr = () => {
    if (isAsmrPlaying) {
      stopAsmr();
    } else {
      startAsmr();
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, text: m.text }))
        })
      });

      const data = await response.json();
      if (data.success) {
        const hostMsg: ChatMessage = {
          id: `hst-${Date.now()}`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, hostMsg]);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: "The mountain winds are blowing fierce and cold, my friend, and my voice cannot carry. Let me add another log to the hearth fire—tell me what you were saying once more.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-zinc-90 w-full bg-zinc-950 border-l border-zinc-900 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header containing stoking Fire indicators and ASMR toggle */}
        <div className="p-5 border-b border-zinc-900 bg-zinc-900/30 flex justify-between items-center bg-gradient-to-r from-zinc-950 to-zinc-900">
          
          <div className="flex items-center gap-3">
            {/* Glowing Embers Animation Icon representation */}
            <div className="relative w-8 h-8 rounded-full bg-orange-950/40 border border-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-950/20">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20 animate-pulse" />
              <div className="absolute inset-0 bg-orange-500/5 rounded-full animate-ping pointer-events-none" />
            </div>
            
            <div className="leading-none text-left">
              <span className="font-mono text-[8px] text-amber-500 tracking-[0.3em] font-semibold uppercase block">
                Sitting by the Hearth
              </span>
              <span className="font-serif text-sm font-bold text-zinc-100 flex items-center gap-1">
                Chat with Sajad <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mt-0.5" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Native Audio ASMR wind & popping stoker toggle */}
            <button
              onClick={toggleAsmr}
              className={`p-2 rounded border transition-all flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-mono tracking-widest ${
                isAsmrPlaying
                  ? 'bg-amber-600/15 border-amber-500 text-amber-400'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="Stoke realistic cedar crackling sound effects"
            >
              {isAsmrPlaying ? <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
              <span className="hidden xs:inline">ASMR Fire</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 border border-zinc-800 text-zinc-500 hover:text-white rounded bg-zinc-900/40 hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Close hearth drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Ambient Cedar logs burning visualization card box */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-yellow-950/10 via-amber-950/15 to-transparent border-b border-zinc-900 flex justify-between items-center relative">
          <div className="flex items-center gap-2 relative">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-sans text-[11px] text-zinc-400 font-light">
              {isAsmrPlaying ? 'The cedar logs are popping cheerily.' : 'Stoke fire sounds above for complete auditory warmth.'}
            </span>
          </div>
          <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
            {new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Messaging Area (Scroll) */}
        <div className="flex-grow p-5 space-y-4 overflow-y-auto bg-zinc-950 font-sans text-sm pb-8">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                {/* Speaker indicator */}
                <span className="font-mono text-[9px] text-zinc-600 mb-1 tracking-wider uppercase">
                  {isUser ? 'Your Inquiry' : 'Sajad @ Haven'}
                </span>

                {/* Speech Bubble */}
                <div
                  className={`p-3.5 rounded leading-relaxed font-light ${
                    isUser
                      ? 'bg-amber-600 text-zinc-950 rounded-br-none font-medium'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-850 rounded-bl-none font-serif tracking-wide text-[13.5px]'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Timestamp */}
                <span className="text-[9px] text-zinc-600 font-mono mt-1 block">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* AI Loader Bubble */}
          {loading && (
            <div className="flex flex-col items-start mr-auto max-w-[80%]">
              <span className="font-mono text-[9px] text-zinc-600 mb-1 uppercase">Sajad is thinking...</span>
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 text-zinc-400 rounded rounded-bl-none border border-zinc-850 text-xs italic font-light font-serif">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>Pouring Kahwa tea into glass cups...</span>
              </div>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Suggestion prompt suggestions pills bar */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950 flex flex-col gap-2 relative">
          <span className="font-mono text-[8px] text-zinc-600 tracking-widest uppercase block mb-1">
            Prompt suggestions
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="whitespace-nowrap px-3 py-1.5 text-[10px] rounded border border-zinc-850 hover:border-amber-500/30 bg-zinc-900/40 text-zinc-400 hover:text-amber-400 font-sans font-light transition-all cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input message block */}
        <div className="p-4 bg-zinc-900/30 border-t border-zinc-900 bg-gradient-to-t from-zinc-950 to-zinc-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMsg);
            }}
            className="flex gap-2 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 items-center focus-within:border-amber-500/70"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask about availability, rooms, tea..."
              className="flex-grow bg-transparent text-sm focus:outline-none focus:ring-0 text-zinc-200 placeholder-zinc-700 font-light"
              disabled={loading}
              required
            />
            
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="p-1 px-3 bg-amber-600 disabled:bg-zinc-800 hover:bg-amber-500 text-zinc-950 rounded font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
          
          <div className="mt-2 text-center">
            <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-[0.2em]">
              Sajad usually answers within seconds by the fire
            </span>
          </div>
        </div>

      </div>
    </AnimatePresence>
  );
}
