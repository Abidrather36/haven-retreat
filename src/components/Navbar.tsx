import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Moon, MessageSquare, Calendar, Compass, Star, LogIn } from 'lucide-react';
import { Booking } from '../types';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenChat: () => void;
  bookings: Booking[];
}

export default function Navbar({ onOpenBooking, onOpenChat, bookings }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
        isScrolled
          ? 'bg-zinc-950/80 backdrop-blur-md py-4 border-b border-zinc-900 shadow-lg'
          : 'bg-transparent py-6'
      }`}
      id="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand Logo */}
        <a href="#navbar" className="flex flex-col items-start select-none">
          <span className="font-serif text-xl md:text-2xl font-bold tracking-[0.15em] text-zinc-100 flex items-center gap-2">
            HAVEN <span className="text-amber-500 font-light italic text-lg tracking-normal">stay</span>
          </span>
          <span className="font-mono text-[9px] tracking-[0.4em] text-zinc-500 uppercase">
            Kashmir Sanctuary
          </span>
        </a>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 font-sans text-xs tracking-widest text-zinc-400 uppercase">
          <a href="#story" className="hover:text-amber-400 transition-colors duration-300">
            Our Story
          </a>
          <a href="#rooms" className="hover:text-amber-400 transition-colors duration-300">
            The Sanctuary
          </a>
          <a href="#craft" className="hover:text-amber-400 transition-colors duration-300">
            The Craft
          </a>
          <a href="#experiences" className="hover:text-amber-400 transition-colors duration-300">
            Experiences
          </a>
          <a href="#guide" className="hover:text-amber-400 transition-colors duration-300 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-zinc-500" />
            Local Guide
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Active Bookings Banner if applicable */}
          {bookings.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 font-mono text-[10px] text-amber-500 animate-pulse">
              <Star className="w-3 h-3 fill-amber-500" />
              <span>{bookings.length - 1} RESERVED</span>
            </div>
          )}

          {/* Sit by Hearth Chat Button */}
          <button
            onClick={onOpenChat}
            id="nav-chat-btn"
            className="flex items-center gap-2 px-3 md:px-4 py-2 border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50 text-zinc-300 hover:text-white rounded transition-all text-xs tracking-widest uppercase hover:shadow-glow"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Stoke Hearth</span>
          </button>

          {/* Book Button */}
          <button
            onClick={onOpenBooking}
            id="nav-book-btn"
            className="flex items-center gap-2 px-4 md:px-5 py-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold rounded cursor-pointer transition-all text-xs tracking-widest uppercase shadow-md shadow-amber-950/20"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Stay</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
