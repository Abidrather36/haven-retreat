import { useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, ArrowRight, Compass, Moon } from 'lucide-react';
import { EXPERIENCES } from '../data/havenData';

interface LocalExperiencesProps {
  onOpenGuide: (tab?: string) => void;
}

export default function LocalExperiences({ onOpenGuide }: LocalExperiencesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 400;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="experiences" className="py-24 bg-zinc-950 text-zinc-100 border-t border-zinc-900 overflow-hidden relative">
      {/* Tiny Ambient Floating Blue-Pink Glow in the Background */}
      <div className="absolute -left-48 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute -right-48 top-1/3 w-96 h-96 bg-pink-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Title & Navigation row */}
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-4">
            <span className="font-mono text-[10px] tracking-[0.35em] text-amber-500 font-semibold uppercase block">
              THE KASHMIR DIARY
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
              Live the Moments<br />Most Travelers Miss
            </h2>
          </div>
          
          {/* Slider Controllers */}
          <div className="flex gap-3">
            <button
              onClick={() => scroll('left')}
              className="p-3 border border-zinc-800 rounded bg-zinc-900/45 hover:border-amber-500/30 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 border border-zinc-800 rounded bg-zinc-900/45 hover:border-amber-500/30 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Experience Scroll Container */}
        <div
          ref={containerRef}
          className="flex gap-8 overflow-x-auto pb-10 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent no-scrollbar"
        >
          {EXPERIENCES.map((exp, idx) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: idx * 0.15 }}
              className="min-w-[320px] sm:min-w-[380px] md:min-w-[420px] relative group flex flex-col justify-between"
              id={`experience-${exp.id}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded bg-zinc-950">
                {/* Specific ATMOSPHERIC Light Leak Overlay: Neon blues and pinks of evening dusk */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-40 bg-gradient-to-tr from-blue-500/10 via-transparent to-pink-500/10 mix-blend-screen" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10 pointer-events-none" />

                <img
                  src={exp.imageUrl}
                  alt={exp.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-103 transition-all duration-1000 brightness-75 contrast-110"
                />

                {/* Overhead Category tag */}
                <div className="absolute top-5 left-5 z-20 flex items-center gap-1 bg-zinc-950/75 border border-zinc-800 px-3 py-1 rounded">
                  <Moon className="w-3 h-3 text-pink-400 fill-pink-400/10 animate-pulse" />
                  <span className="font-mono text-[9px] font-semibold text-zinc-300 tracking-wider uppercase">
                    {exp.category}
                  </span>
                </div>

                {/* Bottom Overlay containing Duration */}
                <div className="absolute bottom-5 right-5 z-20">
                  <span className="font-mono text-[10px] text-amber-400 border border-amber-500/30 bg-zinc-950/70 backdrop-blur-md px-2.5 py-1 rounded">
                    {exp.duration}
                  </span>
                </div>
              </div>

              {/* Title & Description under container */}
              <div className="mt-5 space-y-2">
                <h3 className="font-serif text-2xl font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">
                  {exp.title}
                </h3>
                <p className="text-zinc-400 font-light leading-relaxed text-xs sm:text-sm">
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Experiences CTA block */}
        <div className="mt-8 border-t border-zinc-900 pt-8 flex justify-center">
          <button
            onClick={() => onOpenGuide('beyond-postcards')}
            className="flex items-center gap-2 px-6 py-3 border border-zinc-805 hover:border-amber-500/40 bg-zinc-900/25 hover:bg-zinc-900/60 rounded text-zinc-300 hover:text-white font-mono text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-500" />
            <span>View Our Full Experience Guide</span>
          </button>
        </div>
      </div>
    </section>
  );
}
