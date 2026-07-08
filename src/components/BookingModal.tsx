import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Mail, Sparkles, CheckCircle2, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { ROOMS } from '../data/havenData';
import { Booking, Room } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRoomId?: string;
  onBookingSuccess: (newBooking: Booking) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  preselectedRoomId,
  onBookingSuccess
}: BookingModalProps) {
  const [roomId, setRoomId] = useState(preselectedRoomId || 'hearth-suite');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Set default check-in tomorrow, check-out in 3 days
  const tomorrowStr = new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0];
  const inThreeDaysStr = new Date(Date.now() + 3600000 * 24 * 4).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(tomorrowStr);
  const [checkOut, setCheckOut] = useState(inThreeDaysStr);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState<Booking | null>(null);

  useEffect(() => {
    if (preselectedRoomId) {
      setRoomId(preselectedRoomId);
    }
  }, [preselectedRoomId, isOpen]);

  const selectedRoom = ROOMS.find(r => r.id === roomId) || ROOMS[0]!;

  // Estimate total amount to display
  const calculateDays = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) return 1;
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const totalDays = calculateDays();
  const estimatedAmount = selectedRoom.pricePerNight * totalDays;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !checkIn || !checkOut) {
      setError('Please fill in your basic details so we can write your ticket.');
      return;
    }

    if (new Date(checkOut).getTime() <= new Date(checkIn).getTime()) {
      setError('Departure date must fall after your arrival date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomId,
          guestName: name,
          guestEmail: email,
          checkIn,
          checkOut,
          amount: estimatedAmount
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessTicket(data.data);
        onBookingSuccess(data.data);
      } else {
        setError(data.error || 'The mountains are in draft. Please stoke logs and try once more.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the Booking Hearth. Please verify connection and stoke logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSuccessTicket(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={successTicket ? handleReset : onClose}
          className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
        />

        {/* Modal Paper Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-zinc-90 w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded shadow-2xl p-6 md:p-8 z-10 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={successTicket ? handleReset : onClose}
            className="absolute top-5 right-5 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800/40 rounded transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Boarding Ticket State */}
          {successTicket ? (
            <div className="space-y-6 pt-4 text-center">
              <div className="w-16 h-16 bg-amber-600/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce mb-2">
                <CheckCircle2 className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] tracking-[0.3em] text-amber-500 uppercase font-semibold">
                  SNC RESERVATION LOCKED
                </span>
                <h3 className="font-serif text-3xl font-bold text-zinc-100">
                  Welcome to the Family, {successTicket.guestName}!
                </h3>
                <p className="text-zinc-400 text-xs font-light max-w-md mx-auto leading-relaxed">
                  The hearth cedar wood logs are being gathered. An invitation letter with check-in instructions has been stashed in your email.
                </p>
              </div>

              {/* Physical Border ticket replica */}
              <div className="border border-dashed border-zinc-700 bg-zinc-950 p-6 rounded-lg text-left mt-6 relative max-w-md mx-auto shadow-inner">
                {/* Visual stamp ring */}
                <div className="absolute right-6 top-6 w-20 h-20 rounded-full border-2 border-amber-500/15 flex items-center justify-center rotate-12 select-none pointer-events-none">
                  <span className="font-serif text-[10px] text-amber-500/30 tracking-tight text-center font-bold">
                    HAVEN<br />STAMPED
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between font-mono text-[9px] text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-2">
                    <span>BOARDING VOUCHER</span>
                    <span>ID: {successTicket.id}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[8px] text-zinc-500 uppercase">SANCTUARY ASSIGNED</span>
                    <h4 className="font-serif text-lg font-bold text-zinc-200 leading-none">
                      {successTicket.roomTitle}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-3">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[8px] text-zinc-500 uppercase">ARRIVAL DATE</span>
                      <p className="font-sans text-xs text-zinc-300 font-semibold">{successTicket.checkIn}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-mono text-[8px] text-zinc-500 uppercase">DEPARTURE DATE</span>
                      <p className="font-sans text-xs text-zinc-300 font-semibold">{successTicket.checkOut}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-zinc-900 pt-4 mt-2">
                    <div>
                      <span className="font-mono text-[8px] text-zinc-500 uppercase">PAYMENT DUE ON ARRIVAL</span>
                      <div className="flex items-center text-amber-400 font-bold font-serif text-lg leading-none">
                        <span>Total Due at Arrival: ₹{successTicket.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="font-mono text-[9px] bg-amber-500/10 border border-amber-500/25 text-amber-500 px-2 py-0.5 rounded">
                      STAY SECURED
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold rounded tracking-wider uppercase text-xs transition-colors cursor-pointer"
                >
                  Return to Sanctuary
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form Content */
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-1">
                <span className="font-mono text-[10px] tracking-[0.3em] text-amber-500 uppercase font-semibold">
                  BOOK RESERVATION
                </span>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-zinc-100">
                  Write Your Chapter in the Valley
                </h3>
                <p className="text-zinc-500 text-xs font-light">
                  Spaces are limited to ensure an intimate, family-style experience for every guest. Secure your dates below.
                </p>
              </div>

              {/* Error Alert details */}
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded">
                  {error}
                </div>
              )}

              {/* Form Input fields */}
              <div className="space-y-4 font-sans text-zinc-300">
                
                {/* Room Selector */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase block">
                    Choose Sanctuary cabin
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {ROOMS.map((room) => (
                      <button
                        type="button"
                        key={room.id}
                        onClick={() => setRoomId(room.id)}
                        className={`p-3.5 text-left rounded border transition-all flex flex-col justify-between ${
                          roomId === room.id
                            ? 'bg-zinc-950 border-amber-500 text-amber-400 shadow-lg'
                            : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div>
                          <span className="font-serif text-sm font-semibold">{room.title}</span>
                          <span className="text-[10px] font-light text-zinc-400 block mt-1 leading-none">
                            {room.tagline.split('&')[0]}
                          </span>
                        </div>
                        <span className="font-serif text-sm mt-3 font-semibold text-amber-400">
                          ₹{room.pricePerNight.toLocaleString('en-IN')} <span className="text-[9px] font-mono text-zinc-500 font-light">/ night</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Inputs Name & Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  
                  {/* Guest Name */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase block">
                      Your full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Evelyn Sterling"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 focus:border-amber-500/60 rounded text-sm placeholder-zinc-700 focus:outline-none focus:ring-0 text-zinc-200 font-light"
                        required
                      />
                    </div>
                  </div>

                  {/* Guest Email */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase block">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. evelyn@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 focus:border-amber-500/60 rounded text-sm placeholder-zinc-700 focus:outline-none focus:ring-0 text-zinc-200 font-light"
                        required
                      />
                    </div>
                  </div>

                </div>

                {/* Arrival & Departure dates */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Check In */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase block">
                      Arrival Date (Check-in)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={tomorrowStr}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 focus:border-amber-500/60 rounded text-sm focus:outline-none text-zinc-200 font-mono font-light cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  {/* Check Out */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase block">
                      Departure Date (Check-out)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || tomorrowStr}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-950/80 border border-zinc-800 focus:border-amber-500/60 rounded text-sm focus:outline-none text-zinc-200 font-mono font-light cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Estimated Pricing summary banner */}
              <div className="mt-6 border-t border-zinc-800 pt-5 flex justify-between items-center bg-zinc-950/40 p-4 rounded border border-zinc-900">
                <div className="flex flex-col">
                  <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block font-medium">
                    PRICING RUNWAY ({totalDays} Night{totalDays > 1 ? 's' : ''})
                  </span>
                  <span className="text-zinc-300 text-xs font-light">
                    ₹{selectedRoom.pricePerNight.toLocaleString('en-IN')} x {totalDays} nights
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block font-medium">
                    TOTAL DUE AT ARRIVAL
                  </span>
                  <span className="font-serif text-2xl font-bold text-amber-400">
                    ₹{estimatedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 font-bold rounded tracking-wider uppercase text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/15"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Writing ticket on the copper loom...</span>
                    </>
                  ) : (
                    <>
                      <span>Lock In Your Sanctuary Stay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
