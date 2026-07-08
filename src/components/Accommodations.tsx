import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Flame, Map, Users, ChevronRight } from 'lucide-react';
import { ROOMS } from '../data/havenData';
import { Room } from '../types';

interface AccommodationsProps {
  onOpenBooking: (roomId?: string) => void;
}

export default function Accommodations({ onOpenBooking }: AccommodationsProps) {
  return (
    <section id="rooms" className="py-24 bg-zinc-950 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header Block */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="font-mono text-[10px] tracking-[0.35em] text-amber-500 font-semibold uppercase block">
            THE SANCTUARY
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-100 leading-tight">
            Designed for Solitude.<br />
            Built for Comfort.
          </h2>
          <p className="text-zinc-400 font-light max-w-2xl text-sm md:text-base">
            Step inside from the crisp mountain air into spaces that wrap you in absolute warmth. 
            Heavy local wool blankets, deep cedar details, and crackling log fires.
          </p>
        </div>

        {/* Accommodations Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {ROOMS.map((room) => (
            <RoomCard key={room.id} room={room} onBook={() => onOpenBooking(room.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Subcomponent implementing the customized 'Spotlight / Flashlight' Hover Mask
function RoomCard({ room, onBook }: { room: Room; onBook: () => void; key?: string }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2 }}
      className="group relative bg-zinc-900 overflow-hidden rounded border border-zinc-900 flex flex-col justify-between cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      id={`room-${room.id}`}
    >
      {/* Background Room Image - Fully Glowing/Warm Base */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        <img
          src={room.imageUrl}
          alt={room.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103"
        />

        {/* Cinematic Dust Mote Grain overlay */}
        <div className="absolute inset-0 bg-yellow-950/10 mix-blend-color-burn pointer-events-none" />

        {/* Tactical Dark/Velvet Mask Overlay when not hovering.
            Using -webkit-mask-image or webkitMaskImage in style to reveal under cursor */}
        <div
          className="absolute inset-0 bg-zinc-950/80 grayscale contrast-125 transition-opacity duration-500 ease-out z-10 pointer-events-none"
          style={
            isHovering
              ? {
                  WebkitMaskImage: `radial-gradient(circle 180px at ${coords.x}px ${coords.y}px, transparent 10%, black 100%)`,
                  maskImage: `radial-gradient(circle 180px at ${coords.x}px ${coords.y}px, transparent 10%, black 100%)`,
                  opacity: 0.95,
                }
              : { opacity: 0.9 }
          }
        />

        {/* Hearth Fire Icon indicator that pulses above */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-zinc-950/60 backdrop-blur-md px-3 py-1.5 rounded border border-zinc-800/40">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 animate-pulse" />
          <span className="font-mono text-[9px] text-zinc-300 tracking-wider uppercase">
            {room.id === 'hearth-suite' ? 'FIREPLACE' : 'MOUNTAIN VIEW'}
          </span>
        </div>

        {/* Bottom Spotlight prompt that fades in */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
          <div className="bg-zinc-950/80 backdrop-blur-sm px-4 py-2 border border-zinc-800 rounded flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            <span className="font-mono text-[10px] text-zinc-300 tracking-widest uppercase">
              Move Cursor to Illuminate
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Information */}
      <div className="p-8 space-y-6 bg-zinc-900/40 relative z-20 flex-grow flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-amber-400 uppercase mb-1">
                {room.tagline}
              </p>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-zinc-100">
                {room.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="font-serif text-2xl font-bold text-amber-400">
                ₹{room.pricePerNight.toLocaleString('en-IN')}
              </span>
              <span className="font-mono text-[10px] text-zinc-500 block">/ night</span>
            </div>
          </div>

          <p className="text-zinc-400 font-light leading-relaxed text-sm">
            {room.description}
          </p>
        </div>

        {/* Feature List */}
        <div className="border-t border-zinc-900 pt-5 space-y-2.5">
          <div className="flex items-center gap-4 text-zinc-500 text-xs font-mono mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {room.capacity}
            </span>
            <span className="flex items-center gap-1">
              <Map className="w-3.5 h-3.5" />
              Private Oasis
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {room.features.slice(0, 4).map((feat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-zinc-400 text-xs font-light">
                <span className="w-1 h-1 rounded-full bg-amber-500" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Trigger button */}
        <div className="pt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            className="w-full py-3 border border-zinc-800 hover:border-amber-500/50 bg-zinc-950/50 hover:bg-amber-600 hover:text-zinc-950 rounded font-semibold text-xs tracking-widest text-zinc-300 uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Book Sanctuary</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
