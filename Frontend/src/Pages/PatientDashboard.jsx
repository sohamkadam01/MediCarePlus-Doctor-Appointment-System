// PatientDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  FlaskConical,
  User,
  Stethoscope,
  FileText,
  CalendarDays,
  UserRound,
  Bell,
  CreditCard,
  Settings,
  LogOut,
  Search,
  MapPin,
  Star,
  ChevronRight,
  Plus,
  Phone,
  Mail,
  Download,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Home,
  Menu,
  X,
  Droplet,
  Shield,
  Award,
  TrendingUp,
  Sun,
  Edit,
  DollarSign,
  ThumbsUp,
  Moon,
  Sparkles,
  CalendarCheck,
  Video,
  MessageCircle,
  Wallet,
  Pill,
  Thermometer,
  Users,
  Scissors,
  BookOpen,
  ArrowRight,
  MoreHorizontal,
  Check,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Microscope,
  Beaker
} from 'lucide-react';
import axios from 'axios';
import authService from '../services/AuthService';
import appointmentService from '../services/AppointmentService';
import patientVitalService from '../services/PatientVitalService';
import BookAppointmentModal from '../components/BookAppointmentModal';
import NewAppointmentModal from '../components/NewAppointmentModal';
import PatientChatbot from '../components/PatientChatbot';
import PatientVitalsDisplay from '../components/PatientVitalsDisplay';
import CityCareLabs from '../components/CityCareLabs';

// Constants
const API_BASE_URL = 'http://localhost:8080/api';
const MESSAGE_TIMEOUT = 3000;
const FEATURED_DOCTOR_IMAGES = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400&h=400',
];
const DASHBOARD_TESTS = [
  {
    id: 'test-cbc',
    name: 'Complete Blood Count (CBC)',
    price: 'Rs 499',
    turnaround: 'Same day results',
    labs: '12 verified labs',
    icon: Droplet
  },
  {
    id: 'test-bmp',
    name: 'Basic Metabolic Panel (BMP)',
    price: 'Rs 599',
    turnaround: 'Same day results',
    labs: '9 verified labs',
    icon: Activity
  },
  {
    id: 'test-lipid',
    name: 'Lipid Profile',
    price: 'Rs 699',
    turnaround: '24 hours',
    labs: '14 verified labs',
    icon: Heart
  },
  {
    id: 'test-thyroid',
    name: 'Thyroid Profile (T3, T4, TSH)',
    price: 'Rs 649',
    turnaround: '24 hours',
    labs: '10 verified labs',
    icon: Thermometer
  }
];
const INTRO_FEATURED_DOCTORS = [
  {
    id: 'intro-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    rating: 4.9,
    reviews: 124,
    experience: '15+ years',
    patients: '2.5k+',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200',
    available: true
  },
  {
    id: 'intro-2',
    name: 'Dr. Michael Chen',
    specialty: 'Pediatrician',
    rating: 4.8,
    reviews: 89,
    experience: '12+ years',
    patients: '1.8k+',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200',
    available: true
  },
  {
    id: 'intro-3',
    name: 'Dr. Elena Rodriguez',
    specialty: 'Neurologist',
    rating: 5.0,
    reviews: 56,
    experience: '10+ years',
    patients: '1.2k+',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200',
    available: false
  },
  {
    id: 'intro-4',
    name: 'Dr. James Wilson',
    specialty: 'Dermatologist',
    rating: 4.9,
    reviews: 92,
    experience: '14+ years',
    patients: '2.1k+',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200',
    available: true
  }
];

const getFallbackDoctorImage = (doctor, fallbackSeed = 0) => {
  const preferredImage =
    doctor?.image ||
    doctor?.profileImage ||
    doctor?.avatar ||
    doctor?.photoUrl ||
    doctor?.photo_url;
  if (preferredImage) return preferredImage;

  const seed = String(doctor?.id ?? doctor?.name ?? fallbackSeed);
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FEATURED_DOCTOR_IMAGES[hash % FEATURED_DOCTOR_IMAGES.length];
};

const hasAppointmentReview = (appointment) => {
  const hasRating =
    appointment?.rating !== null &&
    appointment?.rating !== undefined &&
    Number(appointment.rating) >= 1 &&
    Number(appointment.rating) <= 5;
  const hasFeedback = String(appointment?.feedback || '').trim().length > 0;
  return hasRating || hasFeedback;
};

// Modern color palette
const COLORS = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  secondary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

// Typography classes
const TYPOGRAPHY = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-lg font-semibold',
  body: 'text-base',
  small: 'text-sm',
  xs: 'text-xs',
  caption: 'text-xs text-gray-500',
};

// Animation classes
const ANIMATIONS = {
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',
  slideInRight: 'animate-slideInRight',
  slideInLeft: 'animate-slideInLeft',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
};

// Modern Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = 'primary', trend, onClick }) => {
  const colorClasses = {
    primary: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600',
      light: 'bg-indigo-100',
    },
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      gradient: 'from-emerald-500 to-emerald-600',
      light: 'bg-emerald-100',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      gradient: 'from-amber-500 to-amber-600',
      light: 'bg-amber-100',
    },
    error: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      gradient: 'from-rose-500 to-rose-600',
      light: 'bg-rose-100',
    },
  };

  const classes = colorClasses[color] || colorClasses.primary;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-gray-200 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className={TYPOGRAPHY.caption + ' mb-1'}>{label}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {trend && (
            <p className="flex items-center gap-1 text-xs text-emerald-600 mt-2">
              <TrendingUp size={14} />
              <span>{trend} from last month</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${classes.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${classes.text}`} />
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

// Modern Doctor Card Component
const DoctorCard = ({ doctor, onBook, onToggleCompare, isCompared, disableCompare }) => {
  const [isHovered, setIsHovered] = useState(false);
  const doctorImage = getFallbackDoctorImage(doctor);

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={doctorImage}
                alt={`Dr. ${doctor.name}`}
                className="w-16 h-16 rounded-xl object-cover shadow-lg shadow-indigo-200 border border-indigo-100"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                Dr. {doctor.name}
              </h3>
              <p className="text-sm text-indigo-600 font-medium mt-0.5">{doctor.specialization}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-gray-700">
                  {Number(doctor.rating || 0).toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">({Number(doctor.totalReviews || 0)} reviews)</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare?.(doctor);
            }}
            disabled={!isCompared && disableCompare}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              isCompared
                ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700'
            } disabled:opacity-50`}
          >
            {isCompared ? 'Compared' : 'Compare'}
          </button>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 py-4 border-y border-gray-100">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-indigo-500" />
            <div>
              <p className={TYPOGRAPHY.xs + ' text-gray-500'}>Experience</p>
              <p className="text-sm font-medium text-gray-900">{doctor.experience} years</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp size={16} className="text-emerald-500" />
            <div>
              <p className={TYPOGRAPHY.xs + ' text-gray-500'}>Satisfaction</p>
              <p className="text-sm font-medium text-gray-900">98%</p>
            </div>
          </div>
        </div>

        {/* Location & Fee */}
        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2">{doctor.clinicAddress || 'Address not available'}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={TYPOGRAPHY.xs + ' text-gray-500'}>Consultation Fee</p>
              <p className="text-xl font-bold text-gray-900 tracking-tight">
                ₹{doctor.fee ?? doctor.consultationFee ?? 'N/A'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBook(doctor);
              }}
              className="relative px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all duration-300 overflow-hidden group/btn"
            >
              <span className="relative z-10">Book Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick action overlay removed */}
    </div>
  );
};

// Modern Appointment Card Component with 3-dots menu
const EnhancedAppointmentCard = ({ appointment, type, onUpdate, onRebook, onCancel, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const menuRef = useRef(null);
  const isLab = appointment?.appointmentType === 'LAB';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const hasReview = () => {
    return (appointment.rating !== null && appointment.rating !== undefined && Number(appointment.rating) >= 1 && Number(appointment.rating) <= 5) ||
           (appointment.feedback && appointment.feedback.trim().length > 0);
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || submittingReview) return;
    try {
      setSubmittingReview(true);
      setReviewError('');
      await appointmentService.addFeedback(
        appointment.id,
        reviewRating,
        (reviewText || '').trim()
      );
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewText('');
      onUpdate?.();
    } catch (error) {
      const message = error?.response?.data?.error || error?.response?.data?.message || 'Failed to submit review.';
      setReviewError(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleGetDirections = () => {
    setShowMenu(false);
    const address = appointment.doctor?.clinicAddress || appointment.clinicAddress;
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      // Check if on iOS device for better mobile experience
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        window.open(`http://maps.apple.com/?daddr=${encodedAddress}&dirflg=d`, '_blank');
      } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`, '_blank');
      }
    }
  };

  const handleDownloadPrescription = () => {
    setShowMenu(false);
    if (!appointment.prescription) {
      alert('No prescription available');
      return;
    }
    
    // Create prescription text
    const prescriptionText = `
MEDICARE PLUS - PRESCRIPTION
============================
Appointment ID: ${appointment.id}
Date: ${appointment.appointmentDate}
Doctor: Dr. ${appointment.doctor?.name || appointment.doctorName}
Patient: ${appointment.patientName || 'Patient'}

PRESCRIPTION:
${appointment.prescription}

${appointment.diagnosis ? `\nDIAGNOSIS:\n${appointment.diagnosis}` : ''}
${appointment.notes ? `\nNOTES:\n${appointment.notes}` : ''}

Generated on: ${new Date().toLocaleString()}
    `;
    
    const blob = new Blob([prescriptionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${appointment.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusConfig = {
    CONFIRMED: {
      color: 'success',
      icon: CheckCircle,
      label: 'Confirmed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    PENDING: {
      color: 'warning',
      icon: Clock,
      label: 'Pending',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    CANCELLED: {
      color: 'error',
      icon: XCircle,
      label: 'Cancelled',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
    COMPLETED: {
      color: 'primary',
      icon: CheckCircle,
      label: 'Completed',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    CHECKED_IN: {
      color: 'warning',
      icon: Clock,
      label: 'Checked In',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    IN_PROGRESS: {
      color: 'warning',
      icon: Clock,
      label: 'In Progress',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
  };

  const normalizedStatus = String(appointment.status || 'PENDING').toUpperCase();
  const canCancel = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(normalizedStatus);
  const status = statusConfig[appointment.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <>
      <div
        className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-visible"
      >
        <div className="p-5 overflow-visible">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Date badge */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {new Date(appointment.appointmentDate).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold leading-none mt-1">
                    {new Date(appointment.appointmentDate).getDate()}
                  </span>
                </div>
                <div className={`absolute -top-2 -right-2 w-6 h-6 ${status.bg} rounded-full border-2 border-white flex items-center justify-center`}>
                  <StatusIcon size={12} className={status.text} />
                </div>
              </div>

              {/* Details */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-900">
                    {isLab
                      ? `Lab: ${appointment.labName || appointment.doctorName || 'Lab'}`
                      : `Dr. ${appointment.doctor?.name || appointment.doctorName}`}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text} ${status.border}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-indigo-600 mt-0.5">
                  {isLab ? (appointment.testName || appointment.specialization || 'Lab Test') : appointment.specialization}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{appointment.appointmentTime}</span>
                  </div>
                  {appointment.visitType && (
                    <div className="flex items-center gap-1.5">
                      <Activity size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 capitalize">
                        {appointment.visitType.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3-dots menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative z-10"
              >
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  {/* Backdrop for closing on outside click */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMenu(false)}
                  />
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-slideDown">
                    <div className="py-2 max-h-96 overflow-y-auto">
                      {/* View Details */}
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onViewDetails(appointment);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FileText size={16} className="text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">View Details</p>
                          <p className="text-xs text-gray-400">See complete appointment info</p>
                        </div>
                      </button>

                      {/* Cancel Appointment (for upcoming) */}
                      {type === 'upcoming' && canCancel && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onCancel?.(appointment);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                            <XCircle size={16} className="text-rose-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Cancel Appointment</p>
                            <p className="text-xs text-rose-400">Cancel this booking</p>
                          </div>
                        </button>
                      )}
                      
                      {/* Book Again (for past) */}
                      {type === 'past' && !isLab && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onRebook(appointment);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Calendar size={16} className="text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Book Again</p>
                            <p className="text-xs text-emerald-400">Schedule a follow-up</p>
                          </div>
                        </button>
                      )}
                      
                      {/* Add Review (for completed) */}
                      {type === 'past' && !isLab &&
                        String(appointment.status || '').toUpperCase() === 'COMPLETED' &&
                        !hasReview() && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowReviewModal(true);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <Star size={16} className="text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Add Review</p>
                            <p className="text-xs text-amber-400">Share your experience</p>
                          </div>
                        </button>
                      )}
                      
                      {/* Download Prescription */}
                      {!isLab && appointment.prescription && (
                        <button
                          onClick={handleDownloadPrescription}
                          className="w-full px-4 py-3 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Download size={16} className="text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Download Prescription</p>
                            <p className="text-xs text-blue-400">Save prescription as text</p>
                          </div>
                        </button>
                      )}
                      
                      {/* Get Directions */}
                      {(appointment.doctor?.clinicAddress || appointment.clinicAddress) && (
                        <button
                          onClick={handleGetDirections}
                          className="w-full px-4 py-3 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <MapPin size={16} className="text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Get Directions</p>
                            <p className="text-xs text-gray-400">Navigate to clinic</p>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Menu Footer */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs text-gray-400 text-center">
                        Appointment #{appointment.id}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick summary section */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                {appointment.reason && (
                  <span className="text-gray-600">
                    <span className="text-gray-400">Reason:</span> {appointment.reason}
                  </span>
                )}
                {appointment.consultationFee && (
                  <span className="text-gray-900 font-medium">
                    ₹{appointment.consultationFee}
                  </span>
                )}
              </div>
              
              {/* Quick action chips */}
              <div className="flex items-center gap-2">
                {(appointment.doctor?.clinicAddress || appointment.clinicAddress) && (
                  <button
                    onClick={handleGetDirections}
                    className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors group"
                    title="Get Directions"
                  >
                    <MapPin size={14} className="text-gray-400 group-hover:text-indigo-600" />
                  </button>
                )}
                <button
                  onClick={() => onViewDetails(appointment)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Review Dr. {appointment.doctor?.name || appointment.doctorName}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Share your experience from this completed appointment.
            </p>

            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setReviewRating(value)}
                  className="p-1 rounded hover:bg-amber-50 transition-colors"
                >
                  <Star
                    size={28}
                    className={reviewRating >= value ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none"
              placeholder="Write your review (optional)"
            />

            {reviewError && (
              <p className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                {reviewError}
              </p>
            )}

            <div className="mt-5 flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewError('');
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview || reviewRating === 0}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const CompactUpcomingCard = ({ appointment, onOpen, onCancel }) => {
  const doctorName = appointment.doctor?.name || appointment.doctorName || 'Doctor';
  const visitType = appointment.visitType
    ? appointment.visitType.toLowerCase().replace('_', ' ')
    : 'consultation';
  const fee = appointment.consultationFee ?? appointment.fee;

  const statusClasses = {
    CONFIRMED: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
    COMPLETED: 'bg-indigo-100 text-indigo-700'
  };

  const statusLabel = appointment.status || 'PENDING';

  return (
    <div className="rounded-xl border border-gray-100 bg-gradient-to-r from-white to-indigo-50/40 p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">Dr. {doctorName}</p>
          <p className="text-sm text-indigo-600 truncate">{appointment.specialization || 'General Medicine'}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusClasses[statusLabel] || statusClasses.PENDING}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <CalendarCheck size={14} className="text-indigo-500" />
          <span className="truncate">{appointment.appointmentDate}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Clock size={14} className="text-indigo-500" />
          <span className="truncate">{appointment.appointmentTime || 'TBD'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Activity size={14} className="text-indigo-500" />
          <span className="capitalize truncate">{visitType}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">
          {fee ? `₹${fee}` : 'Fee at clinic'}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpen}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            View Details
          </button>
          {(String(appointment.status || '').toUpperCase() === 'PENDING' ||
            String(appointment.status || '').toUpperCase() === 'CONFIRMED') && (
            <button
              onClick={() => onCancel?.(appointment)}
              className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-xs font-medium hover:bg-rose-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CompactRecentActivityCard = ({ appointment, onOpen, onRebook }) => {
  const doctorName = appointment.doctor?.name || appointment.doctorName || 'Doctor';
  const status = appointment.status || 'COMPLETED';
  const statusClasses = {
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-indigo-100 text-indigo-700'
  };

  const summary = (appointment.diagnosis || appointment.prescription || '').trim();

  return (
    <div className="relative pl-5">
      <span className="absolute left-0 top-5 h-2.5 w-2.5 rounded-full bg-indigo-500" />
      <span className="absolute left-1 top-7 bottom-0 w-px bg-indigo-100" />

      <div className="rounded-xl border border-gray-100 bg-white p-4 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Dr. {doctorName}</p>
            <p className="text-xs text-indigo-600 truncate">{appointment.specialization || 'General Medicine'}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <CalendarCheck size={13} className="text-indigo-500" />
            {appointment.appointmentDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-indigo-500" />
            {appointment.appointmentTime || 'TBD'}
          </span>
          <span className="font-semibold text-gray-800">
            ₹{Number(appointment.consultationFee || 0).toFixed(2)}
          </span>
        </div>

        {summary && (
          <p className="mt-2 text-xs text-gray-600 line-clamp-2">
            {summary}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onOpen}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            View
          </button>
          {status === 'COMPLETED' && (
            <button
              onClick={onRebook}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
            >
              Book Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Modern Notification Item
const NotificationItem = ({ notification, onMarkRead }) => {
  const [isRead, setIsRead] = useState(notification.read);

  const handleClick = () => {
    if (!isRead) {
      setIsRead(true);
      onMarkRead?.(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer group ${
        isRead ? 'bg-white hover:bg-gray-50' : 'bg-indigo-50 hover:bg-indigo-100'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isRead ? 'bg-gray-100' : 'bg-indigo-100'
        }`}>
          <Bell className={`w-5 h-5 ${isRead ? 'text-gray-500' : 'text-indigo-600'}`} />
        </div>
        {!isRead && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
          {notification.message}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400">{notification.time}</span>
          {notification.type && (
            <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">
              {notification.type}
            </span>
          )}
        </div>
      </div>

      {!isRead && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-indigo-200 rounded-full">
            <Check size={14} className="text-indigo-600" />
          </button>
        </div>
      )}
    </div>
  );
};

// Modern Quick Action Card
const QuickActionCard = ({ icon: Icon, title, description, onClick, color = 'primary', stats }) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorConfigs = {
    primary: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-100',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      gradient: 'from-blue-600 to-blue-700',
      light: 'bg-blue-50'
    },
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      hover: 'hover:bg-emerald-100',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      gradient: 'from-emerald-600 to-emerald-700',
      light: 'bg-emerald-50'
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      hover: 'hover:bg-amber-100',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      gradient: 'from-amber-600 to-amber-700',
      light: 'bg-amber-50'
    },
    error: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      hover: 'hover:bg-rose-100',
      border: 'border-rose-200',
      iconBg: 'bg-rose-100',
      gradient: 'from-rose-600 to-rose-700',
      light: 'bg-rose-50'
    }
  };

  const config = colorConfigs[color] || colorConfigs.primary;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-xl border border-gray-200 p-5 text-left transition-all duration-200 hover:shadow-md hover:border-gray-300 w-full overflow-hidden"
    >
      {/* Animated background pattern on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${config.bg}`}>
        <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full bg-white/30 transform group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-white/30 transform group-hover:scale-150 transition-transform duration-700 delay-100" />
      </div>

      {/* Content */}
      <div className="relative">
        {/* Icon with animated background */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-sm`}>
            <Icon size={20} className={config.text} />
          </div>
          
          {/* Stats badge (if provided) */}
          {stats && (
            <span className={`text-[10px] px-2 py-1 rounded-full ${config.bg} ${config.text} font-medium`}>
              {stats}
            </span>
          )}
        </div>

        {/* Title and description */}
        <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-900 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          {description}
        </p>

        {/* Progress indicator (optional) */}
        {stats && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${config.bg} rounded-full transition-all duration-500`}
                style={{ width: isHovered ? '100%' : '0%' }}
              />
            </div>
            <span className={`text-[10px] ${config.text} font-medium opacity-0 group-hover:opacity-100 transition-opacity`}>
              Get started →
            </span>
          </div>
        )}

        {/* Action indicator (always visible) */}
        {!stats && (
          <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
            <span>Get started</span>
            <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>

      {/* Bottom border accent on hover */}
      <div className={`absolute bottom-0 left-0 w-full h-0.5 ${config.bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </button>
  );
};

// Modern Profile Card
const ProfileCard = ({ user, patientDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover with animated gradient */}
      <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        <div
          className={`absolute inset-0 bg-gradient-to-r from-indigo-400/50 to-transparent transform ${
            isHovered ? 'translate-x-full' : '-translate-x-full'
          } transition-transform duration-1000`}
        />
        
        {/* Profile image */}
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl">
              {user?.name?.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-14 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">Patient ID: {user?.id}</p>
          </div>
          <button className="p-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
            <Edit size={18} className="text-indigo-600" />
          </button>
        </div>

        {/* Contact info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-indigo-600" />
            </div>
            <span className="text-gray-600">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Phone size={16} className="text-indigo-600" />
            </div>
            <span className="text-gray-600">{user?.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Droplet size={16} className="text-indigo-600" />
            </div>
            <span className="text-gray-600">Blood Group: {patientDetails?.bloodGroup || 'Not specified'}</span>
          </div>
        </div>

        {/* Health stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className={TYPOGRAPHY.xs + ' text-gray-500'}>Age</p>
            <p className="text-lg font-bold text-gray-900">28</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className={TYPOGRAPHY.xs + ' text-gray-500'}>Weight</p>
            <p className="text-lg font-bold text-gray-900">65 kg</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className={TYPOGRAPHY.xs + ' text-gray-500'}>Height</p>
            <p className="text-lg font-bold text-gray-900">5'8"</p>
          </div>
        </div>

      </div>
    </div>
  );
};

// Main PatientDashboard Component
const PatientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [appointments, setAppointments] = useState({
    upcoming: [],
    past: []
  });
  const [doctors, setDoctors] = useState([]);
  const [allSpecializations, setAllSpecializations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [showBookModal, setShowBookModal] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingPrefill, setBookingPrefill] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sharedLabReports, setSharedLabReports] = useState([]);
  const [messageThreads, setMessageThreads] = useState([]);
  const [selectedMessageThreadId, setSelectedMessageThreadId] = useState('');
  const [threadMessagesById, setThreadMessagesById] = useState({});
  const [messageDraft, setMessageDraft] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  const [messageThreadsLoading, setMessageThreadsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingByThread, setTypingByThread] = useState({});
  const [onlineByUserId, setOnlineByUserId] = useState({});
  const [patientVitals, setPatientVitals] = useState([]);
  const [patientVitalsLoading, setPatientVitalsLoading] = useState(false);
  const [patientVitalsError, setPatientVitalsError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [doctorShowcaseTab, setDoctorShowcaseTab] = useState('all');
  const [selectedCompareDoctorIds, setSelectedCompareDoctorIds] = useState([]);
  const [showUpcomingDetailsModal, setShowUpcomingDetailsModal] = useState(false);
  const [selectedUpcomingAppointment, setSelectedUpcomingAppointment] = useState(null);
  const [showAutoReviewModal, setShowAutoReviewModal] = useState(false);
  const [autoReviewAppointment, setAutoReviewAppointment] = useState(null);
  const [autoReviewRating, setAutoReviewRating] = useState(0);
  const [autoReviewText, setAutoReviewText] = useState('');
  const [autoReviewSubmitting, setAutoReviewSubmitting] = useState(false);
  const [autoReviewError, setAutoReviewError] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const messageSocketRef = useRef(null);
  const typingStopTimerRef = useRef(null);
  const typingThreadRef = useRef(null);
  const promptedReviewIdsRef = useRef(new Set());

  const token = localStorage.getItem('token');
  const axiosConfig = useMemo(() => ({
    headers: { 'Authorization': `Bearer ${token}` }
  }), [token]);

  const loadSharedLabReports = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sharedLabReports') || '[]');
      const userEmail = String(user?.email || patientDetails?.email || '').toLowerCase();
      const userId = user?.id || patientDetails?.id;
      const userName = String(user?.name || patientDetails?.fullName || '').toLowerCase();
      const filtered = stored.filter((report) => {
        if (userId && String(report.patientId || '') === String(userId)) return true;
        if (userEmail && String(report.patientEmail || '').toLowerCase() === userEmail) return true;
        if (userName && String(report.patientName || '').toLowerCase() === userName) return true;
        return false;
      });
      setSharedLabReports(filtered);
    } catch (error) {
      setSharedLabReports([]);
    }
  }, [user, patientDetails]);

  const handleOpenSharedReport = useCallback((report) => {
    if (!report?.fileDataUrl) return;
    window.open(report.fileDataUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const handleDownloadSharedReport = useCallback((report) => {
    if (!report?.fileDataUrl) return;
    const a = document.createElement('a');
    a.href = report.fileDataUrl;
    a.download = report.fileName || 'lab-report.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  useEffect(() => {
    if (location.pathname === '/patient/book') {
      setActiveTab('appointments');
      setShowNewAppointmentModal(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (activeTab === 'records') {
      loadSharedLabReports();
    }
  }, [activeTab, loadSharedLabReports]);

  // Helper Functions
  const showTemporaryMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), MESSAGE_TIMEOUT);
  };

  const normalizeDoctor = useCallback((doctor, details, specializationName, reviewSummary) => {
    const feeValue = details?.consultation_fee ?? details?.consultationFee ?? null;
    const averageRating = Number(reviewSummary?.averageRating ?? doctor?.rating ?? 0);
    const totalReviews = Number(reviewSummary?.totalReviews ?? doctor?.totalReviews ?? 0);
    return {
      ...doctor,
      specialization: specializationName || 'General Medicine',
      experience: details?.experienceYear ?? details?.experience_year ?? details?.experience ?? 0,
      clinicAddress: details?.clinicAddress ?? details?.clinic_address ?? '',
      fee: feeValue,
      consultationFee: feeValue,
      rating: Number.isFinite(averageRating) ? averageRating : 0,
      totalReviews: Number.isFinite(totalReviews) ? totalReviews : 0,
      image: getFallbackDoctorImage(doctor)
    };
  }, []);

  // Data Fetching
  const fetchDoctors = useCallback(async () => {
    try {
      const [doctorsDetailsRes, specializationsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/doctors/details`, axiosConfig),
        axios.get(`${API_BASE_URL}/specializations`, axiosConfig).catch(() => ({ data: [] }))
      ]);

      const specializationNames = (specializationsRes.data || [])
        .map((spec) => spec?.name)
        .filter(Boolean);
      setAllSpecializations([...new Set(specializationNames)].sort((a, b) => a.localeCompare(b)));

      const doctorsWithDetails = Array.isArray(doctorsDetailsRes?.data) ? doctorsDetailsRes.data : [];
      const normalizedDoctorsRaw = doctorsWithDetails
        .filter((doctor) => doctor?.status === 'ACTIVE' && doctor?.approved === true)
        .map((doctor) => ({
          ...doctor,
          specialization: doctor?.specialization || 'General Medicine',
          experience: doctor?.experience ?? 0,
          clinicAddress: doctor?.clinicAddress || '',
          consultationFee: doctor?.consultationFee ?? null,
          fee: doctor?.consultationFee ?? null,
          rating: 0,
          totalReviews: 0,
          image: getFallbackDoctorImage(doctor)
        }));

      const normalizedDoctors = await Promise.all(
        normalizedDoctorsRaw.map(async (doctor) => {
          try {
            const summary = await appointmentService.getDoctorReviewSummary(doctor.id);
            return {
              ...doctor,
              rating: Number(summary?.averageRating || 0),
              totalReviews: Number(summary?.totalReviews || 0)
            };
          } catch (error) {
            return doctor;
          }
        })
      );

      if (normalizedDoctors.length > 0) {
        return normalizedDoctors;
      }

      // Fallback path in case aggregated endpoint is empty/unavailable.
      const doctorsRes = await axios.get(`${API_BASE_URL}/users/role/DOCTOR`, axiosConfig);
      const doctors = doctorsRes.data || [];
      const doctorDetails = await Promise.all(
        doctors.map((doctor) =>
          axios
            .get(`${API_BASE_URL}/doctors/details/${doctor.id}`, axiosConfig)
            .then((res) => ({ doctorId: doctor.id, details: res.data }))
            .catch(() => ({ doctorId: doctor.id, details: null }))
        )
      );
      const detailsMap = new Map(doctorDetails.map((entry) => [entry.doctorId, entry.details]));
      const doctorsWithReviews = await Promise.all(
        doctors.map(async (doctor) => {
          try {
            const summary = await appointmentService.getDoctorReviewSummary(doctor.id);
            return normalizeDoctor(doctor, detailsMap.get(doctor.id), null, summary);
          } catch (error) {
            return normalizeDoctor(doctor, detailsMap.get(doctor.id), null, null);
          }
        })
      );
      return doctorsWithReviews
        .filter((doctor) => doctor.status === 'ACTIVE' && detailsMap.get(doctor.id)?.approved === true);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  }, [axiosConfig, normalizeDoctor]);

  const fetchPatientDetails = useCallback(async (currentUser) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/patient-details/user/${currentUser.id}`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }, [axiosConfig]);

  const fetchPatientVitals = useCallback(async (currentUser) => {
    if (!currentUser?.id) return [];
    setPatientVitalsLoading(true);
    setPatientVitalsError('');
    try {
      const vitals = await patientVitalService.getPatientVitals(currentUser.id);
      const normalized = Array.isArray(vitals) ? vitals : [];
      const sorted = [...normalized].sort((a, b) => {
        const da = new Date(a?.recordedAt || 0);
        const db = new Date(b?.recordedAt || 0);
        return db - da;
      });
      setPatientVitals(sorted);
      return sorted;
    } catch (error) {
      setPatientVitals([]);
      setPatientVitalsError('Unable to load vitals right now.');
      return [];
    } finally {
      setPatientVitalsLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const [upcoming, past, labAppointments] = await Promise.all([
        appointmentService.getUpcomingAppointments().catch(() => []),
        appointmentService.getPastAppointments().catch(() => []),
        appointmentService.getPatientLabAppointments().catch(() => [])
      ]);
      const normalizedLabAppointments = Array.isArray(labAppointments) ? labAppointments : [];
      const upcomingLab = normalizedLabAppointments.filter((appointment) => {
        const status = String(appointment?.status || '').toUpperCase();
        return status !== 'COMPLETED' && status !== 'CANCELLED';
      });
      const pastLab = normalizedLabAppointments.filter((appointment) => {
        const status = String(appointment?.status || '').toUpperCase();
        return status === 'COMPLETED' || status === 'CANCELLED';
      });
      const grouped = {
        upcoming: [...(upcoming || []), ...upcomingLab],
        past: [...(past || []), ...pastLab]
      };
      setAppointments(grouped);
      return grouped;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const fallback = { upcoming: [], past: [] };
      setAppointments(fallback);
      return fallback;
    }
  }, []);

  const buildApprovalNotifications = useCallback((appointmentData) => {
    const upcomingAppointments = appointmentData?.upcoming || [];
    return upcomingAppointments
      .filter((app) => app?.appointmentType !== 'LAB')
      .filter((app) => app.status === 'CONFIRMED')
      .slice(0, 5)
      .map((app) => {
        const doctorName = app.doctor?.name || app.doctorName || 'Doctor';
        return {
          id: `approved-${app.id}`,
          message: `Dr. ${doctorName} approved your appointment for ${app.appointmentDate} at ${app.appointmentTime}.`,
          time: 'Recently',
          read: false,
          type: 'Appointment'
        };
      });
  }, []);

  const formatVitalDate = useCallback((value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const fetchDashboardData = useCallback(async (currentUser) => {
    setLoading(true);
    try {
      const [
        patientData,
        appointmentData,
        doctorData,
        vitalsData
      ] = await Promise.all([
        fetchPatientDetails(currentUser),
        fetchAppointments(),
        fetchDoctors(),
        fetchPatientVitals(currentUser)
      ]);

      setPatientDetails(patientData);
      setAppointments(appointmentData);
      setDoctors(doctorData);
      setPatientVitals(vitalsData);
      setNotifications(buildApprovalNotifications(appointmentData));
      // Temporary: message threads are loaded in a dedicated effect after user init.

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchPatientDetails, fetchAppointments, fetchDoctors, fetchPatientVitals, buildApprovalNotifications]);

  const fetchPatientMessageThreads = useCallback(async () => {
    try {
      setMessageThreadsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/messages/patient/threads`, axiosConfig);
      setMessageThreads(res?.data || []);
    } catch (error) {
      setMessageThreads([]);
    } finally {
      setMessageThreadsLoading(false);
    }
  }, [axiosConfig]);

  // Effects
  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData || userData.role !== 'PATIENT') {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchDashboardData(userData);
  }, [navigate, fetchDashboardData]);

  useEffect(() => {
    if (!user) return undefined;

    const intervalId = window.setInterval(async () => {
      const latestAppointments = await fetchAppointments();
      setNotifications(buildApprovalNotifications(latestAppointments));
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [user, fetchAppointments, buildApprovalNotifications]);

  useEffect(() => {
    if (!user) return;
    fetchPatientMessageThreads();
  }, [user, fetchPatientMessageThreads]);

  useEffect(() => {
    const pastAppointments = Array.isArray(appointments?.past) ? appointments.past : [];
    const reviewCandidates = [...pastAppointments]
      .filter((appointment) => appointment?.appointmentType !== 'LAB')
      .filter((appointment) => String(appointment?.status || '').toUpperCase() === 'COMPLETED')
      .filter((appointment) => !hasAppointmentReview(appointment))
      .sort((a, b) => {
        const da = new Date(`${a?.appointmentDate || '1970-01-01'}T${a?.appointmentTime || '00:00:00'}`).getTime();
        const db = new Date(`${b?.appointmentDate || '1970-01-01'}T${b?.appointmentTime || '00:00:00'}`).getTime();
        return db - da;
      });

    const nextTarget = reviewCandidates.find(
      (appointment) => !promptedReviewIdsRef.current.has(Number(appointment?.id))
    );

    if (!nextTarget) return;

    promptedReviewIdsRef.current.add(Number(nextTarget.id));
    setAutoReviewAppointment(nextTarget);
    setAutoReviewRating(0);
    setAutoReviewText('');
    setAutoReviewError('');
    setShowAutoReviewModal(true);
  }, [appointments?.past]);

  // Handlers
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleSubmitAutoReview = async () => {
    if (!autoReviewAppointment?.id || autoReviewRating === 0 || autoReviewSubmitting) return;
    try {
      setAutoReviewSubmitting(true);
      setAutoReviewError('');
      await appointmentService.addFeedback(
        autoReviewAppointment.id,
        autoReviewRating,
        autoReviewText
      );
      setShowAutoReviewModal(false);
      setAutoReviewAppointment(null);
      setAutoReviewRating(0);
      setAutoReviewText('');
      await fetchAppointments();
      showTemporaryMessage('success', 'Thank you. Your review has been submitted.');
    } catch (error) {
      const serverMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to submit review.';
      setAutoReviewError(serverMessage);
    } finally {
      setAutoReviewSubmitting(false);
    }
  };

  const handleRebookFromPast = useCallback((appointment) => {
    const doctorFromList = doctors.find((doc) => Number(doc.id) === Number(appointment.doctorId));
    const fallbackDoctor = {
      id: appointment.doctorId,
      name: appointment.doctor?.name || appointment.doctorName || 'Doctor',
      specialization: appointment.doctor?.doctorDetails?.specialization || appointment.specialization || 'General Medicine',
      consultationFee: appointment.consultationFee,
      fee: appointment.consultationFee,
      image: getFallbackDoctorImage(appointment.doctor || { id: appointment.doctorId, name: appointment.doctorName }, appointment.doctorId)
    };
    setSelectedDoctor(doctorFromList || fallbackDoctor);
    setBookingPrefill({
      reason: appointment.reason || '',
      symptoms: appointment.symptoms || '',
      notes: appointment.notes || '',
      durationOfSymptoms: appointment.durationOfSymptoms || '',
      severity: appointment.severity || '',
      visitType: appointment.visitType || 'FOLLOW_UP',
      bookingSource: 'REBOOK',
      parentAppointmentId: appointment.id
    });
    setShowBookModal(true);
  }, [doctors]);

  const handleBookSuccess = useCallback((bookedAppointment) => {
    if (bookedAppointment?.id) {
      const shouldForcePending = String(bookedAppointment.bookingSource || '').toUpperCase() === 'REBOOK';
      const mergedBooked = {
        ...bookedAppointment,
        status: shouldForcePending ? 'PENDING' : (bookedAppointment.status || 'PENDING')
      };
      setAppointments((prev) => {
        const currentUpcoming = Array.isArray(prev?.upcoming) ? prev.upcoming : [];
        const nextUpcoming = [
          mergedBooked,
          ...currentUpcoming.filter((a) => Number(a.id) !== Number(mergedBooked.id))
        ];
        return {
          ...(prev || { past: [] }),
          upcoming: nextUpcoming
        };
      });
    }
    fetchAppointments();
    showTemporaryMessage('success', 'Appointment booked successfully!');
    setActiveTab('appointments');
  }, [fetchAppointments]);

  const handleCancelBookedAppointment = async (appointment) => {
    if (!appointment?.id) return;
    try {
      if (appointment?.appointmentType === 'LAB') {
        await appointmentService.cancelLabAppointment(String(appointment.id).replace(/^LAB-/, ''));
      } else {
        await appointmentService.cancelAppointment(appointment.id, 'Cancelled by patient');
      }
      await fetchAppointments();
      if (selectedUpcomingAppointment?.id === appointment.id) {
        setShowUpcomingDetailsModal(false);
        setSelectedUpcomingAppointment(null);
      }
      showTemporaryMessage('success', 'Appointment cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      const serverMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to cancel appointment.';
      showTemporaryMessage('error', serverMessage);
    }
  };

  const handleOpenUpcomingDetails = (appointment) => {
    if (!appointment) return;
    setSelectedUpcomingAppointment(appointment);
    setShowUpcomingDetailsModal(true);
  };

  useEffect(() => {
    if (!showUpcomingDetailsModal || !selectedUpcomingAppointment?.id) return;
    const latest = (appointments.upcoming || []).find(
      (item) => Number(item.id) === Number(selectedUpcomingAppointment.id)
    );
    if (!latest) {
      setShowUpcomingDetailsModal(false);
      setSelectedUpcomingAppointment(null);
      return;
    }
    if (latest !== selectedUpcomingAppointment) {
      setSelectedUpcomingAppointment(latest);
    }
  }, [appointments.upcoming, showUpcomingDetailsModal, selectedUpcomingAppointment]);

  // Computed Properties
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAddress = !addressFilter.trim() ||
        doctor.clinicAddress?.toLowerCase().includes(addressFilter.toLowerCase());
      
      if (selectedSpecialization === 'all') return matchesSearch && matchesAddress;
      return matchesSearch && matchesAddress && doctor.specialization === selectedSpecialization;
    });
  }, [doctors, searchTerm, addressFilter, selectedSpecialization]);

  const specializations = useMemo(() => {
    if (allSpecializations.length > 0) return allSpecializations;
    return [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];
  }, [allSpecializations, doctors]);

  const comparedDoctors = useMemo(() => {
    return doctors.filter((doctor) =>
      selectedCompareDoctorIds.some((id) => Number(id) === Number(doctor.id))
    );
  }, [doctors, selectedCompareDoctorIds]);

  useEffect(() => {
    setSelectedCompareDoctorIds((prev) =>
      prev.filter((id) => doctors.some((doc) => Number(doc.id) === Number(id)))
    );
  }, [doctors]);

  const toggleCompareDoctor = useCallback((doctor) => {
    setSelectedCompareDoctorIds((prev) => {
      const exists = prev.some((id) => Number(id) === Number(doctor.id));
      if (exists) {
        return prev.filter((id) => Number(id) !== Number(doctor.id));
      }
      if (prev.length >= 2) {
        showTemporaryMessage('error', 'Please compare exactly 2 doctors at a time.');
        return prev;
      }
      return [...prev, doctor.id];
    });
  }, []);

  const doctorAnalysis = useMemo(() => {
    if (comparedDoctors.length !== 2) return null;

    const [first, second] = comparedDoctors;
    const toNumber = (value, fallback = 0) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };

    const e1 = toNumber(first.experience, 0);
    const e2 = toNumber(second.experience, 0);
    const r1 = toNumber(first.rating, 4.5);
    const r2 = toNumber(second.rating, 4.5);
    const f1 = toNumber(first.fee ?? first.consultationFee, Number.POSITIVE_INFINITY);
    const f2 = toNumber(second.fee ?? second.consultationFee, Number.POSITIVE_INFINITY);
    const p1 = [first.clinicAddress, first.specialization].filter((v) => String(v || '').trim()).length;
    const p2 = [second.clinicAddress, second.specialization].filter((v) => String(v || '').trim()).length;

    const normalizeUp = (value, min, max) => (max === min ? 0.5 : (value - min) / (max - min));
    const normalizeDown = (value, min, max) => (max === min ? 0.5 : (max - value) / (max - min));

    const expMin = Math.min(e1, e2);
    const expMax = Math.max(e1, e2);
    const rateMin = Math.min(r1, r2);
    const rateMax = Math.max(r1, r2);

    const feeValues = [f1, f2].filter(Number.isFinite);
    const feeMin = feeValues.length ? Math.min(...feeValues) : 0;
    const feeMax = feeValues.length ? Math.max(...feeValues) : 0;

    const profileMin = Math.min(p1, p2);
    const profileMax = Math.max(p1, p2);

    const score = (doctor, exp, rating, fee, profile) => {
      const expScore = normalizeUp(exp, expMin, expMax) * 45;
      const ratingScore = normalizeUp(rating, rateMin, rateMax) * 30;
      const feeScore = Number.isFinite(fee) ? normalizeDown(fee, feeMin, feeMax) * 20 : 10;
      const profileScore = normalizeUp(profile, profileMin, profileMax) * 5;
      const total = expScore + ratingScore + feeScore + profileScore;
      return {
        doctor,
        total,
        breakdown: {
          experience: expScore,
          rating: ratingScore,
          fee: feeScore,
          profile: profileScore
        }
      };
    };

    const s1 = score(first, e1, r1, f1, p1);
    const s2 = score(second, e2, r2, f2, p2);

    const best = s1.total >= s2.total ? s1 : s2;
    const other = s1.total >= s2.total ? s2 : s1;

    return {
      best,
      other,
      difference: Math.abs(best.total - other.total)
    };
  }, [comparedDoctors]);

  const dashboardFeaturedDoctors = useMemo(() => {
    if (doctorShowcaseTab === 'all') return INTRO_FEATURED_DOCTORS;
    return INTRO_FEATURED_DOCTORS.filter(
      (doctor) => doctor.specialty.toLowerCase() === doctorShowcaseTab
    );
  }, [doctorShowcaseTab]);

  const pendingAppointments = useMemo(
    () => (appointments.upcoming || []).filter((app) => app.status === 'PENDING'),
    [appointments.upcoming]
  );

  const upcomingAppointments = useMemo(
    () => (appointments.upcoming || []),
    [appointments.upcoming]
  );

  const filteredUpcomingAppointments = useMemo(() => {
    if (appointmentFilter === 'lab') {
      return upcomingAppointments.filter((app) => app?.appointmentType === 'LAB');
    }
    if (appointmentFilter === 'doctor') {
      return upcomingAppointments.filter((app) => app?.appointmentType !== 'LAB');
    }
    return upcomingAppointments;
  }, [upcomingAppointments, appointmentFilter]);

  const completedAppointments = useMemo(
    () => (appointments.past || []).filter((app) => app.status === 'COMPLETED'),
    [appointments.past]
  );

  const pastAppointmentsSorted = useMemo(() => {
    return [...(appointments.past || [])].sort((a, b) => {
      const da = new Date(`${a.appointmentDate || '1970-01-01'}T${a.appointmentTime || '00:00:00'}`);
      const db = new Date(`${b.appointmentDate || '1970-01-01'}T${b.appointmentTime || '00:00:00'}`);
      return db - da;
    });
  }, [appointments.past]);

  const filteredPastAppointments = useMemo(() => {
    if (appointmentFilter === 'lab') {
      return pastAppointmentsSorted.filter((app) => app?.appointmentType === 'LAB');
    }
    if (appointmentFilter === 'doctor') {
      return pastAppointmentsSorted.filter((app) => app?.appointmentType !== 'LAB');
    }
    return pastAppointmentsSorted;
  }, [pastAppointmentsSorted, appointmentFilter]);

  const recentActivities = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    return pastAppointmentsSorted.filter((app) => {
      const dt = new Date(
        `${app.appointmentDate || '1970-01-01'}T${app.appointmentTime || '00:00:00'}`
      );
      const time = dt.getTime();
      if (!Number.isFinite(time)) return false;
      const diff = now - time;
      return diff >= 0 && diff <= oneDayMs;
    });
  }, [pastAppointmentsSorted]);

  const diagnosisRecords = useMemo(
    () => pastAppointmentsSorted.filter((app) => (app.diagnosis || '').trim()),
    [pastAppointmentsSorted]
  );

  const prescriptionRecords = useMemo(
    () => pastAppointmentsSorted.filter((app) => (app.prescription || '').trim()),
    [pastAppointmentsSorted]
  );

  const followUpRecords = useMemo(
    () => pastAppointmentsSorted.filter((app) => !!app.followUpDate),
    [pastAppointmentsSorted]
  );

  const medicalBillingSummary = useMemo(() => {
    const completed = pastAppointmentsSorted.filter((app) => app.status === 'COMPLETED');
    const totalSpent = completed.reduce((sum, app) => sum + Number(app.consultationFee || 0), 0);
    return {
      totalSpent,
      totalVisits: pastAppointmentsSorted.length,
      completedVisits: completed.length
    };
  }, [pastAppointmentsSorted]);

  const patientPaymentAnalytics = useMemo(() => {
    const allAppointments = [...(appointments.upcoming || []), ...(appointments.past || [])];
    const completed = allAppointments.filter(
      (app) => String(app.status || '').toUpperCase() === 'COMPLETED'
    );
    const pendingOrConfirmed = allAppointments.filter((app) => {
      const status = String(app.status || '').toUpperCase();
      return status === 'PENDING' || status === 'CONFIRMED';
    });

    const totalSpent = completed.reduce((sum, app) => sum + Number(app.consultationFee || 0), 0);
    const pendingAmount = pendingOrConfirmed.reduce(
      (sum, app) => sum + Number(app.consultationFee || 0),
      0
    );
    const totalTransactions = completed.length;
    const avgTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0;
    const highestTransaction = completed.reduce(
      (max, app) => Math.max(max, Number(app.consultationFee || 0)),
      0
    );

    const now = new Date();
    const monthBuckets = Array.from({ length: 6 }, (_, index) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        key,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        amount: 0
      };
    });
    const monthMap = new Map(monthBuckets.map((bucket) => [bucket.key, 0]));
    completed.forEach((app) => {
      const date = String(app.appointmentDate || '');
      const monthKey = date.slice(0, 7);
      if (monthMap.has(monthKey)) {
        monthMap.set(monthKey, monthMap.get(monthKey) + Number(app.consultationFee || 0));
      }
    });
    const monthlySpend = monthBuckets.map((bucket) => ({
      ...bucket,
      amount: monthMap.get(bucket.key) || 0
    }));
    const maxMonthlySpend = Math.max(1, ...monthlySpend.map((bucket) => bucket.amount));

    const paymentHistory = [...completed]
      .sort((a, b) => {
        const da = new Date(
          `${a.appointmentDate || '1970-01-01'}T${a.appointmentTime || '00:00:00'}`
        );
        const db = new Date(
          `${b.appointmentDate || '1970-01-01'}T${b.appointmentTime || '00:00:00'}`
        );
        return db - da;
      })
      .map((app) => ({
        id: app.id,
        date: app.appointmentDate || '-',
        time: app.appointmentTime || '-',
        doctorName: app.doctor?.name || app.doctorName || 'Doctor',
        amount: Number(app.consultationFee || 0),
        visitType: String(app.visitType || 'IN_PERSON').replace('_', ' '),
        method: 'CASH',
        status: 'PAID'
      }));

    return {
      totalSpent,
      pendingAmount,
      totalTransactions,
      avgTransaction,
      highestTransaction,
      monthlySpend,
      maxMonthlySpend,
      paymentHistory
    };
  }, [appointments.upcoming, appointments.past]);

  const labHistoryRecords = useMemo(() => {
    const past = Array.isArray(appointments.past) ? appointments.past : [];
    return past
      .filter((app) => String(app?.appointmentType || '').toUpperCase() === 'LAB')
      .sort((a, b) => {
        const da = new Date(
          `${a.appointmentDate || '1970-01-01'}T${a.appointmentTime || '00:00:00'}`
        );
        const db = new Date(
          `${b.appointmentDate || '1970-01-01'}T${b.appointmentTime || '00:00:00'}`
        );
        return db - da;
      });
  }, [appointments.past]);

  const appointmentAnalysis = useMemo(() => {
    const allAppointments = [...(appointments.upcoming || []), ...(appointments.past || [])];

    const statusCounts = {
      total: allAppointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };

    const visitTypeCounts = {
      online: 0,
      inPerson: 0,
      followUp: 0,
      other: 0
    };

    allAppointments.forEach((app) => {
      const status = String(app.status || '').toUpperCase();
      if (status === 'PENDING') statusCounts.pending += 1;
      else if (status === 'CONFIRMED') statusCounts.confirmed += 1;
      else if (status === 'COMPLETED') statusCounts.completed += 1;
      else if (status === 'CANCELLED') statusCounts.cancelled += 1;

      const visitType = String(app.visitType || '').toUpperCase();
      if (visitType.includes('ONLINE') || visitType.includes('VIDEO')) visitTypeCounts.online += 1;
      else if (visitType.includes('FOLLOW')) visitTypeCounts.followUp += 1;
      else if (visitType.includes('IN_PERSON') || visitType.includes('IN-PERSON') || visitType.includes('CLINIC')) {
        visitTypeCounts.inPerson += 1;
      } else if (visitType) {
        visitTypeCounts.other += 1;
      } else {
        visitTypeCounts.inPerson += 1;
      }
    });

    const now = new Date();
    const monthBuckets = Array.from({ length: 6 }, (_, index) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        key,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        count: 0
      };
    });
    const monthMap = new Map(monthBuckets.map((bucket) => [bucket.key, 0]));
    allAppointments.forEach((app) => {
      const date = String(app.appointmentDate || '');
      const monthKey = date.slice(0, 7);
      if (monthMap.has(monthKey)) {
        monthMap.set(monthKey, monthMap.get(monthKey) + 1);
      }
    });
    const monthlyTrend = monthBuckets.map((bucket) => ({
      ...bucket,
      count: monthMap.get(bucket.key) || 0
    }));

    const maxMonthlyAppointments = Math.max(1, ...monthlyTrend.map((item) => item.count));
    const maxVisitType = Math.max(
      1,
      visitTypeCounts.online,
      visitTypeCounts.inPerson,
      visitTypeCounts.followUp,
      visitTypeCounts.other
    );

    return {
      statusCounts,
      visitTypeCounts,
      monthlyTrend,
      maxMonthlyAppointments,
      maxVisitType
    };
  }, [appointments.upcoming, appointments.past]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const filteredMessageThreads = useMemo(() => {
    return messageThreads.filter((thread) => {
      if (messageFilter === 'unread') return Number(thread.unreadCount || 0) > 0;
      if (messageFilter === 'today') {
        return thread.appointmentDate === new Date().toISOString().split('T')[0];
      }
      if (messageFilter === 'pending') {
        const s = String(thread.appointmentStatus || '').toUpperCase();
        return s === 'PENDING' || s === 'CONFIRMED';
      }
      return true;
    });
  }, [messageThreads, messageFilter]);

  const activeMessageThread = useMemo(() => {
    return (
      messageThreads.find((thread) => String(thread.id) === String(selectedMessageThreadId)) ||
      filteredMessageThreads[0] ||
      null
    );
  }, [messageThreads, selectedMessageThreadId, filteredMessageThreads]);

  const totalUnreadMessages = useMemo(
    () => messageThreads.reduce((sum, thread) => sum + Number(thread.unreadCount || 0), 0),
    [messageThreads]
  );

  useEffect(() => {
    if (!selectedMessageThreadId && messageThreads.length > 0) {
      setSelectedMessageThreadId(String(messageThreads[0].id));
    }
  }, [selectedMessageThreadId, messageThreads]);

  const openMessageThread = useCallback(async (threadId) => {
    const id = String(threadId);
    setSelectedMessageThreadId(id);
    try {
      setMessagesLoading(true);
      const [messagesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/messages/patient/threads/${id}/messages`, axiosConfig),
        axios.patch(`${API_BASE_URL}/messages/patient/threads/${id}/read`, {}, axiosConfig)
      ]);
      setThreadMessagesById((prev) => ({ ...prev, [id]: messagesRes?.data || [] }));
      fetchPatientMessageThreads();
    } catch (error) {
      setThreadMessagesById((prev) => ({ ...prev, [id]: prev[id] || [] }));
    } finally {
      setMessagesLoading(false);
    }
  }, [axiosConfig, fetchPatientMessageThreads]);

  useEffect(() => {
    if (!selectedMessageThreadId) return;
    const key = String(selectedMessageThreadId);
    if (threadMessagesById[key]) return;
    openMessageThread(key);
  }, [selectedMessageThreadId, threadMessagesById, openMessageThread]);

  const sendMessageToDoctor = useCallback(async () => {
    const text = String(messageDraft || '').trim();
    if (!text || !activeMessageThread) return;
    try {
      if (typingStopTimerRef.current) {
        window.clearTimeout(typingStopTimerRef.current);
      }
      if (messageSocketRef.current && messageSocketRef.current.readyState === WebSocket.OPEN) {
        messageSocketRef.current.send(
          JSON.stringify({
            type: 'TYPING',
            threadId: Number(activeMessageThread.id),
            typing: false
          })
        );
      }

      const sent = await axios.post(
        `${API_BASE_URL}/messages/patient/threads/${activeMessageThread.id}/messages`,
        { text },
        axiosConfig
      );
      const sentMessage = sent?.data;
      setThreadMessagesById((prev) => ({
        ...prev,
        [String(activeMessageThread.id)]: (prev[String(activeMessageThread.id)] || []).some(
          (item) => Number(item?.id) === Number(sentMessage?.id)
        )
          ? (prev[String(activeMessageThread.id)] || [])
          : [...(prev[String(activeMessageThread.id)] || []), sentMessage]
      }));
      setMessageDraft('');
      fetchPatientMessageThreads();
    } catch (error) {
      showTemporaryMessage('error', 'Failed to send message. Please try again.');
    }
  }, [messageDraft, activeMessageThread, axiosConfig, fetchPatientMessageThreads]);

  const handleDraftTyping = useCallback((value) => {
    setMessageDraft(value);
    if (!activeMessageThread) return;
    if (!messageSocketRef.current || messageSocketRef.current.readyState !== WebSocket.OPEN) return;

    const threadId = Number(activeMessageThread.id);
    typingThreadRef.current = threadId;
    messageSocketRef.current.send(
      JSON.stringify({
        type: 'TYPING',
        threadId,
        typing: true
      })
    );

    if (typingStopTimerRef.current) {
      window.clearTimeout(typingStopTimerRef.current);
    }
    typingStopTimerRef.current = window.setTimeout(() => {
      if (!messageSocketRef.current || messageSocketRef.current.readyState !== WebSocket.OPEN) return;
      messageSocketRef.current.send(
        JSON.stringify({
          type: 'TYPING',
          threadId: typingThreadRef.current,
          typing: false
        })
      );
    }, 1500);
  }, [activeMessageThread]);

  useEffect(() => {
    if (!user || !token) return undefined;

    let isActive = true;
    let reconnectTimer = null;
    let socket = null;
    const wsBaseUrl = API_BASE_URL.replace(/^http/i, 'ws').replace(/\/api$/, '');

    const connect = () => {
      socket = new WebSocket(`${wsBaseUrl}/ws/messages?token=${encodeURIComponent(token)}`);
      messageSocketRef.current = socket;

      socket.onmessage = async (event) => {
        try {
          const payload = JSON.parse(event.data || '{}');
          if (payload?.type === 'PRESENCE') {
            const actorUserId = Number(payload?.actorUserId);
            if (Number.isFinite(actorUserId)) {
              setOnlineByUserId((prev) => ({ ...prev, [actorUserId]: Boolean(payload?.online) }));
            }
            return;
          }

          if (payload?.type === 'TYPING' && payload?.threadId != null) {
            const actorUserId = Number(payload?.actorUserId);
            if (actorUserId === Number(user?.id)) {
              return;
            }
            const threadKey = String(payload.threadId);
            setTypingByThread((prev) => ({
              ...prev,
              [threadKey]: Boolean(payload?.typing)
            }));
            return;
          }

          if (payload?.type !== 'MESSAGE_CREATED' || !payload?.message || payload?.threadId == null) {
            return;
          }

          const threadKey = String(payload.threadId);
          const incoming = payload.message;
          setTypingByThread((prev) => ({ ...prev, [threadKey]: false }));

          setThreadMessagesById((prev) => {
            const existing = prev[threadKey] || [];
            const alreadyPresent = existing.some((msg) => Number(msg?.id) === Number(incoming?.id));
            if (alreadyPresent) return prev;
            return {
              ...prev,
              [threadKey]: [...existing, incoming]
            };
          });

          try {
            const res = await axios.get(`${API_BASE_URL}/messages/patient/threads`, axiosConfig);
            if (isActive) {
              setMessageThreads(res?.data || []);
            }
          } catch (error) {
            // Ignore transient refresh failures; socket events will continue.
          }
        } catch (error) {
          // Ignore malformed websocket payloads.
        }
      };

      socket.onerror = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };

      socket.onclose = () => {
        if (!isActive) return;
        reconnectTimer = window.setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      isActive = false;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (typingStopTimerRef.current) {
        window.clearTimeout(typingStopTimerRef.current);
      }
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close();
      }
      messageSocketRef.current = null;
    };
  }, [user, token, axiosConfig]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* Animated loader */}
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-indigo-100 border-t-indigo-400 rounded-full animate-spin-slow" />
              <Heart className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium mt-6">Loading your health dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 backdrop-blur-md shadow-lg z-40 border-b border-indigo-100 animate-slideDown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-3 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-all duration-300 animate-pulse-slow">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  MediCare
                </span>
                <span className="block text-xs text-gray-400">Patient Portal</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { id: 'dashboard', icon: Home, label: 'Dashboard' },
                { id: 'appointments', icon: Calendar, label: 'Appointments', badge: appointments.upcoming.length },
                { id: 'doctors', icon: Stethoscope, label: 'Doctors' },
                { id: 'records', icon: FileText, label: 'Records' },
                { id: 'labtest', icon: FlaskConical, label: 'LTest' },
                { id: 'messages', icon: MessageCircle, label: 'Messages', badge: totalUnreadMessages },
                { id: 'payments', icon: CreditCard, label: 'Payments' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-4 py-2 rounded-xl transition-all duration-300 group flex items-center gap-2 ${
                    activeTab === item.id 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200' 
                      : 'text-gray-600 hover:bg-white/50 hover:text-indigo-600'
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-bounce-slow">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-white/50 rounded-xl hover:bg-white transition-all duration-300 relative group"
                >
                  <Bell size={20} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                          Mark all as read
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification, idx) => (
                          <NotificationItem 
                            key={idx} 
                            notification={notification}
                            onMarkRead={(id) => {
                              setNotifications(prev => 
                                prev.map(n => n.id === id ? { ...n, read: true } : n)
                              );
                            }}
                          />
                        ))
                      ) : (
                        <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-indigo-300" />
                          </div>
                          <p className="text-gray-500 font-medium">No notifications</p>
                          <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchDashboardData(user)}
                className="p-2.5 bg-white/50 rounded-xl hover:bg-white transition-all duration-300 group"
                title="Refresh Data"
              >
                <RefreshCw size={20} className="text-gray-600 group-hover:text-indigo-600 transition-colors group-hover:rotate-180 transition-all duration-500" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 bg-white/50 hover:bg-white rounded-xl hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.name?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500">Patient</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500 hidden lg:block group-hover:translate-y-0.5 transition-transform" />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      {[
                        { icon: User, label: 'Profile', tab: 'profile' },
                        { icon: Settings, label: 'Settings', tab: 'settings' },
                      ].map((item) => (
                        <button
                          key={item.tab}
                          onClick={() => {
                            setActiveTab(item.tab);
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-colors text-left"
                        >
                          <item.icon size={16} className="text-indigo-500" />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </button>
                      ))}
                      <div className="border-t border-gray-100 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut size={16} className="text-rose-500" />
                        <span className="text-sm text-rose-600">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 bg-white/50 rounded-xl hover:bg-white transition-all duration-300"
              >
                {mobileMenuOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-indigo-100 bg-white/95 backdrop-blur-md animate-slideDown">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'dashboard', icon: Home, label: 'Dashboard' },
                  { id: 'appointments', icon: Calendar, label: 'Appointments' },
                  { id: 'doctors', icon: Stethoscope, label: 'Doctors' },
                  { id: 'records', icon: FileText, label: 'Records' },
                  { id: 'labtest', icon: FlaskConical, label: 'Lab Test' },
                  { id: 'messages', icon: MessageCircle, label: 'Messages' },
                  { id: 'payments', icon: CreditCard, label: 'Payments' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                      activeTab === item.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-indigo-600'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-xs mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        {/* Welcome Header */}
        <header className="mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                {activeTab === 'dashboard' && (
                  <>
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">
                        {new Date().getHours() < 12 ? '☀️' : new Date().getHours() < 17 ? '⛅' : '🌙'}
                      </span>
                      <span className="text-gray-700">Good</span>
                      <span className="text-indigo-600 font-semibold">
                        {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}
                      </span>
                      <span className="text-gray-700">,</span>
                      <span className="text-gray-900 font-bold">{user?.name?.split(' ')[0]}</span>
                      <span className="text-gray-700">!</span>
                    </span>
                  </>
                )}
                {/* {activeTab === 'appointments' && 'My Appointments'} */}
                {/* {activeTab === 'doctors' && 'Find Doctors'} */}
                {/* {activeTab === 'records' && 'Medical Records'} */}
                {/* {activeTab === 'labtest' && 'Laboratory Tests'} */}
                {/* {activeTab === 'messages' && 'Messages'} */}
                {activeTab === 'payments' && 'Payments & Billing'}
                {activeTab === 'profile' && 'My Profile'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
            </div>
            
            {/* Quick Stats - Google Analytics Style */}
            {activeTab === 'dashboard' && (
              <div className="mt-4 md:mt-0 flex items-center divide-x divide-gray-200 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-gray-500">Upcoming</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{upcomingAppointments.length}</span>
                </div>
                
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-xs text-gray-500">Pending</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{pendingAppointments.length}</span>
                </div>
                
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-gray-500">Completed</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{completedAppointments.length}</span>
                </div>
                
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-xs text-gray-500">Doctors</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{doctors.length}</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slideDown ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Actions - Google Analytics Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                icon={Calendar}
                title="Book Appointment"
                description="Schedule a visit with our specialists"
                onClick={() => setShowNewAppointmentModal(true)}
                color="primary"
                stats="12 available today"
              />
              <QuickActionCard
                icon={Video}
                title="Find Doctors"
                description="Connect with doctors online"
                onClick={() => setActiveTab('doctors')}
                color="success"
                stats="4 upcoming"
              />
              <QuickActionCard
                icon={FileText}
                title="Medical Records"
                description="View your health history"
                onClick={() => setActiveTab('records')}
                color="warning"
                stats="3 new updates"
              />
              <QuickActionCard
                icon={Wallet}
                title="Payments"
                description="Manage your bills"
                onClick={() => setActiveTab('payments')}
                color="error"
                stats="2 pending"
              />
            </div>

            {/* Lab Tests Callout */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <FlaskConical size={12} />
                    Lab Tests
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900 mt-3">Want to do a test today?</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Try our tests with verified labs near you.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('labtest')}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
                >
                  Try our tests
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {DASHBOARD_TESTS.map((test) => {
                  const Icon = test.icon;
                  return (
                    <div
                      key={test.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/40 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-blue-600">
                          <Icon size={18} />
                        </div>
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Verified labs
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mt-3">{test.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{test.turnaround}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm font-semibold text-gray-900">{test.price}</span>
                        <span className="text-xs text-gray-500">{test.labs}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctors Callout */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] p-6"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                    <Stethoscope size={12} />
                    Doctors
                  </span>
                  <h2 className="text-lg font-semibold text-gray-900 mt-3">Need a doctor today?</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Book a verified specialist in minutes.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"
                >
                  Find doctors
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics'].map((specialty, index) => (
                  <motion.div
                    key={specialty}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05, duration: 0.3, ease: 'easeOut' }}
                    className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Stethoscope size={18} />
                      </div>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Top picks
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mt-3">{specialty}</h3>
                    <p className="text-xs text-gray-500 mt-1">Verified specialists</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Featured Doctors from Intro Page */}

            {/* Appointments Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointments - Google Style */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header - Google Style */}
                <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-50">
                        <Calendar size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-sm font-medium text-gray-700">Upcoming appointments</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">Your scheduled visits</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('appointments')}
                      className="group flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>View all</span>
                      <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                  
                  {/* Quick summary chip - only shown if there are appointments */}
                  {upcomingAppointments.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                        Next: {new Date(upcomingAppointments[0]?.appointmentDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {upcomingAppointments[0]?.appointmentTime}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingAppointments.slice(0, 3).map((app, index) => {
                        const appointmentDate = new Date(app.appointmentDate);
                        const today = new Date();
                        const isToday = appointmentDate.toDateString() === today.toDateString();
                        const isTomorrow = appointmentDate.getDate() === today.getDate() + 1;
                        
                        return (
                          <div key={app.id} className="group relative">
                            {/* Status indicator dot */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                app.status === 'CONFIRMED' ? 'bg-emerald-500' :
                                app.status === 'PENDING' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                            </div>
                            
                            {/* Appointment card - Google Calendar style */}
                            <div className="pl-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                      Dr. {app.doctor?.name || app.doctorName || 'Doctor'}
                                    </h3>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                      app.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
                                      app.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                                      'bg-blue-50 text-blue-700'
                                    }`}>
                                      {app.status || 'PENDING'}
                                    </span>
                                  </div>
                                  
                                  <p className="text-xs text-gray-500 mt-0.5">{app.specialization || 'General Medicine'}</p>
                                  
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1">
                                      <Calendar size={10} className="text-gray-400" />
                                      <span className="text-[11px] text-gray-600">
                                        {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : appointmentDate.toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock size={10} className="text-gray-400" />
                                      <span className="text-[11px] text-gray-600">{app.appointmentTime || 'TBD'}</span>
                                    </div>
                                    {app.visitType && (
                                      <div className="flex items-center gap-1">
                                        <Activity size={10} className="text-gray-400" />
                                        <span className="text-[11px] text-gray-600 capitalize">
                                          {app.visitType.toLowerCase().replace('_', ' ')}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Quick actions on hover */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleOpenUpcomingDetails(app)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                    title="View details"
                                  >
                                    <ChevronRight size={14} className="text-gray-400" />
                                  </button>
                                  {(String(app.status || '').toUpperCase() === 'PENDING' ||
                                    String(app.status || '').toUpperCase() === 'CONFIRMED') && (
                                    <button
                                      onClick={() => handleCancelBookedAppointment(app)}
                                      className="p-1 hover:bg-rose-50 rounded transition-colors"
                                      title="Cancel appointment"
                                    >
                                      <XCircle size={14} className="text-rose-400" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Reason if available */}
                              {app.reason && (
                                <p className="text-[10px] text-gray-400 mt-2 line-clamp-1">
                                  {app.reason}
                                </p>
                              )}
                            </div>
                            
                            {/* Divider (except for last item) */}
                            {index < Math.min(upcomingAppointments.length, 3) - 1 && (
                              <div className="absolute left-4 right-0 bottom-0 h-px bg-gray-100" />
                            )}
                          </div>
                        );
                      })}
                      
                      {/* View more link if there are more than 3 */}
                      {upcomingAppointments.length > 3 && (
                        <button
                          onClick={() => setActiveTab('appointments')}
                          className="w-full pt-2 text-center"
                        >
                          <span className="text-[10px] font-medium text-blue-600 hover:text-blue-700">
                            +{upcomingAppointments.length - 3} more appointments
                          </span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Empty State - Google Style */
                    <div className="py-8 text-center">
                      <div className="relative w-16 h-16 mx-auto mb-3">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full animate-pulse" />
                        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100">
                          <Calendar size={20} className="text-blue-400" />
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-700">No upcoming appointments</p>
                      <p className="text-[10px] text-gray-400 mt-1 mb-3">Schedule your first appointment today</p>
                      <button 
                        onClick={() => setShowNewAppointmentModal(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={12} />
                        Book Now
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Footer with stats (only if there are appointments) */}
                {upcomingAppointments.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500">
                        <span className="font-medium text-gray-700">{upcomingAppointments.length}</span> total
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-gray-500">{upcomingAppointments.filter(a => a.status === 'CONFIRMED').length} confirmed</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="text-gray-500">{upcomingAppointments.filter(a => a.status === 'PENDING').length} pending</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity - Google Analytics Style */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header - Google Style */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50">
                        <Activity size={18} className="text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-base font-medium text-gray-900">Recent activity</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Your latest health updates</p>
                      </div>
                    </div>
                    {pastAppointmentsSorted.length > 0 && (
                      <button 
                        onClick={() => setActiveTab('records')}
                        className="group flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <span>View all</span>
                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Activity List */}
                <div className="p-2 max-h-[380px] overflow-y-auto">
                  {recentActivities.length > 0 ? (
                    <div className="space-y-1">
                      {recentActivities.slice(0, 5).map((app, index) => (
                        <CompactRecentActivityCard
                          key={app.id}
                          appointment={app}
                          index={index}
                          onOpen={() => setActiveTab('records')}
                          onRebook={() => handleRebookFromPast(app)}
                        />
                      ))}
                      
                      {/* Show more indicator if there are more than 5 items */}
                      {recentActivities.length > 5 && (
                        <button
                          onClick={() => setActiveTab('records')}
                          className="w-full py-3 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1 mt-2"
                        >
                          <span>View {recentActivities.length - 5} more activities</span>
                          <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Empty State - Google Style */
                    <div className="py-12 px-4 text-center">
                      <div className="relative">
                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-full blur-xl opacity-50 animate-pulse" />
                        
                        {/* Icon container */}
                        <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center mb-3">
                          <Activity size={24} className="text-amber-400" />
                        </div>
                        
                        {/* Decorative dots */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-bounce" />
                        <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-amber-200 rounded-full opacity-50" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">No recent activity</p>
                      <p className="text-xs text-gray-400 mt-1">Your health updates will appear here</p>
                    </div>
                  )}
                </div>

                {/* Footer with summary stats (if there are activities) */}
                {recentActivities.length > 0 && (
                  <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          <span className="font-medium text-gray-700">{recentActivities.length}</span> recent visits
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">
                          Last: {new Date(recentActivities[0]?.appointmentDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        Updated just now
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Booking Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Appointment Card - Google Analytics Style */}
              <div className="group bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">New appointment</h3>
                    <p className="text-xs text-gray-500 mt-1">Schedule with our specialists</p>
                  </div>
                  <div className="p-1.5 bg-blue-50 rounded">
                    <Plus size={14} className="text-blue-600" />
                  </div>
                </div>
                
                <button
                  onClick={() => setShowNewAppointmentModal(true)}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  Book New Appointment
                </button>
              </div>

              {/* Quick Rebook Card - Google Analytics Style */}
              <div className="group bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Quick rebook</h3>
                    <p className="text-xs text-gray-500 mt-1">Book from past appointments</p>
                  </div>
                  <div className="p-1.5 bg-emerald-50 rounded">
                    <RefreshCw size={14} className="text-emerald-600" />
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (pastAppointmentsSorted.length > 0) {
                      handleRebookFromPast(pastAppointmentsSorted[0]);
                    }
                  }}
                  disabled={pastAppointmentsSorted.length === 0}
                  className={`w-full py-2 px-3 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 ${
                    pastAppointmentsSorted.length > 0
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw size={14} />
                  {pastAppointmentsSorted.length > 0 ? 'Rebook Last Visit' : 'No past appointments'}
                </button>
              </div>
            </div>

            {/* Upcoming Appointments - Google Calendar Style */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header - Google Style */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">Upcoming appointments</h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {filteredUpcomingAppointments.length} {filteredUpcomingAppointments.length === 1 ? 'appointment' : 'appointments'} scheduled
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {/* Navigate to calendar view */}}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                      title="Calendar view"
                    >
                      <CalendarDays className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {/* Navigate to all appointments */}}
                      className="group flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>View all</span>
                      <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'doctor', label: 'Doctor' },
                    { id: 'lab', label: 'Lab' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setAppointmentFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        appointmentFilter === filter.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Status Chips - Google Analytics Style */}
                {filteredUpcomingAppointments.length > 0 && (
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs text-gray-600">
                        <span className="font-medium">{filteredUpcomingAppointments.filter(a => a.status === 'CONFIRMED').length}</span> confirmed
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-xs text-gray-600">
                        <span className="font-medium">{filteredUpcomingAppointments.filter(a => a.status === 'PENDING').length}</span> pending
                      </span>
                    </div>
                    {filteredUpcomingAppointments.length > 0 && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-xs text-gray-400">Next:</span>
                        <span className="text-xs font-medium text-gray-700">
                          {new Date(filteredUpcomingAppointments[0]?.appointmentDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {filteredUpcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {/* Timeline View */}
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-blue-100 to-transparent" />
                      
                      <div className="space-y-3">
                        {filteredUpcomingAppointments
                          .sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime}`) - new Date(`${b.appointmentDate}T${b.appointmentTime}`))
                          .map((app, index) => {
                            const appointmentDate = new Date(app.appointmentDate);
                            const today = new Date();
                            const isToday = appointmentDate.toDateString() === today.toDateString();
                            const isTomorrow = appointmentDate.getDate() === today.getDate() + 1;
                            
                            return (
                              <div key={app.id} className="relative group">
                                {/* Timeline dot with status */}
                                <div className="absolute left-[13px] top-4 z-10">
                                  <div className={`relative w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                    app.status === 'CONFIRMED' ? 'bg-emerald-500' :
                                    app.status === 'PENDING' ? 'bg-amber-500' : 'bg-blue-500'
                                  }`}>
                                    {index === 0 && (
                                      <span className="absolute -inset-1 rounded-full bg-blue-400/20 animate-ping" />
                                    )}
                                  </div>
                                </div>
                                
                                {/* Date badge for first item */}
                                {index === 0 && (
                                  <div className="absolute -top-2 left-0 right-0 flex justify-center mb-2">
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                                      {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : 'Upcoming'}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Appointment Card */}
                                <div className="pl-10">
                                  <EnhancedAppointmentCard 
                                    appointment={app} 
                                    type="upcoming"
                                    onUpdate={fetchAppointments}
                                    onRebook={handleRebookFromPast}
                                    onCancel={handleCancelBookedAppointment}
                                    onViewDetails={handleOpenUpcomingDetails}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Quick Actions - Google Style */}
                    {filteredUpcomingAppointments.length > 1 && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Next 7 days:</span>
                            <span className="text-xs font-medium text-gray-700">
                              {filteredUpcomingAppointments.filter(a => {
                                const date = new Date(a.appointmentDate);
                                const weekLater = new Date();
                                weekLater.setDate(weekLater.getDate() + 7);
                                return date <= weekLater;
                              }).length} appointments
                            </span>
                          </div>
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            <span>View calendar</span>
                            <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty State - Google Style */
                  <div className="text-center py-12">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full animate-pulse" />
                      
                      {/* Calendar icon */}
                      <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-white shadow-lg">
                        <Calendar className="w-10 h-10 text-blue-500" />
                      </div>
                      
                      {/* Decorative dots */}
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-bounce" />
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-200 rounded-full opacity-50" />
                    </div>
                    
                    <h3 className="text-base font-semibold text-gray-900 mb-1">No upcoming appointments</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                      Your schedule is clear. Book your first appointment to get started with your healthcare journey.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => setActiveTab('doctors')}
                        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 flex items-center justify-center gap-2"
                      >
                        <Search size={16} />
                        Find a Doctor
                      </button>
                      <button
                        onClick={() => setShowNewAppointmentModal(true)}
                        className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                        <UserRound size={16} />
                        Browse Specialties
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Past Appointments */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Past Appointments</h2>
              {filteredPastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredPastAppointments.slice(0, 5).map(app => (
                    <EnhancedAppointmentCard 
                      key={app.id} 
                      appointment={app} 
                      type="past"
                      onUpdate={fetchAppointments}
                      onRebook={handleRebookFromPast}
                      onViewDetails={() => {/* Handle view details */}}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No past appointments</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Find Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Search Section - Google Style */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden">
              {/* Header with gradient */}
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Find Your Doctor</h2>
                    <p className="text-sm text-gray-500 mt-1">Search by name, specialization, or location</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                      {filteredDoctors.length} doctors available
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Filters - Google Material Design */}
              <div className={comparedDoctors.length === 0 ? 'px-6 py-3' : 'p-6'}>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Search by name/specialization */}
                  <div className="lg:col-span-1 group">
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Search</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="Name or specialization..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filter by location */}
                  <div className="lg:col-span-1 group">
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        placeholder="City or area..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        value={addressFilter}
                        onChange={(e) => setAddressFilter(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Specialization dropdown */}
                  <div className="lg:col-span-1 group">
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Specialization</label>
                    <div className="relative">
                      <select
                        value={selectedSpecialization}
                        onChange={(e) => setSelectedSpecialization(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm appearance-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      >
                        <option value="all">All Specializations</option>
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Reset button */}
                  <div className="lg:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setAddressFilter('');
                        setSelectedSpecialization('all');
                      }}
                      className="w-full px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Active filters */}
                {(searchTerm || addressFilter || selectedSpecialization !== 'all') && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {searchTerm && (
                      <span className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full flex items-center gap-1">
                        <span>Search: {searchTerm}</span>
                        <button onClick={() => setSearchTerm('')} className="hover:text-indigo-800">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {addressFilter && (
                      <span className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full flex items-center gap-1">
                        <span>Location: {addressFilter}</span>
                        <button onClick={() => setAddressFilter('')} className="hover:text-indigo-800">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {selectedSpecialization !== 'all' && (
                      <span className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full flex items-center gap-1">
                        <span>{selectedSpecialization}</span>
                        <button onClick={() => setSelectedSpecialization('all')} className="hover:text-indigo-800">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Comparison - Google Style */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">Doctor Comparison</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Select 2 doctors for AI-powered analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${comparedDoctors.length === 2 ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {comparedDoctors.length}/2 selected
                    </span>
                    {comparedDoctors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedCompareDoctorIds([])}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        <X size={12} />
                        <span>Clear all</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {comparedDoctors.length === 0 ? (
                  <div className="text-xs text-gray-500">
                    Select 2 doctors to compare.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Comparison Table - Google Sheets Style */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Doctor
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Specialization
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Experience
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fee
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rating
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {comparedDoctors.map((doctor, index) => (
                            <tr key={doctor.id} className={index === 0 ? 'bg-indigo-50/30' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm mr-3">
                                    {doctor.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">Dr. {doctor.name}</div>
                                    {index === 0 && comparedDoctors.length === 2 && (
                                      <span className="text-[10px] text-emerald-600">Currently selected</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {doctor.specialization || 'General Medicine'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {doctor.experience || 0} years
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-emerald-600">
                                  ₹{doctor.fee ?? doctor.consultationFee ?? 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <Star size={14} className="text-amber-400 fill-amber-400" />
                                  <span className="text-sm text-gray-600">{doctor.rating || '4.5'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {doctor.clinicAddress?.split(',')[0] || 'Address not available'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* AI Analysis Card - Google Style */}
                    {doctorAnalysis && (
                      <div className="mt-4 p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-emerald-800">AI Recommendation</h4>
                        </div>
                        
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Best choice: <span className="text-emerald-700 font-semibold">Dr. {doctorAnalysis.best.doctor.name}</span>
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-600">Experience</span>
                                  <span className="font-medium text-gray-900">{doctorAnalysis.best.breakdown.experience.toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${doctorAnalysis.best.breakdown.experience}%` }} />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-600">Rating</span>
                                  <span className="font-medium text-gray-900">{doctorAnalysis.best.breakdown.rating.toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${doctorAnalysis.best.breakdown.rating}%` }} />
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-emerald-700 mt-3">
                              {doctorAnalysis.best.doctor.name} has a {doctorAnalysis.difference.toFixed(1)}% higher overall score based on experience, ratings, and fee value.
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-700">{doctorAnalysis.best.total.toFixed(1)}</p>
                            <p className="text-xs text-gray-500">vs {doctorAnalysis.other.total.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Doctors Grid - Google Cards Style */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Available Doctors</h3>
                <p className="text-sm text-gray-500">{filteredDoctors.length} results found</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doctor => (
                    <DoctorCard 
                      key={doctor.id} 
                      doctor={doctor} 
                      isCompared={selectedCompareDoctorIds.some((id) => Number(id) === Number(doctor.id))}
                      disableCompare={
                        selectedCompareDoctorIds.length >= 2 &&
                        !selectedCompareDoctorIds.some((id) => Number(id) === Number(doctor.id))
                      }
                      onToggleCompare={toggleCompareDoctor}
                      onBook={(doc) => {
                        setSelectedDoctor(doc);
                        setBookingPrefill(null);
                        setShowBookModal(true);
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full">
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                      <div className="w-24 h-24 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-12 h-12 text-indigo-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No doctors found</h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                        We couldn't find any doctors matching your criteria. Try adjusting your filters or search terms.
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setAddressFilter('');
                          setSelectedSpecialization('all');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <RefreshCw size={16} />
                        <span>Clear all filters</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination - Google Style (if needed) */}
              {filteredDoctors.length > 9 && (
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Showing 1-9 of {filteredDoctors.length} doctors</p>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                      1
                    </button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      3
                    </button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Google-style Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Records Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{medicalBillingSummary.totalVisits}</p>
                    <p className="text-xs text-gray-400 mt-2">Past appointments</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Completed Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{medicalBillingSummary.completedVisits}</p>
                    <p className="text-xs text-gray-400 mt-2">Consultations</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Diagnoses Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Diagnoses</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{diagnosisRecords.length}</p>
                    <p className="text-xs text-gray-400 mt-2">Medical records</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 4v2a5 5 0 01-10 0V8l-1-4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Prescriptions Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prescriptions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{prescriptionRecords.length}</p>
                    <p className="text-xs text-gray-400 mt-2">Active records</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lab Reports */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-base font-medium text-gray-700">Lab Reports</h2>
                  </div>
                  <span className="text-xs text-gray-400">{sharedLabReports.length} reports</span>
                </div>
              </div>
              <div className="p-6">
                {sharedLabReports.length === 0 ? (
                  <p className="text-sm text-gray-500">No lab reports shared yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sharedLabReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 rounded-lg p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.testName}</p>
                          <p className="text-xs text-gray-500">
                            {report.labName} • {report.patientName || 'Patient'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Shared on {new Date(report.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenSharedReport(report)}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 transition-colors"
                          >
                            View PDF
                          </button>
                          <button
                            onClick={() => handleDownloadSharedReport(report)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lab History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <FlaskConical className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-base font-medium text-gray-700">Lab History</h2>
                  </div>
                  {labHistoryRecords.length > 0 && (
                    <span className="text-xs text-gray-400">{labHistoryRecords.length} tests</span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {labHistoryRecords.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No lab history available.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labHistoryRecords.slice(0, 10).map((record) => {
                      const status = String(record?.status || 'PENDING').toUpperCase();
                      const statusClasses =
                        status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700';
                      return (
                        <div
                          key={`lab-${record.id}`}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200 rounded-lg p-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {record.testName || 'Lab Test'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.labName || 'Lab'} â€¢ {record.labCity || 'Location'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {record.appointmentDate || '-'} {record.appointmentTime || ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusClasses}`}>
                              {status}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              â‚¹{Number(record.testPrice || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Vitals Snapshot */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-rose-600" />
                    </div>
                    <h2 className="text-base font-medium text-gray-700">Vitals Snapshot</h2>
                  </div>
                  {patientVitals.length > 0 && (
                    <span className="text-xs text-gray-400">{patientVitals.length} records</span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {patientVitalsLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
                    Loading vitals...
                  </div>
                )}

                {!patientVitalsLoading && patientVitalsError && (
                  <div className="text-sm text-rose-600">{patientVitalsError}</div>
                )}

                {!patientVitalsLoading && !patientVitalsError && patientVitals.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No vitals recorded yet. Your doctor can add vitals during appointments.
                  </div>
                )}

                {!patientVitalsLoading && !patientVitalsError && patientVitals.length > 0 && (
                  <PatientVitalsDisplay vitals={patientVitals} detailed />
                )}
              </div>
            </div>

            {/* Vitals History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-base font-medium text-gray-700">Vitals History</h2>
                  </div>
                  {patientVitals.length > 0 && (
                    <span className="text-xs text-gray-400">Latest 10 records</span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {patientVitalsLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    Loading vitals history...
                  </div>
                )}

                {!patientVitalsLoading && patientVitalsError && (
                  <div className="text-sm text-rose-600">{patientVitalsError}</div>
                )}

                {!patientVitalsLoading && !patientVitalsError && patientVitals.length === 0 && (
                  <div className="text-sm text-gray-500">
                    No vitals history available.
                  </div>
                )}

                {!patientVitalsLoading && !patientVitalsError && patientVitals.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                          <th className="py-2 pr-4">Recorded</th>
                          <th className="py-2 pr-4">BP</th>
                          <th className="py-2 pr-4">HR</th>
                          <th className="py-2 pr-4">SpO2</th>
                          <th className="py-2 pr-4">Temp</th>
                          <th className="py-2 pr-4">Weight</th>
                          <th className="py-2 pr-4">Sugar</th>
                          <th className="py-2 pr-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientVitals.slice(0, 10).map((vital) => (
                          <tr key={vital.id} className="border-t border-gray-100">
                            <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">
                              {formatVitalDate(vital.recordedAt)}
                            </td>
                            <td className="py-2 pr-4 text-gray-700">
                              {vital.systolicBp && vital.diastolicBp
                                ? `${vital.systolicBp}/${vital.diastolicBp}`
                                : '-'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700">{vital.heartRate ?? '-'}</td>
                            <td className="py-2 pr-4 text-gray-700">
                              {vital.spo2 ? `${vital.spo2}%` : '-'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700">
                              {vital.temperature ? `${vital.temperature}°C` : '-'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700">
                              {vital.weight ? `${vital.weight} kg` : '-'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700">
                              {vital.bloodSugar ? `${vital.bloodSugar} mg/dL` : '-'}
                            </td>
                            <td className="py-2 pr-4 text-gray-700">
                              {vital.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Visit History Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-base font-medium text-gray-700">Visit History</h2>
                  </div>
                  {pastAppointmentsSorted.length > 0 && (
                    <span className="text-xs text-gray-400">{pastAppointmentsSorted.length} total visits</span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-2">
                    {pastAppointmentsSorted.slice(0, 10).map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {app.doctor?.name?.charAt(0) || app.doctorName?.charAt(0) || 'D'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Dr. {app.doctor?.name || app.doctorName}</p>
                            <p className="text-xs text-gray-500">{app.specialization}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-700">{app.appointmentDate}</p>
                          <p className="text-xs text-gray-400">₹{Number(app.consultationFee || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    
                    {pastAppointmentsSorted.length > 10 && (
                      <button className="w-full mt-4 text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-2">
                        View all {pastAppointmentsSorted.length} visits
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">No visit history available</p>
                    <p className="text-xs text-gray-400">Your past appointments will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lab Test Tab - CityCareLabs Component */}
        {activeTab === 'labtest' && (
          <div className="animate-fadeIn">
            {/* Optional header to maintain consistency */}
            <header className="mb-6">
           
            </header>
            <CityCareLabs />
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Google-style Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Conversations Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Conversations</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{messageThreads.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Unread Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Unread</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalUnreadMessages}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Pending Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {messageThreads.filter((t) => {
                        const s = String(t.appointmentStatus || '').toUpperCase();
                        return s === 'PENDING' || s === 'CONFIRMED';
                      }).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Messages Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Filter Bar */}
              <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'today', label: 'Today' },
                  { key: 'pending', label: 'Pending' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setMessageFilter(filter.key)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      messageFilter === filter.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Conversations Grid */}
              <div className="grid lg:grid-cols-3 min-h-[520px]">
                {/* Conversations List */}
                <div className="border-r border-gray-200 max-h-[520px] overflow-y-auto">
                  {messageThreadsLoading && (
                    <div className="px-4 py-6 text-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600" />
                      <p className="text-xs text-gray-500 mt-2">Loading conversations...</p>
                    </div>
                  )}
                  
                  {!messageThreadsLoading && filteredMessageThreads.length === 0 && (
                    <div className="px-4 py-12 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No conversations found</p>
                    </div>
                  )}
                  
                  {filteredMessageThreads.map((thread) => {
                    const lastAt = thread.lastMessageAt
                      ? new Date(thread.lastMessageAt).toLocaleString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '-';
                    
                    return (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => openMessageThread(thread.id)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          activeMessageThread?.id === thread.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">Dr. {thread.doctorName}</p>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">{lastAt}</span>
                        </div>
                        
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {thread.lastMessageText || 'No messages yet.'}
                        </p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {thread.appointmentStatus}
                          </span>
                          
                          {Number(thread.unreadCount || 0) > 0 && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500 text-white font-medium">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Message Area */}
                <div className="lg:col-span-2 flex flex-col min-h-[520px] bg-gray-50">
                  {activeMessageThread ? (
                    <>
                      {/* Chat Header */}
                      <div className="px-4 py-3 border-b border-gray-200 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Dr. {activeMessageThread.doctorName}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {activeMessageThread.appointmentDate} {activeMessageThread.appointmentTime} • {activeMessageThread.appointmentStatus}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${onlineByUserId[Number(activeMessageThread.doctorId)] ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="text-xs text-gray-500">
                                {onlineByUserId[Number(activeMessageThread.doctorId)] ? 'Online' : 'Offline'}
                              </span>
                            </div>
                            {typingByThread[String(activeMessageThread.id)] && (
                              <span className="text-xs text-gray-400 italic">typing...</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                        {messagesLoading && (
                          <div className="flex justify-center py-6">
                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600" />
                          </div>
                        )}
                        
                        {!messagesLoading &&
                          (threadMessagesById[String(activeMessageThread.id)] || []).map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[85%] ${msg.sender === 'patient' ? 'order-2' : ''}`}>
                                <div
                                  className={`px-3 py-2 rounded-lg text-sm ${
                                    msg.sender === 'patient'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white border border-gray-200 text-gray-700'
                                  }`}
                                >
                                  {msg.text}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1 px-1">{msg.time}</p>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Message Input */}
                      <div className="px-4 py-3 border-t border-gray-200 bg-white">
                        <div className="flex items-center gap-2">
                          <input
                            value={messageDraft}
                            onChange={(e) => handleDraftTyping(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                sendMessageToDoctor();
                              }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={sendMessageToDoctor}
                            disabled={!messageDraft.trim()}
                            className="text-sm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">Select a conversation to start messaging</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Google-inspired Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Total Spent Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹ {patientPaymentAnalytics.totalSpent.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-2">Lifetime</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Upcoming Liability Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Upcoming Liability</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹ {patientPaymentAnalytics.pendingAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-2">Due amount</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Transactions Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{patientPaymentAnalytics.totalTransactions}</p>
                    <p className="text-xs text-gray-400 mt-2">Completed</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Average Payment Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Average Payment</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹ {patientPaymentAnalytics.avgTransaction.toFixed(2)}</p>
                    <p className="text-xs text-gray-400 mt-2">Highest: ₹ {patientPaymentAnalytics.highestTransaction.toFixed(2)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Google-style Chart Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium text-gray-700">Monthly Spending Trend</h2>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Last 6 months</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="relative h-48">
                  {/* Chart grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="border-b border-gray-100 h-0" />
                    ))}
                  </div>
                  
                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-around pb-1">
                    {patientPaymentAnalytics.monthlySpend.map((item) => {
                      const maxAmount = Math.max(...patientPaymentAnalytics.monthlySpend.map(d => d.amount));
                      const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                      
                      return (
                        <div key={item.key} className="flex flex-col items-center w-12">
                          <div className="relative w-full flex justify-center mb-2">
                            <span className="text-xs font-medium text-gray-700">₹{item.amount.toFixed(0)}</span>
                          </div>
                          <div className="w-8 bg-gray-100 rounded-sm h-32 relative">
                            <div 
                              className="absolute bottom-0 w-full bg-blue-500 rounded-sm transition-all duration-500"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 mt-2">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-medium text-gray-700">Payment History</h2>
                      <p className="text-xs text-gray-400">
                        {patientPaymentAnalytics.paymentHistory.length} total transactions
                      </p>
                    </div>
                  </div>

                  {patientPaymentAnalytics.paymentHistory.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Total Spent</p>
                        <p className="text-sm font-medium text-gray-900">
                          ₹{patientPaymentAnalytics.paymentHistory.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-gray-200" />
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Avg. per visit</p>
                        <p className="text-sm font-medium text-gray-900">
                          ₹{(patientPaymentAnalytics.paymentHistory.reduce((sum, item) => sum + item.amount, 0) / patientPaymentAnalytics.paymentHistory.length).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Table or Empty State */}
              <div className="p-6">
                {patientPaymentAnalytics.paymentHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No payment history</h3>
                    <p className="text-xs text-gray-500 mb-6">Your transactions will appear here</p>
                    
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setShowNewAppointmentModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Book Appointment
                      </button>
                      <button
                        onClick={() => setActiveTab('doctors')}
                        className="px-4 py-2 bg-white text-gray-700 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Find Doctor
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                          <th className="pb-3 font-medium">Date & Time</th>
                          <th className="pb-3 font-medium">Doctor</th>
                          <th className="pb-3 font-medium">Visit Type</th>
                          <th className="pb-3 font-medium">Method</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {patientPaymentAnalytics.paymentHistory.slice(0, 12).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-3 text-xs">
                              <div>{item.date}</div>
                              <div className="text-gray-400">{item.time}</div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {item.doctorName.charAt(0)}
                                </div>
                                <span className="text-xs">Dr. {item.doctorName}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.visitType.toLowerCase() === 'online' 
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {item.visitType}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <span className="text-xs text-gray-600">{item.method}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <span className="text-sm font-medium">₹{item.amount.toFixed(2)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <ProfileCard user={user} patientDetails={patientDetails} />
            </div>

            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                    <Edit size={16} />
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                    <p className="font-medium text-gray-900">{patientDetails?.dateOfBirth || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Gender</p>
                    <p className="font-medium text-gray-900">{patientDetails?.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                    <p className="font-medium text-gray-900">{patientDetails?.bloodGroup || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Address</h2>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{patientDetails?.address || 'No address provided'}</p>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Contact Name</p>
                    <p className="font-medium text-gray-900">{patientDetails?.emergencyContactName || 'Not specified'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Contact Phone</p>
                    <p className="font-medium text-gray-900">{patientDetails?.emergencyContactPhone || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Insurance Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Provider</p>
                    <p className="font-medium text-gray-900">{patientDetails?.insuranceProvider || 'Not specified'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Policy Number</p>
                    <p className="font-medium text-gray-900">{patientDetails?.insurancePolicyNumber || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
                <nav className="space-y-2">
                  {[
                    { icon: User, label: 'Profile Settings' },
                    { icon: Bell, label: 'Notifications' },
                    { icon: Shield, label: 'Privacy & Security' },
                    { icon: Sun, label: 'Appearance' },
                    { icon: Clock, label: 'Preferences' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors text-left"
                    >
                      <item.icon size={18} className="text-indigo-500" />
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Appointment Reminders', default: true },
                    { label: 'Prescription Updates', default: true },
                    { label: 'Payment Confirmations', default: true },
                    { label: 'Health Tips & Articles', default: false },
                    { label: 'Promotional Emails', default: false },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          defaultChecked={item.default} 
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showBookModal && selectedDoctor && (
        <BookAppointmentModal
          isOpen={showBookModal}
          onClose={() => {
            setShowBookModal(false);
            setSelectedDoctor(null);
            setBookingPrefill(null);
          }}
          doctor={selectedDoctor}
          initialFormData={bookingPrefill}
          onSuccess={handleBookSuccess}
        />
      )}

      {showNewAppointmentModal && (
        <NewAppointmentModal
          isOpen={showNewAppointmentModal}
          onClose={() => setShowNewAppointmentModal(false)}
          doctors={doctors}
          patient={user}
          patientDetails={patientDetails}
          onSuccess={handleBookSuccess}
        />
      )}

      {showAutoReviewModal && autoReviewAppointment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              How was your appointment?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please rate Dr. {autoReviewAppointment.doctor?.name || autoReviewAppointment.doctorName || 'Doctor'}.
            </p>

            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAutoReviewRating(value)}
                  className="p-1 rounded hover:bg-amber-50"
                >
                  <Star
                    size={24}
                    className={autoReviewRating >= value ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={autoReviewText}
              onChange={(e) => setAutoReviewText(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="Write your review (optional)"
            />

            {autoReviewError && (
              <p className="text-sm text-rose-600 mt-2">{autoReviewError}</p>
            )}

            <div className="mt-5 flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAutoReviewModal(false);
                  setAutoReviewAppointment(null);
                  setAutoReviewError('');
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Later
              </button>
              <button
                type="button"
                onClick={handleSubmitAutoReview}
                disabled={autoReviewSubmitting || autoReviewRating === 0}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {autoReviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpcomingDetailsModal && selectedUpcomingAppointment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointment Details</h3>
              <button
                type="button"
                onClick={() => {
                  setShowUpcomingDetailsModal(false);
                  setSelectedUpcomingAppointment(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-gray-900">
                  {selectedUpcomingAppointment?.appointmentType === 'LAB'
                    ? `Lab: ${selectedUpcomingAppointment.labName || selectedUpcomingAppointment.doctorName || 'Lab'}`
                    : `Dr. ${selectedUpcomingAppointment.doctor?.name || selectedUpcomingAppointment.doctorName || 'Doctor'}`}
                </p>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  {selectedUpcomingAppointment.status || 'PENDING'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>
                  <span className="text-gray-500">Date:</span>{' '}
                  <span className="text-gray-900">{selectedUpcomingAppointment.appointmentDate || '-'}</span>
                </p>
                <p>
                  <span className="text-gray-500">Time:</span>{' '}
                  <span className="text-gray-900">{selectedUpcomingAppointment.appointmentTime || '-'}</span>
                </p>
                <p>
                  <span className="text-gray-500">Specialization:</span>{' '}
                  <span className="text-gray-900">{selectedUpcomingAppointment.specialization || 'General Medicine'}</span>
                </p>
                <p>
                  <span className="text-gray-500">Visit Type:</span>{' '}
                  <span className="text-gray-900 capitalize">
                      {String(selectedUpcomingAppointment.visitType || 'consultation').toLowerCase().replace('_', ' ')}
                    </span>
                  </p>
                <p>
                  <span className="text-gray-500">Fees:</span>{' '}
                  <span className="text-gray-900">
                    ₹ {Number(selectedUpcomingAppointment.consultationFee || selectedUpcomingAppointment.fee || 0).toFixed(2)}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Reason</p>
                <p className="text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  {selectedUpcomingAppointment.reason || 'Consultation'}
                </p>
              </div>

              {selectedUpcomingAppointment.symptoms && (
                <div>
                  <p className="text-gray-500 mb-1">Symptoms</p>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    {selectedUpcomingAppointment.symptoms}
                  </p>
                </div>
              )}

              {selectedUpcomingAppointment.notes && (
                <div>
                  <p className="text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    {selectedUpcomingAppointment.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUpcomingDetailsModal(false);
                  setSelectedUpcomingAppointment(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'].includes(
                String(selectedUpcomingAppointment.status || '').toUpperCase()
              ) && (
                <button
                  type="button"
                  onClick={() => handleCancelBookedAppointment(selectedUpcomingAppointment)}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <PatientChatbot userName={user?.name?.split(' ')[0] || 'there'} />
    </div>
  );
};

export default PatientDashboard;
