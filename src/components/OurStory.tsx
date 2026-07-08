import { motion } from 'motion/react';
import { Sparkles, MessageCircle } from 'lucide-react';

interface OurStoryProps {
  onOpenChat: () => void;
}

export default function OurStory({ onOpenChat }: OurStoryProps) {
  return (
    <section id="story" className="py-24 bg-zinc-950 border-y border-zinc-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center">
        {/* Left Side: Dramatic Host Portrait with Window Lighting & Soft shadows */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2 }}
          className="relative group aspect-[4/5] max-w-md mx-auto w-full bg-zinc-900 rounded shadow-2xl overflow-hidden"
        >
          {/* Subtle Warm Film Grading Overlay & Grain */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10 opacity-70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay z-10 pointer-events-none" />

          {/* Golden morning window light path representation via gradient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none z-10" />

          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
            alt="Host Sajad brewing traditional tea by the window"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover grayscale brightness-90 contrast-110 group-hover:grayscale-0 group-hover:scale-103 transition-all duration-1000"
          />

          {/* Bottom Left Frame Info Card */}
          <div className="absolute bottom-8 left-8 z-20">
            <p className="font-mono text-[9px] tracking-[0.3em] text-amber-400 uppercase mb-1">
              Photographed at Dawn
            </p>
            <h4 className="font-serif text-xl text-zinc-100 italic font-semibold">
              Sajad stoking the hearth logs
            </h4>
          </div>
        </motion.div>

        {/* Right Side: Copy & Narrative block */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="space-y-3">
            <span className="font-mono text-[10px] tracking-[0.35em] text-amber-500 font-semibold uppercase block">
              THE HAVEN PHILOSOPHY
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-100 leading-tight">
              Where Every Guest<br />
              <span className="italic text-amber-200/90 font-normal">Becomes Family.</span>
            </h2>
          </div>

          <div className="space-y-6 text-zinc-400 font-light leading-relaxed text-sm md:text-base">
            <p>
              We believe travel should do more than just change your coordinates—it should change your pace. 
              Haven Retreat was born out of a deep reverence for the misty peaks, the quiet lakes, and the 
              unmatched warmth of Kashmiri hospitality.
            </p>
            <p>
              We didn't build this portal to offer just another room on a map. We built it to open our doors 
              to the world. The moment you step through our threshold, you aren't a reservation number or 
              a transient traveler. You are a part of our home, sharing in the slow, beautiful rhythm of valley life. 
              Come for the landscapes; stay for the connection.
            </p>
          </div>

          {/* Action to meet hosts via interactive prompt */}
          <div className="pt-4">
            <button
              onClick={onOpenChat}
              className="group inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.25em] uppercase text-amber-400 border-b border-amber-500/20 hover:border-amber-400 hover:text-white pb-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Meet the Hosts &rarr;</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
