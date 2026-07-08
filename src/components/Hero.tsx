import { motion } from 'motion/react';
import { Calendar, Flame, Compass } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
  onOpenChat: () => void;
}

export default function Hero({ onOpenBooking, onOpenChat }: HeroProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-zinc-950" id="hero">
      {/* Cinematic Ambient Background Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/15 via-transparent to-pink-950/15 mix-blend-screen pointer-events-none z-10" />
      <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
      
      {/* High-Key Misty Panoramic Mountain Background with slow Ken Burns Scale */}
      <motion.div 
        initial={{ scale: 1.08, filter: 'brightness(0.35)' }}
        animate={{ scale: 1, filter: 'brightness(0.45)' }}
        transition={{ duration: 12, ease: "easeOut" }}
        className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"
      />

      {/* Floating Sparkles / Dust Motes Animation to show 'Slow Living' air */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(9,9,11,0.8)_85%)] z-10 pointer-events-none" />

      {/* Hero Content Box */}
      <div className="relative z-20 text-center max-w-4xl px-6 md:px-12 flex flex-col items-center">
        {/* Small Elegant Overhead label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-md mb-6"
        >
          <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-zinc-400">
            Now Open for Summer & Autumn
          </span>
        </motion.div>

        {/* Hero Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.4 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-zinc-100 leading-[1.1]"
        >
          Haven isn’t just a place to stay—<br />
          <span className="italic text-amber-200/95 font-normal tracking-wide">
            it’s a feeling.
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.8 }}
          className="mt-6 text-sm md:text-lg text-zinc-400 max-w-2xl mx-auto font-sans font-light tracking-wide leading-relaxed"
        >
          Born from a love for Kashmir’s majestic landscapes and a dream to share its magic with the world. 
          Step out of the ordinary and into a sanctuary designed to ground you.
        </motion.p>

        {/* Dynamic CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Find Sanctuary */}
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold rounded transition-all shadow-lg shadow-amber-950/20 tracking-widest uppercase text-xs hover:scale-103 cursor-pointer"
          >
            Find Your Sanctuary
          </button>

          {/* Sit by Hearth */}
          <button
            onClick={onOpenChat}
            className="w-full sm:w-auto px-8 py-4 border border-zinc-700 hover:border-zinc-500 bg-zinc-950/45 hover:bg-zinc-900/60 text-zinc-200 rounded transition-all backdrop-blur-sm tracking-widest uppercase text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            <span>Sit by the Fire</span>
          </button>
        </motion.div>
      </div>

      {/* Arrow Down Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden md:block">
        <motion.a
          href="#story"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="font-mono text-[9px] tracking-[0.3em] uppercase text-zinc-500 flex flex-col items-center gap-2 hover:text-amber-400 transition-colors"
        >
          <span>Scroll to Discover</span>
          <div className="w-px h-10 bg-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-amber-500 animate-scroll-indicator" />
          </div>
        </motion.a>
      </div>
    </section>
  );
}
