import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, Eye, EyeOff, ShieldCheck, Calendar, Trash2, 
  CheckCircle2, UserPlus, RefreshCw, LogOut, 
  Search, Edit3, Sliders, TrendingUp, 
  Activity, Plus, AlertCircle, FileSpreadsheet,
  Users, KeyRound, Mail, ArrowLeft, Shield
} from 'lucide-react';
import { Booking, Room, AdminUser } from '../types';
import { ROOMS } from '../data/havenData';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onBookingDeleted: (bookingId: string) => void;
  onBookingUpdated: (updatedBooking: Booking) => void;
  onAddSampleBooking: (newBooking: Booking) => void;
  resetToken?: string | null;
  onClearResetToken?: () => void;
}

type ActiveTab = 'overview' | 'ledger' | 'scheduler' | 'create-booking' | 'admin-management';

// ─── Password Strength Helper ───
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 4) return { score, label: 'Good', color: 'bg-yellow-500' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
}

// ─── Password Strength Bar Component ───
function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const segments = 4;
  const filled = Math.min(segments, Math.ceil((strength.score / 6) * segments));
  
  if (!password) return null;
  
  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < filled ? strength.color : 'bg-zinc-800'}`} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-mono uppercase tracking-wider ${
          strength.label === 'Weak' ? 'text-red-400' :
          strength.label === 'Fair' ? 'text-amber-400' :
          strength.label === 'Good' ? 'text-yellow-400' : 'text-emerald-400'
        }`}>{strength.label}</span>
        <span className="text-[9px] text-zinc-600 font-mono">Min 8 chars, uppercase, number, special</span>
      </div>
    </div>
  );
}

export default function AdminDashboard({
  isOpen,
  onClose,
  bookings,
  onBookingDeleted,
  onBookingUpdated,
  onAddSampleBooking,
  resetToken,
  onClearResetToken
}: AdminDashboardProps) {
  // ─── Auth State ───
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [authView, setAuthView] = useState<'login' | 'forgot-password' | 'force-change' | 'reset-password'>('login');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Force change password state
  const [forceNewPassword, setForceNewPassword] = useState('');
  const [forceConfirmPassword, setForceConfirmPassword] = useState('');
  const [forceChangeLoading, setForceChangeLoading] = useState(false);
  const [forceChangeError, setForceChangeError] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Reset password state (from token link)
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  // Change password state (from dashboard)
  const [changeCurrentPassword, setChangeCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');
  const [changeError, setChangeError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Admin management state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'Admin' | 'PortalAdmin'>('Admin');
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminMessage, setCreateAdminMessage] = useState('');
  const [createAdminError, setCreateAdminError] = useState('');
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminRole, setEditAdminRole] = useState<'Admin' | 'PortalAdmin'>('Admin');
  const [editAdminActive, setEditAdminActive] = useState(true);

  // ─── Existing State (Preserved) ───
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, desc?: string, type: 'success' | 'info' | 'error'} | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Lock body scroll when full-screen dashboard is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'name-asc'>('date-desc');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>(["Sanctuary ledger initialized.", "System stashed secure keys on port 3000."]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editName, setEditName] = useState('');
  const [editBEmail, setEditBEmail] = useState('');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'confirmed' | 'pending' | 'checked-in' | 'cancelled'>('confirmed');
  const [newRoomId, setNewRoomId] = useState('hearth-suite');
  const [newName, setNewName] = useState('');
  const [newBEmail, setNewBEmail] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [newAmount, setNewAmount] = useState<string>('');

  // ─── Effects ───
  useEffect(() => {
    if (!isOpen) {
      setLoginError('');
      setActionError('');
      setForceChangeError('');
      setForgotError('');
      setResetError('');
    }
  }, [isOpen]);

  // Handle reset token from URL
  useEffect(() => {
    if (resetToken) {
      setAuthView('reset-password');
    }
  }, [resetToken]);

  // Fetch admin users when admin management tab is active
  useEffect(() => {
    if (activeTab === 'admin-management' && isLoggedIn && currentAdmin?.role === 'PortalAdmin') {
      fetchAdminUsers();
    }
  }, [activeTab, isLoggedIn]);

  // ─── Helpers ───
  const pushLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 8)]);
  };

  // ─── Auth Handlers ───
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Email and password are required.');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentAdmin(data.user);
        if (data.user.isTempPassword) {
          setAuthView('force-change');
          pushLog("Temporary password detected — change required.");
        } else {
          setIsLoggedIn(true);
          setLoginError('');
          setToastMessage({ title: 'Authentication Successful', desc: `Welcome back, ${data.user.fullName}.`, type: 'success' });
          pushLog(`${data.user.fullName} authenticated successfully.`);
        }
      } else {
        setLoginError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setLoginError('Could not connect to the authentication server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForceChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forceNewPassword !== forceConfirmPassword) {
      setForceChangeError('Passwords do not match.');
      return;
    }
    if (forceNewPassword.length < 8) {
      setForceChangeError('Password must be at least 8 characters.');
      return;
    }
    setForceChangeLoading(true);
    setForceChangeError('');
    try {
      const response = await fetch('/api/admin/force-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentAdmin?.id, newPassword: forceNewPassword })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentAdmin(prev => prev ? { ...prev, isTempPassword: false } : null);
        setIsLoggedIn(true);
        setAuthView('login');
        setForceNewPassword('');
        setForceConfirmPassword('');
        pushLog("Password updated successfully. Welcome aboard.");
      } else {
        setForceChangeError(data.error || 'Failed to change password.');
      }
    } catch (err) {
      setForceChangeError('Server error. Please try again.');
    } finally {
      setForceChangeLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');
    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();
      if (data.success) {
        setForgotMessage(data.message);
      } else {
        setForgotError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setForgotError('Server error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    setResetMessage('');
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: resetNewPassword })
      });
      const data = await response.json();
      if (data.success) {
        setResetMessage(data.message);
        onClearResetToken?.();
      } else {
        setResetError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setResetError('Server error. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changeNewPassword !== changeConfirmPassword) {
      setChangeError('Passwords do not match.');
      return;
    }
    if (changeNewPassword.length < 8) {
      setChangeError('Password must be at least 8 characters.');
      return;
    }
    setChangeLoading(true);
    setChangeError('');
    setChangeMessage('');
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: currentAdmin?.id, currentPassword: changeCurrentPassword, newPassword: changeNewPassword })
      });
      const data = await response.json();
      if (data.success) {
        setChangeMessage('Password changed successfully!');
        setChangeCurrentPassword('');
        setChangeNewPassword('');
        setChangeConfirmPassword('');
        pushLog("Password changed successfully.");
        setTimeout(() => setShowChangePassword(false), 2000);
      } else {
        setChangeError(data.error || 'Failed to change password.');
      }
    } catch (err) {
      setChangeError('Server error. Please try again.');
    } finally {
      setChangeLoading(false);
    }
  };

  // ─── Admin Management Handlers ───
  const fetchAdminUsers = async () => {
    setAdminLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) setAdminUsers(data.data);
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) {
      setCreateAdminError('Full name and email are required.');
      return;
    }
    setCreateAdminLoading(true);
    setCreateAdminError('');
    setCreateAdminMessage('');
    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: newAdminName, email: newAdminEmail, role: newAdminRole, requestedBy: currentAdmin?.id })
      });
      const data = await response.json();
      if (data.success) {
        const tempPwd = data.tempPassword;
        const msg = tempPwd 
          ? `✅ Admin "${data.user.fullName}" created!\n\n🔑 Temporary Password:\n${tempPwd}\n\n⚠️ Copy this now! Share it with the admin so they can log in.`
          : data.message;
        window.alert(msg);
        setCreateAdminMessage(data.message);
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminRole('Admin');
        setShowCreateAdmin(false);
        fetchAdminUsers();
        pushLog(`New admin created: ${data.user.fullName}`);
      } else {
        setCreateAdminError(data.error || 'Failed to create admin.');
      }
    } catch (err) {
      setCreateAdminError('Server error. Please try again.');
    } finally {
      setCreateAdminLoading(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    try {
      const response = await fetch(`/api/admin/users/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: editAdminName, email: editAdminEmail, role: editAdminRole, isActive: editAdminActive, requestedBy: currentAdmin?.id })
      });
      const data = await response.json();
      if (data.success) {
        setEditingAdmin(null);
        fetchAdminUsers();
        pushLog(`Admin updated: ${editAdminName}`);
      } else {
        setActionError(data.error || 'Failed to update admin.');
      }
    } catch (err) {
      setActionError('Server error.');
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this administrator account?')) return;
    try {
      const response = await fetch(`/api/admin/users/${adminId}?requestedBy=${currentAdmin?.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        fetchAdminUsers();
        pushLog("Admin account deleted.");
      } else {
        setActionError(data.error || 'Failed to delete admin.');
      }
    } catch (err) {
      setActionError('Server error.');
    }
  };

  const startEditingAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditAdminName(admin.fullName);
    setEditAdminEmail(admin.email);
    setEditAdminRole(admin.role);
    setEditAdminActive(admin.isActive);
  };

  // ─── Logout ───
  const confirmLogout = () => {
    setIsLoggedIn(false);
    setCurrentAdmin(null);
    setEmail('');
    setPassword('');
    setShowLogoutConfirm(false);
    setAuthView('login');
    setActiveTab('overview');
    pushLog("Staff logged out of dashboard.");
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  // ─── Existing Booking Handlers (Preserved) ───
  const handleCycleStatus = async (booking: Booking) => {
    setActionLoadingId(booking.id);
    setActionError('');
    let nextStatus: Booking['status'] = 'confirmed';
    if (booking.status === 'confirmed') nextStatus = 'pending';
    else if (booking.status === 'pending') nextStatus = 'checked-in';
    else if (booking.status === 'checked-in') nextStatus = 'cancelled';
    else if (booking.status === 'cancelled') nextStatus = 'confirmed';
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) });
      const data = await response.json();
      if (data.success) { onBookingUpdated(data.data); pushLog(`Booking #${booking.id.replace('booking-', '')} status updated to ${nextStatus}.`); }
      else { setActionError('Failed to update reservation status.'); }
    } catch (err) { setActionError('Error communicating with the booking server.'); }
    finally { setActionLoadingId(null); }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to completely release this reservation from the records?')) return;
    setActionLoadingId(id);
    setActionError('');
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) { onBookingDeleted(id); pushLog(`Reservation #${id.replace('booking-', '')} removed.`); if (editingBooking?.id === id) setEditingBooking(null); }
      else { setActionError('Failed to remove reservation.'); }
    } catch (err) { setActionError('Could not contact server.'); }
    finally { setActionLoadingId(null); }
  };

  const handleCreateMockBooking = async () => {
    setActionLoadingId('mock-creation');
    setActionError('');
    const randomGuests = [
      { name: "Julian Alcott", email: "julian@alcott-design.co" },
      { name: "Amara Vance", email: "amara@vance-photo.org" },
      { name: "Vikram Sen", email: "vikram.sen@valley-tea.in" },
      { name: "Priya Sharma", email: "priya.sharma@himalayas.com" },
      { name: "Kabir Dar", email: "kabir.dar@srinagar-arts.co" }
    ];
    const guest = randomGuests[Math.floor(Math.random() * randomGuests.length)]!;
    const rooms = ['hearth-suite', 'valley-view-cabin'];
    const randomRoomId = rooms[Math.floor(Math.random() * rooms.length)]!;
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 30) + 2);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 5) + 2);
    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];
    const duration = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
    const rate = randomRoomId === 'hearth-suite' ? 24500 : 28000;
    const finalAmount = rate * duration;
    try {
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: randomRoomId, guestName: guest.name, guestEmail: guest.email, checkIn: checkInStr, checkOut: checkOutStr, amount: finalAmount }) });
      const data = await response.json();
      if (data.success) { onAddSampleBooking(data.data); pushLog(`Simulated stay logged for ${guest.name}.`); }
      else { setActionError('Could not write simulated guest.'); }
    } catch (err) { setActionError('Error while creating mock data.'); }
    finally { setActionLoadingId(null); }
  };

  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newBEmail || !newCheckIn || !newCheckOut) { setActionError('Please complete all form fields.'); return; }
    setActionLoadingId('manual-submit');
    setActionError('');
    const targetRoom = ROOMS.find(r => r.id === newRoomId) || ROOMS[0]!;
    const days = Math.max(1, Math.ceil((new Date(newCheckOut).getTime() - new Date(newCheckIn).getTime()) / (1000 * 3600 * 24)));
    const autoAmount = targetRoom.pricePerNight * days;
    const finalAmount = newAmount ? parseFloat(newAmount) : autoAmount;
    try {
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: newRoomId, guestName: newName, guestEmail: newBEmail, checkIn: newCheckIn, checkOut: newCheckOut, amount: finalAmount }) });
      const data = await response.json();
      if (data.success) { onAddSampleBooking(data.data); pushLog(`Manual reservation logged for ${newName}.`); setNewName(''); setNewBEmail(''); setNewCheckIn(''); setNewCheckOut(''); setNewAmount(''); setActiveTab('ledger'); }
      else { setActionError(data.error || 'Failed to record reservation.'); }
    } catch (err) { setActionError('Error communicating with server.'); }
    finally { setActionLoadingId(null); }
  };

  const startEditing = (booking: Booking) => {
    setEditingBooking(booking);
    setEditName(booking.guestName);
    setEditBEmail(booking.guestEmail);
    setEditCheckIn(booking.checkIn);
    setEditCheckOut(booking.checkOut);
    setEditAmount(booking.amount);
    setEditStatus(booking.status);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setActionLoadingId(editingBooking.id);
    setActionError('');
    try {
      const resStatus = await fetch(`/api/bookings/${editingBooking.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: editStatus }) });
      const dataStatus = await resStatus.json();
      if (dataStatus.success) {
        const updatedObj: Booking = { ...dataStatus.data, guestName: editName, guestEmail: editBEmail, checkIn: editCheckIn, checkOut: editCheckOut, amount: editAmount };
        onBookingUpdated(updatedObj);
        pushLog(`Updated reservation for ${editName}.`);
        setEditingBooking(null);
      } else { setActionError('Failed to modify reservation.'); }
    } catch (err) { setActionError('Error saving changes.'); }
    finally { setActionLoadingId(null); }
  };

  const handleDownloadLedger = () => {
    setCsvSuccess(true);
    setTimeout(() => setCsvSuccess(false), 3000);
    const csvHeader = "Booking ID,Room ID,Room Title,Guest Name,Guest Email,Check-In,Check-Out,Amount (INR),Status,Booked At\n";
    const csvRows = bookings.map(b => `"${b.id}","${b.roomId}","${b.roomTitle.replace(/"/g, '""')}","${b.guestName.replace(/"/g, '""')}","${b.guestEmail.replace(/"/g, '""')}","${b.checkIn}","${b.checkOut}",${b.amount},"${b.status}","${b.bookedAt}"`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `haven_retreat_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushLog("Downloaded full ledger as CSV.");
  };

  // ─── Stats Calculations (Preserved) ───
  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const totalBookingsCount = bookings.length;
  const activeStaysCount = bookings.filter(b => b.status === 'checked-in').length;
  const pendingStaysCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedStaysCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalRevenue = activeBookings.reduce((sum, b) => sum + b.amount, 0);
  const averageValue = activeBookings.length > 0 ? Math.round(totalRevenue / activeBookings.length) : 0;

  // Filter & Search & Sort (Preserved)
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) || b.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoom = roomFilter === 'all' || b.roomId === roomFilter;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesRoom && matchesStatus;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime();
    if (sortBy === 'date-asc') return new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime();
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'name-asc') return a.guestName.localeCompare(b.guestName);
    return 0;
  });

  // Timeline scheduler data
  const getTimelineDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      days.push(d);
    }
    return days;
  };
  const timelineDays = getTimelineDays();

  const getBookingForDay = (roomId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.find(b => {
      if (b.roomId !== roomId || b.status === 'cancelled') return false;
      return dateStr >= b.checkIn && dateStr <= b.checkOut;
    });
  };

  if (!isOpen) return null;

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col md:flex-row overflow-hidden font-sans text-zinc-300">
        
        {!isLoggedIn ? (
          /* ═══ AUTH SCREENS ═══ */
          <div className="flex-grow flex items-center justify-center p-6 relative bg-zinc-950">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* ─── LOGIN SCREEN ─── */}
            {authView === 'login' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                className="relative bg-zinc-900 border border-zinc-800/80 rounded p-8 md:p-10 w-full max-w-md shadow-2xl z-10 space-y-6"
              >
                <button onClick={onClose} className="absolute top-4 left-4 p-2 text-zinc-500 hover:text-white rounded hover:bg-zinc-800/40 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono uppercase">
                  <X className="w-3.5 h-3.5" /><span>Guest Site</span>
                </button>

                <div className="text-center space-y-2 pt-4">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.35em] text-amber-500 uppercase font-semibold block">STAFF PORTAL LOCKSCREEN</span>
                  <h3 className="font-serif text-3xl font-bold text-zinc-100">Haven Registrar</h3>
                  <p className="text-zinc-500 text-xs font-light">Input your credentials to access the sanctuary administration.</p>
                </div>

                {loginError && (
                  <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded text-center font-light leading-relaxed">{loginError}</div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[8px] text-zinc-500 tracking-widest uppercase block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@havenstay.com" className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[8px] text-zinc-500 tracking-widest uppercase block">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-zinc-400 cursor-pointer">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loginLoading} className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 font-bold rounded tracking-widest uppercase text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg">
                    {loginLoading ? 'Authenticating...' : 'Unlock Sanctum Ledger'}
                  </button>
                </form>

                <div className="text-center">
                  <button onClick={() => { setAuthView('forgot-password'); setForgotMessage(''); setForgotError(''); }} className="text-amber-500/70 hover:text-amber-400 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors">
                    Forgot Password?
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── FORGOT PASSWORD SCREEN ─── */}
            {authView === 'forgot-password' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                className="relative bg-zinc-900 border border-zinc-800/80 rounded p-8 md:p-10 w-full max-w-md shadow-2xl z-10 space-y-6"
              >
                <button onClick={onClose} className="absolute top-4 left-4 p-2 text-zinc-500 hover:text-white rounded hover:bg-zinc-800/40 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono uppercase">
                  <X className="w-3.5 h-3.5" /><span>Close</span>
                </button>

                <div className="text-center space-y-2 pt-4">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.35em] text-amber-500 uppercase font-semibold block">PASSWORD RECOVERY</span>
                  <h3 className="font-serif text-3xl font-bold text-zinc-100">Reset Password</h3>
                  <p className="text-zinc-500 text-xs font-light">Enter your email address and we'll send you a reset link.</p>
                </div>

                {forgotError && <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded text-center">{forgotError}</div>}
                {forgotMessage && <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs rounded text-center">{forgotMessage}</div>}

                {!forgotMessage && (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-mono text-[8px] text-zinc-500 tracking-widest uppercase block">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Enter your registered email" className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light" required />
                      </div>
                    </div>
                    <button type="submit" disabled={forgotLoading} className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 font-bold rounded tracking-widest uppercase text-xs transition-all cursor-pointer shadow-lg">
                      {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                )}

                <div className="text-center">
                  <button onClick={() => { setAuthView('login'); setForgotError(''); setForgotMessage(''); }} className="text-zinc-500 hover:text-zinc-300 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 mx-auto">
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── FORCE CHANGE PASSWORD SCREEN ─── */}
            {authView === 'force-change' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                className="relative bg-zinc-900 border border-zinc-800/80 rounded p-8 md:p-10 w-full max-w-md shadow-2xl z-10 space-y-6 border-t-2 border-t-amber-500"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.35em] text-amber-500 uppercase font-semibold block">SECURITY REQUIREMENT</span>
                  <h3 className="font-serif text-2xl font-bold text-zinc-100">Set Your Password</h3>
                </div>

                <div className="p-3.5 bg-amber-950/30 border border-amber-500/20 text-amber-300 text-xs rounded text-center leading-relaxed">
                  ⚠️ Your account has a temporary password. Please set a new permanent password to continue.
                </div>

                {forceChangeError && <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded text-center">{forceChangeError}</div>}

                <form onSubmit={handleForceChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[8px] text-zinc-500 tracking-widest uppercase block">New Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={forceNewPassword} onChange={(e) => setForceNewPassword(e.target.value)} placeholder="Create a strong password" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-zinc-400 cursor-pointer">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={forceNewPassword} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-[8px] text-zinc-500 tracking-widest uppercase block">Confirm Password</label>
                    <input type="password" value={forceConfirmPassword} onChange={(e) => setForceConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light" required />
                    {forceConfirmPassword && forceNewPassword !== forceConfirmPassword && (
                      <span className="text-red-400 text-[10px] font-mono">Passwords do not match</span>
                    )}
                  </div>

                  <button type="submit" disabled={forceChangeLoading || forceNewPassword !== forceConfirmPassword} className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 font-bold rounded tracking-widest uppercase text-xs transition-all cursor-pointer shadow-lg">
                    {forceChangeLoading ? 'Saving...' : 'Set New Password'}
                  </button>
                </form>

                <div className="text-center">
                  <button onClick={() => { setAuthView('login'); setCurrentAdmin(null); setForceChangeError(''); }} className="text-zinc-500 hover:text-zinc-300 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 mx-auto">
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── RESET PASSWORD SCREEN (from email link) ─── */}
            {authView === 'reset-password' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 10 }}
                className="relative bg-zinc-900 border border-zinc-800/80 rounded p-8 md:p-10 w-full max-w-md shadow-2xl z-10 space-y-6"
              >
                <button onClick={onClose} className="absolute top-4 left-4 p-2 text-zinc-500 hover:text-white rounded hover:bg-zinc-800/40 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono uppercase">
                  <X className="w-3.5 h-3.5" /><span>Close</span>
                </button>

                <div className="text-center space-y-2 pt-4">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.35em] text-amber-500 uppercase font-semibold block">PASSWORD RESET</span>
                  <h3 className="font-serif text-3xl font-bold text-zinc-100">New Password</h3>
                  <p className="text-zinc-500 text-xs font-light">Choose a new secure password for your account.</p>
                </div>

                {resetError && <div className="p-3.5 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded text-center">{resetError}</div>}
                {resetMessage && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs rounded text-center">{resetMessage}</div>
                    <button onClick={() => { setAuthView('login'); setResetMessage(''); onClearResetToken?.(); }} className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold rounded tracking-widest uppercase text-xs transition-all cursor-pointer shadow-lg">
                      Go to Login
                    </button>
                  </div>
                )}

                {!resetMessage && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-mono text-[8px] text-zinc-500 tracking-widest uppercase block">New Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} placeholder="Create a strong password" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light pr-10" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-zinc-400 cursor-pointer">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <PasswordStrengthBar password={resetNewPassword} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-mono text-[8px] text-zinc-500 tracking-widest uppercase block">Confirm Password</label>
                      <input type="password" value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light" required />
                      {resetConfirmPassword && resetNewPassword !== resetConfirmPassword && (
                        <span className="text-red-400 text-[10px] font-mono">Passwords do not match</span>
                      )}
                    </div>

                    <button type="submit" disabled={resetLoading || resetNewPassword !== resetConfirmPassword} className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 font-bold rounded tracking-widest uppercase text-xs transition-all cursor-pointer shadow-lg">
                      {resetLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          /* ═══ ACTIVE FULL-SCREEN WORKSPACE ═══ */
          <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden">
            
            {/* LEFT BAR: MAIN DASHBOARD NAVIGATION */}
            <div className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between p-5 shrink-0 z-20 overflow-y-auto scrollbar-thin">
              <div className="space-y-6">
                {/* Brand Identifier */}
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                  <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-zinc-100 leading-none">Haven Registrar</h3>
                    <span className="font-mono text-[8px] tracking-[0.2em] text-amber-500 uppercase block mt-1">VALLEY LEDGER ACTIVE</span>
                  </div>
                </div>

                {/* Logged-in User Info */}
                {currentAdmin && (
                  <div className="p-3 bg-zinc-950 rounded border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-amber-500/10 rounded-full flex items-center justify-center">
                        <span className="text-amber-500 text-xs font-bold">{currentAdmin.fullName.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-200 font-medium truncate">{currentAdmin.fullName}</p>
                        <p className="text-[9px] text-zinc-500 font-mono truncate">{currentAdmin.email}</p>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider font-semibold ${
                      currentAdmin.role === 'PortalAdmin' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {currentAdmin.role === 'PortalAdmin' ? '👑 Portal Admin' : '🔑 Admin'}
                    </span>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-1.5">
                  {[
                    { tab: 'overview' as ActiveTab, icon: TrendingUp, label: 'Overview & Analytics' },
                    { tab: 'ledger' as ActiveTab, icon: Sliders, label: `Guest Registry (${bookings.length})` },
                    { tab: 'scheduler' as ActiveTab, icon: Calendar, label: 'Scheduler Timeline' },
                    { tab: 'create-booking' as ActiveTab, icon: Plus, label: 'Add Manual Booking' },
                  ].map(({ tab, icon: Icon, label }) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-3.5 py-2.5 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === tab ? 'bg-amber-600 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                      <Icon className="w-4 h-4" /><span>{label}</span>
                    </button>
                  ))}

                  {/* Admin Management (PortalAdmin Only) */}
                  {currentAdmin?.role === 'PortalAdmin' && (
                    <button onClick={() => setActiveTab('admin-management')} className={`w-full text-left px-3.5 py-2.5 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-2.5 transition-colors cursor-pointer ${activeTab === 'admin-management' ? 'bg-amber-600 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                      <Users className="w-4 h-4" /><span>Admin Management</span>
                    </button>
                  )}
                </nav>
              </div>

              {/* Sidebar bottom activities */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                {/* System Logs */}
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-[10px] font-mono text-zinc-500 h-28 overflow-y-auto space-y-1.5 scrollbar-thin">
                  <span className="text-zinc-600 block uppercase tracking-widest text-[8px] font-bold pb-1 border-b border-zinc-900">Live Session Log</span>
                  {systemLogs.map((log, index) => (<div key={index} className="leading-tight break-all font-light">{log}</div>))}
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => { setShowChangePassword(true); setChangeMessage(''); setChangeError(''); }} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-mono uppercase tracking-widest text-center cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                    <KeyRound className="w-3 h-3" /> Change Password
                  </button>
                  <button onClick={onClose} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-mono uppercase tracking-widest text-center cursor-pointer transition-colors">Return to Portal</button>
                  <button onClick={handleLogout} className="w-full py-2 bg-red-950/40 hover:bg-red-900/30 border border-red-900/20 text-red-400 hover:text-red-300 rounded text-xs font-mono uppercase tracking-widest text-center cursor-pointer transition-colors">Logout Staff</button>
                </div>
              </div>
            </div>

            {/* RIGHT WORKSPACE: DYNAMIC CONTENT */}
            <div className="flex-grow flex flex-col overflow-hidden bg-zinc-950">
              
              {/* Header Ribbon */}
              <header className="px-6 md:px-8 py-5 border-b border-zinc-800 bg-zinc-900 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
                <div>
                  <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase block font-semibold">KASHMIR MOUNTAIN SYSTEM / SANCTUARY ADMINISTRATION</span>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-zinc-100 mt-0.5">
                    {activeTab === 'overview' && 'Hearth Analytics Overview'}
                    {activeTab === 'ledger' && 'Guest Booking Ledger'}
                    {activeTab === 'scheduler' && 'Hearth Stay Grid Scheduler'}
                    {activeTab === 'create-booking' && 'Manual Check-in Setup'}
                    {activeTab === 'admin-management' && 'Administrator Management'}
                  </h2>
                </div>
                <div className="flex items-center gap-2.5">
                  <button onClick={handleCreateMockBooking} disabled={actionLoadingId === 'mock-creation'} className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-xs text-zinc-400 hover:text-white rounded transition-colors font-mono cursor-pointer" title="Generate virtual randomized stay logs">
                    <UserPlus className="w-3.5 h-3.5 text-amber-500" /><span>Simulate Guest Stay</span>
                  </button>
                  <button onClick={handleDownloadLedger} className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-xs text-zinc-400 hover:text-white rounded transition-colors font-mono cursor-pointer">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /><span>{csvSuccess ? 'CSV Saved' : 'Download Ledger CSV'}</span>
                  </button>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
                
                {actionError && (
                  <div className="p-4 bg-red-950/40 border border-red-500/25 text-red-400 text-xs rounded flex items-center gap-3">
                    <AlertCircle className="w-4 h-4" /><span>{actionError}</span>
                  </div>
                )}
                {createAdminMessage && (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/25 text-emerald-400 text-xs rounded flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4" /><span>{createAdminMessage}</span>
                  </div>
                )}

                {/* TAB: OVERVIEW & ANALYTICS */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-zinc-900 p-5 rounded border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">CUMULATIVE BOOKED REVENUE</span>
                        <div className="mt-2.5"><h4 className="font-serif text-3xl font-bold text-amber-400">₹{totalRevenue.toLocaleString('en-IN')}</h4><span className="text-[10px] text-zinc-500 block mt-1">Stoked stays revenue value</span></div>
                        <Activity className="w-10 h-10 text-zinc-800 absolute right-4 bottom-4 pointer-events-none" />
                      </div>
                      <div className="bg-zinc-900 p-5 rounded border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">ACTIVE RESERVATIONS</span>
                        <div className="mt-2.5"><h4 className="font-serif text-3xl font-bold text-zinc-100">{activeBookings.length}</h4><span className="text-[10px] text-zinc-500 block mt-1">{confirmedStaysCount} Confirmed, {pendingStaysCount} Pending</span></div>
                        <Calendar className="w-10 h-10 text-zinc-800 absolute right-4 bottom-4 pointer-events-none" />
                      </div>
                      <div className="bg-zinc-900 p-5 rounded border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">CURRENTLY CHECKED IN</span>
                        <div className="mt-2.5"><h4 className="font-serif text-3xl font-bold text-emerald-500">{activeStaysCount}</h4><span className="text-[10px] text-zinc-500 block mt-1">In-house guests warming at fireplace</span></div>
                        <CheckCircle2 className="w-10 h-10 text-zinc-800 absolute right-4 bottom-4 pointer-events-none" />
                      </div>
                      <div className="bg-zinc-900 p-5 rounded border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">AVERAGE TICKET SIZE</span>
                        <div className="mt-2.5"><h4 className="font-serif text-3xl font-bold text-zinc-100">₹{averageValue.toLocaleString('en-IN')}</h4><span className="text-[10px] text-zinc-500 block mt-1">Per active reservation stayed</span></div>
                        <Sliders className="w-10 h-10 text-zinc-800 absolute right-4 bottom-4 pointer-events-none" />
                      </div>
                    </div>

                    {/* Revenue Chart + Allocation */}
                    <div className="grid lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8 bg-zinc-900 p-6 rounded border border-zinc-800 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-800/40">
                          <div><h3 className="font-serif text-lg font-bold text-zinc-100">Monthly Revenue Pipeline</h3><p className="text-[11px] text-zinc-500 font-light">Interactive tracking of treasury value across summer bookings</p></div>
                          <span className="text-[10px] font-mono text-amber-500 border border-amber-500/10 px-2 py-0.5 rounded bg-amber-500/5 uppercase font-medium">₹ INR Treasury</span>
                        </div>
                        <div className="h-64 relative flex items-end pt-6">
                          <div className="absolute inset-0 flex flex-col justify-between text-[9px] font-mono text-zinc-600 pointer-events-none pb-8 pt-4">
                            <div className="border-b border-zinc-800/50 w-full text-right pr-2">₹2,00,000</div>
                            <div className="border-b border-zinc-800/50 w-full text-right pr-2">₹1,50,000</div>
                            <div className="border-b border-zinc-800/50 w-full text-right pr-2">₹1,00,000</div>
                            <div className="border-b border-zinc-800/50 w-full text-right pr-2">₹50,000</div>
                            <div className="w-full text-right pr-2">₹0</div>
                          </div>
                          <div className="w-full h-full flex justify-around items-end z-10 pl-16 pb-8 relative">
                            {[
                              { label: 'May Stays', val: Math.min(180000, totalRevenue * 0.3 + 45000), color: '#b45309' },
                              { label: 'June Stays', val: Math.min(220000, totalRevenue * 0.5 + 80000), color: '#d97706' },
                              { label: 'July Stays', val: totalRevenue, color: '#f59e0b' },
                              { label: 'Aug (Proj)', val: totalRevenue * 1.25 + 60000, color: '#10b981' }
                            ].map((col, idx) => {
                              const pct = Math.min(100, Math.max(12, (col.val / 220000) * 100));
                              return (
                                <div key={idx} className="flex flex-col items-center h-full justify-end w-20 group relative cursor-pointer">
                                  <div className="absolute -top-6 bg-zinc-950 text-[10px] font-mono px-2 py-1 border border-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-zinc-200 z-30">₹{Math.round(col.val).toLocaleString('en-IN')}</div>
                                  <div className="w-10 rounded-t transition-all duration-1000 group-hover:brightness-110 shadow-lg shadow-black/40" style={{ height: `${pct}%`, backgroundColor: col.color }} />
                                  <span className="font-mono text-[9px] text-zinc-500 mt-2.5 truncate max-w-full">{col.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-4 bg-zinc-900 p-6 rounded border border-zinc-800 space-y-4">
                        <h3 className="font-serif text-lg font-bold text-zinc-100 pb-2 border-b border-zinc-800/40">Sanctuary Allocation</h3>
                        <div className="space-y-4">
                          {[{ name: 'The Hearth Suite', id: 'hearth-suite', color: 'bg-amber-600' }, { name: 'The Valley View Cabin', id: 'valley-view-cabin', color: 'bg-amber-500' }].map(room => {
                            const count = bookings.filter(b => b.roomId === room.id && b.status !== 'cancelled').length;
                            return (
                              <div key={room.id} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs"><span className="font-serif font-medium text-zinc-200">{room.name}</span><span className="font-mono text-zinc-400">{count} stays</span></div>
                                <div className="w-full h-2 bg-zinc-950 rounded overflow-hidden"><div className={`h-full ${room.color} rounded transition-all duration-500`} style={{ width: `${Math.min(100, (count / Math.max(1, activeBookings.length)) * 100)}%` }} /></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: SCHEDULER */}
                {activeTab === 'scheduler' && (
                  <div className="bg-zinc-900 p-6 rounded border border-zinc-800 space-y-6">
                    <div className="space-y-1"><h3 className="font-serif text-xl font-bold text-zinc-100">Stay Planner (14-Day View)</h3><p className="text-xs text-zinc-500 font-light">Visual calendar mapping active stay allocations.</p></div>
                    <div className="overflow-x-auto">
                      <div className="min-w-[800px] border border-zinc-800 rounded bg-zinc-950">
                        <div className="grid grid-cols-15 border-b border-zinc-800 font-mono text-[9px] uppercase tracking-wider text-zinc-500 bg-zinc-900/35">
                          <div className="p-3.5 border-r border-zinc-800 font-semibold">Sanctuary Cabin</div>
                          {timelineDays.map((day, idx) => (<div key={idx} className="p-3.5 text-center border-r border-zinc-800/60 flex flex-col items-center"><span>{day.toLocaleDateString('en-US', { weekday: 'short' })}</span><span className="text-zinc-300 font-bold mt-0.5">{day.getDate()}</span></div>))}
                        </div>
                        {ROOMS.map((room) => (
                          <div key={room.id} className="grid grid-cols-15 border-b border-zinc-800/50">
                            <div className="p-4 border-r border-zinc-800 bg-zinc-900/10 flex flex-col justify-center"><span className="font-serif text-xs font-semibold text-zinc-200">{room.title}</span><span className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">₹{room.pricePerNight.toLocaleString('en-IN')}/N</span></div>
                            {timelineDays.map((day, idx) => {
                              const match = getBookingForDay(room.id, day);
                              return (
                                <div key={idx} className="p-2 border-r border-zinc-800/60 min-h-[70px] relative flex items-center justify-center bg-zinc-950/20">
                                  {match ? (
                                    <div className={`absolute inset-1 rounded px-2.5 py-1.5 flex flex-col justify-between overflow-hidden shadow text-[9px] font-mono leading-none border select-none ${match.status === 'checked-in' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/60 border-amber-500/30 text-amber-300'}`} title={`Guest: ${match.guestName} (${match.checkIn} to ${match.checkOut})`}>
                                      <span className="font-semibold truncate block">{match.guestName.split(' ')[0]}</span>
                                      <span className="text-[7px] text-zinc-500 truncate block mt-1 uppercase">{match.status}</span>
                                    </div>
                                  ) : (<span className="text-[9px] font-mono text-zinc-800 italic">-</span>)}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-500">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-950/60 border border-amber-500/30 block" /><span>Confirmed Booking</span></div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-950/60 border border-emerald-500/30 block" /><span>Checked In stay</span></div>
                    </div>
                  </div>
                )}

                {/* TAB: GUEST REGISTRY LEDGER */}
                {activeTab === 'ledger' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-12 gap-4 bg-zinc-900 p-4 rounded border border-zinc-800">
                      <div className="md:col-span-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search guests or ID..." className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded pl-9 pr-4 py-2 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none" /></div>
                      <div className="md:col-span-3 flex items-center gap-2"><span className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider whitespace-nowrap">Cabin:</span><select value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 focus:text-zinc-200 text-xs rounded px-2 py-1.5 cursor-pointer focus:outline-none"><option value="all">All Sanctuaries</option><option value="hearth-suite">The Hearth Suite</option><option value="valley-view-cabin">The Valley View Cabin</option></select></div>
                      <div className="md:col-span-3 flex items-center gap-2"><span className="font-mono text-[8px] text-zinc-500 uppercase tracking-wider whitespace-nowrap">State:</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 focus:text-zinc-200 text-xs rounded px-2 py-1.5 cursor-pointer focus:outline-none"><option value="all">All States</option><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="checked-in">Checked In</option><option value="cancelled">Cancelled</option></select></div>
                      <div className="md:col-span-2 flex items-center gap-2"><select value={sortBy} onChange={(e: any) => setSortBy(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-zinc-400 focus:text-zinc-200 text-xs rounded px-2 py-1.5 cursor-pointer focus:outline-none"><option value="date-desc">New Stays</option><option value="date-asc">Old Stays</option><option value="amount-desc">High Treasury</option><option value="name-asc">Name A-Z</option></select></div>
                    </div>
                    <div className="overflow-x-auto rounded border border-zinc-800 bg-zinc-900 shadow-xl">
                      <table className="w-full text-left border-collapse">
                        <thead><tr className="border-b border-zinc-800 font-mono text-[9px] text-zinc-500 uppercase tracking-wider bg-zinc-950/35"><th className="py-3.5 px-4 font-semibold">Voucher ID</th><th className="py-3.5 px-4 font-semibold">Guest & Contact</th><th className="py-3.5 px-4 font-semibold">Cabin Sanctuary</th><th className="py-3.5 px-4 font-semibold">Stay Dates</th><th className="py-3.5 px-4 font-semibold">Total Amount</th><th className="py-3.5 px-4 font-semibold text-center">Status</th><th className="py-3.5 px-4 font-semibold text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-zinc-950 font-sans text-xs">
                          {sortedBookings.length > 0 ? sortedBookings.map((book) => {
                            const isActionLoading = actionLoadingId === book.id;
                            return (
                              <tr key={book.id} className="hover:bg-zinc-800/40 transition-colors">
                                <td className="py-4 px-4 font-mono text-[10px] text-zinc-500">#{book.id.replace('booking-', '')}</td>
                                <td className="py-4 px-4"><div className="font-semibold text-zinc-200">{book.guestName}</div><div className="text-[10px] text-zinc-500 font-mono">{book.guestEmail}</div></td>
                                <td className="py-4 px-4 font-serif text-zinc-300">{book.roomTitle}</td>
                                <td className="py-4 px-4 font-mono text-[10px] text-zinc-400"><div>{book.checkIn}</div><div className="text-[9px] text-zinc-600">to {book.checkOut}</div></td>
                                <td className="py-4 px-4 font-semibold text-amber-400 font-serif text-sm">₹{book.amount.toLocaleString('en-IN')}</td>
                                <td className="py-4 px-4 text-center">
                                  <button onClick={() => handleCycleStatus(book)} disabled={isActionLoading} title="Cycle Status" className={`px-2.5 py-1 rounded text-[9px] font-mono font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-all ${book.status === 'confirmed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20' : ''} ${book.status === 'pending' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20' : ''} ${book.status === 'checked-in' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20' : ''} ${book.status === 'cancelled' ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20' : ''}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${book.status === 'confirmed' ? 'bg-emerald-500' : book.status === 'pending' ? 'bg-amber-500' : book.status === 'checked-in' ? 'bg-blue-500' : 'bg-red-500'}`} /><span>{book.status}</span>
                                  </button>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => startEditing(book)} className="p-1.5 text-zinc-500 hover:text-amber-500 rounded hover:bg-zinc-950 transition-colors cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDeleteBooking(book.id)} disabled={isActionLoading} className="p-1.5 text-zinc-600 hover:text-red-400 rounded hover:bg-red-950/20 transition-colors cursor-pointer">
                                      {isActionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-600" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }) : (<tr><td colSpan={7} className="py-12 text-center text-zinc-600 italic">No guest registrations found matching specified criteria.</td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB: MANUAL BOOKING */}
                {activeTab === 'create-booking' && (
                  <div className="bg-zinc-900 p-6 rounded border border-zinc-800 max-w-2xl mx-auto space-y-6">
                    <div className="space-y-1"><h3 className="font-serif text-xl font-bold text-zinc-100">Direct Offline Check-in Setup</h3><p className="text-xs text-zinc-500 font-light">Register direct guests into the sanctuary ledger system.</p></div>
                    <form onSubmit={handleManualBookingSubmit} className="space-y-4 text-sm">
                      <div className="space-y-1.5"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Assign Cabin Sanctuary</label><select value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded text-zinc-300 focus:border-amber-500/50 cursor-pointer focus:outline-none"><option value="hearth-suite">The Hearth Suite (₹24,500/night)</option><option value="valley-view-cabin">The Valley View Cabin (₹28,000/night)</option></select></div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Guest Full Name</label><input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Vikram Sen" className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none font-light" required /></div>
                        <div className="space-y-1.5"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Email Address</label><input type="email" value={newBEmail} onChange={(e) => setNewBEmail(e.target.value)} placeholder="e.g. vikram@sens.co.in" className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none font-light" required /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Check-in Date</label><input type="date" value={newCheckIn} onChange={(e) => setNewCheckIn(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none font-mono" required /></div>
                        <div className="space-y-1.5"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Check-out Date</label><input type="date" value={newCheckOut} onChange={(e) => setNewCheckOut(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none font-mono" required /></div>
                      </div>
                      <div className="space-y-1.5"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Custom Amount (INR) — Leave Blank to Auto-Calculate</label><input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Calculates automatically if blank" className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none font-light font-mono" /></div>
                      <button type="submit" disabled={actionLoadingId === 'manual-submit'} className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 font-bold uppercase tracking-wider text-xs rounded transition-colors cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-lg shadow-black/20">
                        {actionLoadingId === 'manual-submit' ? 'Logging reservation...' : 'Commit Stay to Ledger'}
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB: ADMIN MANAGEMENT (PortalAdmin Only) */}
                {activeTab === 'admin-management' && currentAdmin?.role === 'PortalAdmin' && (
                  <div className="space-y-6">
                    {/* Create Admin Button & Form */}
                    <div className="flex justify-between items-center">
                      <div><h3 className="font-serif text-xl font-bold text-zinc-100">System Administrators</h3><p className="text-xs text-zinc-500 font-light">Manage admin accounts and access permissions.</p></div>
                      <button onClick={() => { setShowCreateAdmin(!showCreateAdmin); setCreateAdminError(''); setCreateAdminMessage(''); }} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold rounded text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors shadow-lg">
                        <UserPlus className="w-3.5 h-3.5" /><span>{showCreateAdmin ? 'Cancel' : 'Create Admin'}</span>
                      </button>
                    </div>

                    {/* Create Admin Inline Form */}
                    <AnimatePresence>
                      {showCreateAdmin && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="bg-zinc-900 p-6 rounded border border-zinc-800 space-y-4">
                            <h4 className="font-serif text-lg font-bold text-zinc-100">New Administrator</h4>
                            {createAdminError && <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded">{createAdminError}</div>}
                            <form onSubmit={handleCreateAdmin} className="grid sm:grid-cols-3 gap-4">
                              <div className="space-y-1.5"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Full Name</label><input type="text" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} placeholder="John Doe" className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none text-sm" required /></div>
                              <div className="space-y-1.5"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Email Address</label><input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="admin@example.com" className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none text-sm" required /></div>
                              <div className="space-y-1.5"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Role</label><select value={newAdminRole} onChange={(e) => setNewAdminRole(e.target.value as any)} className="w-full bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 rounded text-zinc-300 focus:border-amber-500/50 cursor-pointer focus:outline-none text-sm"><option value="Admin">Admin</option><option value="PortalAdmin">Portal Admin</option></select></div>
                              <div className="sm:col-span-3">
                                <button type="submit" disabled={createAdminLoading} className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 font-bold rounded text-xs uppercase tracking-wider font-mono cursor-pointer transition-colors">
                                  {createAdminLoading ? 'Creating...' : 'Create & Send Credentials'}
                                </button>
                                <span className="text-[10px] text-zinc-500 ml-3">A temporary password will be emailed to the new admin.</span>
                              </div>
                            </form>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Admin Users Table */}
                    <div className="overflow-x-auto rounded border border-zinc-800 bg-zinc-900 shadow-xl">
                      {adminLoading ? (
                        <div className="p-12 text-center text-zinc-500"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /><span className="text-xs">Loading administrators...</span></div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead><tr className="border-b border-zinc-800 font-mono text-[9px] text-zinc-500 uppercase tracking-wider bg-zinc-950/35"><th className="py-3.5 px-4 font-semibold">Name</th><th className="py-3.5 px-4 font-semibold">Email</th><th className="py-3.5 px-4 font-semibold">Role</th><th className="py-3.5 px-4 font-semibold">Status</th><th className="py-3.5 px-4 font-semibold">Created</th><th className="py-3.5 px-4 font-semibold text-right">Actions</th></tr></thead>
                          <tbody className="divide-y divide-zinc-950 font-sans text-xs">
                            {adminUsers.map(admin => (
                              <tr key={admin.id} className="hover:bg-zinc-800/40 transition-colors">
                                <td className="py-4 px-4"><div className="font-semibold text-zinc-200">{admin.fullName}</div>{admin.isTempPassword && <span className="text-[9px] text-amber-500 font-mono">⏳ Temp password</span>}</td>
                                <td className="py-4 px-4 font-mono text-[11px] text-zinc-400">{admin.email}</td>
                                <td className="py-4 px-4"><span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-semibold ${admin.role === 'PortalAdmin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{admin.role === 'PortalAdmin' ? '👑 Portal Admin' : '🔑 Admin'}</span></td>
                                <td className="py-4 px-4"><span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-semibold ${admin.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{admin.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td className="py-4 px-4 font-mono text-[10px] text-zinc-500">{admin.createdTime ? new Date(admin.createdTime).toLocaleDateString() : '-'}</td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => startEditingAdmin(admin)} className="p-1.5 text-zinc-500 hover:text-amber-500 rounded hover:bg-zinc-950 transition-colors cursor-pointer"><Edit3 className="w-3.5 h-3.5" /></button>
                                    {admin.id !== currentAdmin?.id && (
                                      <button onClick={() => handleDeleteAdmin(admin.id)} className="p-1.5 text-zinc-600 hover:text-red-400 rounded hover:bg-red-950/20 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

              </main>

              {/* Status footer */}
              <footer className="px-6 md:px-8 py-3.5 border-t border-zinc-800 bg-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-500 shrink-0">
                <span>Registrar system • Logged in as {currentAdmin?.fullName || 'Unknown'}</span>
                <span>Active records: {filteredBookings.length} stay files</span>
              </footer>
            </div>

            {/* BOOKING EDIT MODAL */}
            <AnimatePresence>
              {editingBooking && (
                <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingBooking(null)} className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm" />
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="relative bg-zinc-900 border border-zinc-800/80 rounded shadow-2xl p-6 md:p-8 w-full max-w-md z-10 space-y-5">
                    <button onClick={() => setEditingBooking(null)} className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800/40 cursor-pointer"><X className="w-4 h-4" /></button>
                    <div className="space-y-1"><span className="font-mono text-[8px] text-amber-500 uppercase tracking-widest">RECORD MODIFICATION</span><h4 className="font-serif text-lg font-bold text-zinc-100">Edit Stay Parameters</h4><p className="text-[11px] text-zinc-500 leading-none">Ticket ID #{editingBooking.id.replace('booking-', '')}</p></div>
                    <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-sans">
                      <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Guest Name</label><input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none" required /></div>
                      <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Guest Email</label><input type="email" value={editBEmail} onChange={(e) => setEditBEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none" required /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Arrival</label><input type="date" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none font-mono" required /></div>
                        <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Departure</label><input type="date" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none font-mono" required /></div>
                      </div>
                      <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Stay Amount (₹ INR)</label><input type="number" value={editAmount} onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none font-mono" required /></div>
                      <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Status</label><select value={editStatus} onChange={(e: any) => setEditStatus(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-zinc-300 focus:border-amber-500/50 cursor-pointer focus:outline-none"><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="checked-in">Checked In</option><option value="cancelled">Cancelled</option></select></div>
                      <div className="pt-3.5 flex gap-2">
                        <button type="button" onClick={() => setEditingBooking(null)} className="flex-grow py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs uppercase tracking-widest font-mono cursor-pointer transition-colors">Cancel</button>
                        <button type="submit" disabled={actionLoadingId === editingBooking.id} className="flex-grow py-2.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold rounded text-xs uppercase tracking-widest font-mono cursor-pointer transition-colors">{actionLoadingId === editingBooking.id ? 'Saving...' : 'Save Record'}</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* EDIT ADMIN MODAL */}
            <AnimatePresence>
              {editingAdmin && (
                <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingAdmin(null)} className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm" />
                  <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="relative bg-zinc-900 border border-zinc-800/80 rounded shadow-2xl p-6 md:p-8 w-full max-w-md z-10 space-y-5">
                    <button onClick={() => setEditingAdmin(null)} className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800/40 cursor-pointer"><X className="w-4 h-4" /></button>
                    <div className="space-y-1"><span className="font-mono text-[8px] text-amber-500 uppercase tracking-widest">ADMIN MODIFICATION</span><h4 className="font-serif text-lg font-bold text-zinc-100">Edit Administrator</h4></div>
                    <form onSubmit={handleUpdateAdmin} className="space-y-3.5 text-xs font-sans">
                      <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Full Name</label><input type="text" value={editAdminName} onChange={(e) => setEditAdminName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none" required /></div>
                      <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Email</label><input type="email" value={editAdminEmail} onChange={(e) => setEditAdminEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-zinc-300 focus:border-amber-500/50 focus:outline-none" required /></div>
                      <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Role</label><select value={editAdminRole} onChange={(e) => setEditAdminRole(e.target.value as any)} className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded text-zinc-300 focus:border-amber-500/50 cursor-pointer focus:outline-none"><option value="Admin">Admin</option><option value="PortalAdmin">Portal Admin</option></select></div>
                      <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded border border-zinc-800">
                        <label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest">Account Active</label>
                        <button type="button" onClick={() => setEditAdminActive(!editAdminActive)} className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${editAdminActive ? 'bg-emerald-600' : 'bg-zinc-700'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${editAdminActive ? 'left-5.5' : 'left-0.5'}`} />
                        </button>
                        <span className={`text-[10px] font-mono ${editAdminActive ? 'text-emerald-400' : 'text-red-400'}`}>{editAdminActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="pt-3.5 flex gap-2">
                        <button type="button" onClick={() => setEditingAdmin(null)} className="flex-grow py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs uppercase tracking-widest font-mono cursor-pointer transition-colors">Cancel</button>
                        <button type="submit" className="flex-grow py-2.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold rounded text-xs uppercase tracking-widest font-mono cursor-pointer transition-colors">Save Changes</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* CHANGE PASSWORD MODAL */}
        <AnimatePresence>
          {showChangePassword && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-900 border border-zinc-800 rounded p-6 max-w-sm w-full shadow-2xl relative space-y-5">
                <button onClick={() => setShowChangePassword(false)} className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800/40 cursor-pointer"><X className="w-4 h-4" /></button>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto"><KeyRound className="w-5 h-5 text-amber-500" /></div>
                  <h3 className="font-serif text-xl font-bold text-zinc-100">Change Password</h3>
                </div>
                {changeError && <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded text-center">{changeError}</div>}
                {changeMessage && <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs rounded text-center">{changeMessage}</div>}
                <form onSubmit={handleChangePassword} className="space-y-3.5">
                  <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Current Password</label><input type="password" value={changeCurrentPassword} onChange={(e) => setChangeCurrentPassword(e.target.value)} placeholder="Your current password" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light" required /></div>
                  <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">New Password</label><input type="password" value={changeNewPassword} onChange={(e) => setChangeNewPassword(e.target.value)} placeholder="Create a strong password" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light" required /><PasswordStrengthBar password={changeNewPassword} /></div>
                  <div className="space-y-1"><label className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block">Confirm New Password</label><input type="password" value={changeConfirmPassword} onChange={(e) => setChangeConfirmPassword(e.target.value)} placeholder="Re-enter new password" className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded text-sm focus:outline-none text-zinc-200 font-light" required />{changeConfirmPassword && changeNewPassword !== changeConfirmPassword && <span className="text-red-400 text-[10px] font-mono">Passwords do not match</span>}</div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setShowChangePassword(false)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs uppercase tracking-widest font-mono cursor-pointer transition-colors">Cancel</button>
                    <button type="submit" disabled={changeLoading || changeNewPassword !== changeConfirmPassword} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 text-zinc-950 font-bold rounded text-xs uppercase tracking-widest font-mono cursor-pointer transition-colors">{changeLoading ? 'Saving...' : 'Update Password'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* LOGOUT CONFIRMATION MODAL */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-900 border border-zinc-800 rounded p-6 max-w-sm w-full shadow-2xl relative">
                <div className="flex justify-center mb-4"><div className="w-12 h-12 bg-red-950/30 border border-red-900/50 rounded-full flex items-center justify-center"><LogOut className="w-5 h-5 text-red-500" /></div></div>
                <h3 className="text-xl font-serif font-bold text-center text-zinc-100 mb-2">Confirm Logout</h3>
                <p className="text-center text-zinc-400 text-xs font-light mb-6">Are you sure you want to lock the staff portal? You will need your credentials to return.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs uppercase tracking-widest font-mono cursor-pointer transition-colors">Cancel</button>
                  <button onClick={confirmLogout} className="flex-1 py-2.5 bg-red-900/80 hover:bg-red-800 text-red-100 font-bold rounded text-xs uppercase tracking-widest font-mono cursor-pointer transition-colors">Logout</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* TOAST NOTIFICATIONS */}
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toastMessage && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className={`pointer-events-auto px-5 py-4 rounded shadow-2xl border flex items-start gap-3 ${toastMessage.type === 'error' ? 'bg-red-950 border-red-900/50 text-red-100' : 'bg-emerald-950 border-emerald-900/50 text-emerald-100'}`}>
                {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
                <div className="flex-1 pr-4">
                  <h4 className="text-sm font-bold font-serif mb-0.5">{toastMessage.title}</h4>
                  {toastMessage.desc && <p className="text-xs opacity-80 font-light">{toastMessage.desc}</p>}
                </div>
                <button onClick={() => setToastMessage(null)} className="opacity-50 hover:opacity-100 transition-opacity mt-0.5"><X className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatePresence>
  );
}
