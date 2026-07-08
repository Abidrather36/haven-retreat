import { motion } from 'motion/react';
import { Calendar, Phone, Mail, MapPin, Heart, ArrowUp } from 'lucide-react';
import { Booking } from '../types';

interface FooterProps {
  onOpenBooking: () => void;
  bookings: Booking[];
  onOpenStaffLogin: () => void;
}

export default function Footer({ onOpenBooking, bookings, onOpenStaffLogin }: FooterProps) {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-20 pb-10 relative overflow-hidden font-sans">
      
      {/* Mountain shape silhouette background representing twilight shadow */}
      <div className="absolute inset-x-0 bottom-0 h-96 opacity-[0.04] bg-[radial-gradient(ellipse_at_bottom,rgba(255,191,0,0.4)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
        
        {/* Call to Action Block */}
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-zinc-100 leading-tight">
            Ready to write your chapter<br />
            <span className="italic text-amber-205 font-normal text-amber-200">in the valley?</span>
          </h2>
          <p className="text-zinc-400 font-light text-xs sm:text-sm leading-relaxed">
            Spaces are limited to ensure an intimate, family-style experience for every guest. 
            Secure your stay at Haven Retreat today.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenBooking}
              className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold rounded tracking-widest uppercase text-xs transition-all duration-300 transform hover:scale-103 cursor-pointer shadow-lg shadow-amber-955/15"
            >
              Check Availability & Book
            </button>
          </div>
        </div>

        {/* List of active boardings booked during session with elegant ticket stamps */}
        {bookings && bookings.length > 0 && (
          <div className="border border-zinc-900 bg-zinc-900/10 rounded p-6 max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="font-mono text-[9px] tracking-widest uppercase text-amber-500 font-semibold block">
                ACTIVE RESERVATION REGISTRY ({bookings.length})
              </span>
              <span className="font-mono text-[8px] text-zinc-500 uppercase">
                Persistent In-Memory Stays
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {bookings.map((book) => (
                <div
                  key={book.id}
                  className="p-4 rounded border border-zinc-900 bg-zinc-950 flex flex-col justify-between space-y-2 relative"
                >
                  <div className="absolute right-3 top-3 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded text-[8px] font-mono text-amber-500 font-semibold uppercase">
                    {book.status}
                  </div>
                  <div className="leading-none">
                    <span className="font-mono text-[8px] text-zinc-600 uppercase">PASSENGER NAME</span>
                    <h4 className="font-serif text-sm font-bold text-zinc-300">{book.guestName}</h4>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="leading-none grid">
                      <span className="font-mono text-[8px] text-zinc-600 uppercase">SANCTURY</span>
                      <span className="text-xs text-zinc-400 mt-0.5 font-sans font-light">{book.roomTitle}</span>
                    </div>
                    <div className="text-right leading-none grid">
                      <span className="font-mono text-[8px] text-zinc-600 uppercase">CHECK IN/OUT</span>
                      <span className="text-[10px] text-zinc-550 font-mono mt-0.5 text-zinc-400">
                        {book.checkIn} to {book.checkOut}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Traditional info card grid */}
        <div className="grid md:grid-cols-4 gap-8 pt-6 border-t border-zinc-900 text-xs text-zinc-550">
          
          {/* Column 1 info address */}
          <div className="space-y-4">
            <h5 className="font-serif text-base font-bold text-zinc-200">The Sanctuary Haven</h5>
            <p className="text-zinc-500 font-light leading-relaxed">
              Experience the slow, quiet luxury of Kashmir at Haven Retreat.
            </p>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Athwajan Near HK Hyundai, Srinagar, Kashmir 190004</span>
            </div>
          </div>

          {/* Column 2 Friendly reminder prompt */}
          <div className="space-y-4 col-span-2">
            <h5 className="font-serif text-base font-bold text-zinc-200">Friendly Contact Philosophy</h5>
            <p className="text-zinc-400 font-light italic leading-relaxed bg-zinc-900/20 p-4 border-l-2 border-amber-500/40 rounded-r">
              "Have a question? Ask us like you’re asking a friend. We’re usually stoking logs by the cedar fire and will get back to you by sunset."
            </p>
            <div className="flex gap-6 text-zinc-500">
              <span className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span>+91 194 779261</span>
              </span>
              <span className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                <span>hearth@havenstay.com</span>
              </span>
            </div>
          </div>

          {/* Column 3 scroll back */}
          <div className="flex flex-col items-start md:items-end justify-between font-mono text-[9px] tracking-widest uppercase">
            <span>&copy; {new Date().getFullYear()} HAVEN RETREAT</span>
            <button
              onClick={handleScrollTop}
              className="mt-4 flex items-center gap-2 group border border-zinc-850 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 p-2.5 rounded text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <span>Back to Skies</span>
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>

        </div>

        {/* Built with love mark */}
        <div className="text-center text-[10px] text-zinc-650 border-t border-zinc-900/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-light text-zinc-500 text-left">
            Crafted with deep reverence for Kashmiri woodworks, wool looms, and family hospitality.
          </p>
          <button
            onClick={onOpenStaffLogin}
            className="font-mono text-[9px] text-zinc-600 hover:text-amber-500 tracking-wider uppercase border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/30 px-3 py-1.5 rounded transition-all cursor-pointer"
            id="staff-login-btn"
          >
            Staff Login
          </button>
        </div>

      </div>
    </footer>
  );
}
