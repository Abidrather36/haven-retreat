export interface Room {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  lightingStyle: string; // 'mood-lighting' | 'portraits' | 'atmospheric' | 'tactile' | 'ethereal'
  pricePerNight: number;
  capacity: string;
  features: string[];
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  duration: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomTitle: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'checked-in' | 'cancelled';
  bookedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: 'PortalAdmin' | 'Admin';
  isTempPassword: boolean;
  isActive: boolean;
  createdTime: string;
}
