import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import OurStory from './components/OurStory';
import Accommodations from './components/Accommodations';
import TactileHeritage from './components/TactileHeritage';
import LocalExperiences from './components/LocalExperiences';
import CommunalTable from './components/CommunalTable';
import LocalGuide from './components/LocalGuide';
import BookingModal from './components/BookingModal';
import HearthChat from './components/HearthChat';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { Booking } from './types';

export default function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined);
  const [selectedGuideSectionId, setSelectedGuideSectionId] = useState<string | undefined>(undefined);

  // Password reset token parsed from URL hash (#reset-password?token=...)
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Parse URL hash for password reset token on mount and hash changes
  useEffect(() => {
    function parseResetToken() {
      const hash = window.location.hash;
      if (hash.startsWith('#reset-password')) {
        const params = new URLSearchParams(hash.split('?')[1] || '');
        const token = params.get('token');
        if (token) {
          setResetToken(token);
          setIsAdminOpen(true); // Auto-open admin panel for reset flow
        }
      }
    }
    
    parseResetToken();
    window.addEventListener('hashchange', parseResetToken);
    return () => window.removeEventListener('hashchange', parseResetToken);
  }, []);

  // Clear reset token from URL and state after it's been used
  const handleClearResetToken = () => {
    setResetToken(null);
    // Clean the URL hash without triggering navigation
    if (window.location.hash.startsWith('#reset-password')) {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  // Fetch initial bookings on mount
  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await fetch('/api/bookings');
        const data = await response.json();
        if (data.success) {
          setBookings(data.data);
        }
      } catch (err) {
        console.warn("Could not retrieve active bookings registry:", err);
      }
    }
    loadBookings();
  }, []);

  const handleOpenBooking = (roomId?: string) => {
    setSelectedRoomId(roomId);
    setIsBookingOpen(true);
  };

  const handleOpenGuideSection = (tabId?: string) => {
    setSelectedGuideSectionId(tabId);
    // Smooth scroll down to guide section safely
    const guideElem = document.getElementById('guide');
    if (guideElem) {
      guideElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleBookingDeleted = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const handleBookingUpdated = (updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
  };

  const handleAddSampleBooking = (newBooking: Booking) => {
    setBookings(prev => [newBooking, ...prev]);
  };

  return (
    <div className="relative bg-zinc-950 text-zinc-100 min-h-screen selection:bg-amber-500/20 selection:text-amber-200">
      
      {/* 1. Global Film Grain SVG Filter (Cozy cinematic noise) */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] bg-noise pointer-events-none" />

      {/* 2. Floating Navbar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenChat={() => setIsChatOpen(true)}
        bookings={bookings}
      />

      {/* 3. Hero Section (Ethereal Vistas) */}
      <Hero
        onOpenBooking={() => handleOpenBooking()}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* 4. Our Story Section (Portraits Style) */}
      <OurStory onOpenChat={() => setIsChatOpen(true)} />

      {/* 5. Accommodations Section (Mood Lighting Style) */}
      <Accommodations onOpenBooking={handleOpenBooking} />

      {/* 6. The Art of Slow Living Section (Tactile Heritage Style) */}
      <TactileHeritage />

      {/* 7. Local Experiences Section (Atmospheric Style with light leaks) */}
      <LocalExperiences onOpenGuide={handleOpenGuideSection} />

      {/* 8. A Seat at our Table Section (Communal Table Style) */}
      <CommunalTable />

      {/* 9. Local Field Guide (Interactive Booklet Compass) */}
      <LocalGuide activeSectionId={selectedGuideSectionId} />

      {/* 10. Footer Section */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        bookings={bookings}
        onOpenStaffLogin={() => setIsAdminOpen(true)}
      />

      {/* 11. Interactive Booking Sheet Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedRoomId={selectedRoomId}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* 12. Interactive Hearth Fire Chat Drawer */}
      <HearthChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTriggerGuide={handleOpenGuideSection}
      />

      {/* 13. Administrative Registry Ledger Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        bookings={bookings}
        onBookingDeleted={handleBookingDeleted}
        onBookingUpdated={handleBookingUpdated}
        onAddSampleBooking={handleAddSampleBooking}
        resetToken={resetToken}
        onClearResetToken={handleClearResetToken}
      />
    </div>
  );
}
