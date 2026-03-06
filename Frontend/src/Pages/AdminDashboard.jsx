// AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Stethoscope,
  User,
  
  Calendar,
  ArrowUp ,
  ArrowDown,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  LogOut,
  Search,
  ChevronLeft ,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  Download,
  RefreshCw,
  Home,
  Settings,
  BarChart3,
  Activity,
  Mail,
  Phone,
  MapPin,
  Award,
  DollarSign,
  FileText,
  ChevronRight,
  Bell,
  UserCheck,
  UserX,
  Loader,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Heart,
  Shield,
  Sun,
  Moon,
  CalendarDays,
  UsersRound,
  PieChart,
  Building,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import axios from 'axios';
import authService from '../services/AuthService';

// Constants
const API_BASE_URL = 'http://localhost:8080/api';
const REFRESH_INTERVAL = 30000;
const MESSAGE_TIMEOUT = 3000;

// Status configurations
const DOCTOR_STATUS = {
  PENDING_APPROVAL: { 
    label: 'Pending', 
    color: 'yellow',
    icon: Clock,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200'
  },
  ACTIVE: { 
    label: 'Approved', 
    color: 'green',
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  REJECTED: { 
    label: 'Rejected', 
    color: 'red',
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  }
};

const LAB_ENROLLMENT_STATUS = {
  PENDING: {
    label: 'Pending',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200'
  },
  APPROVED: {
    label: 'Approved',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  REJECTED: {
    label: 'Rejected',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  }
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
  ping: 'animate-ping',
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, color = 'blue', onClick }) => {
  const colorVariants = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
      light: 'bg-blue-100',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
      light: 'bg-green-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
      light: 'bg-purple-100',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      gradient: 'from-yellow-500 to-yellow-600',
      light: 'bg-yellow-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      gradient: 'from-red-500 to-red-600',
      light: 'bg-red-100',
    }
  };

  const classes = colorVariants[color] || colorVariants.blue;

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${classes.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${classes.text}`} />
        </div>
      </div>

      {/* Hover indicator */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, onView, onApprove, onReject, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const status = DOCTOR_STATUS[doctor.status] || DOCTOR_STATUS.PENDING_APPROVAL;
  const StatusIcon = status.icon;

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Avatar with animation */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
              {doctor.name?.charAt(0)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
              doctor.isOnline ? 'bg-green-500' : 'bg-gray-300'
            } ${doctor.isOnline ? 'animate-pulse' : ''}`} />
          </div>

          {/* Doctor Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  Dr. {doctor.name}
                </h3>
                <p className="text-sm text-gray-500">{doctor.specialization || 'General Practitioner'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 ${status.bgColor} ${status.textColor} px-3 py-1 rounded-full text-xs font-semibold`}>
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>
            </div>

            {/* Contact Details with animations */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 group/item">
                <Mail size={14} className="text-gray-400 group-hover/item:text-blue-500 transition-colors" />
                <span className="truncate">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 group/item">
                <Phone size={14} className="text-gray-400 group-hover/item:text-blue-500 transition-colors" />
                <span>{doctor.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 group/item">
                <Award size={14} className="text-gray-400 group-hover/item:text-blue-500 transition-colors" />
                <span>{doctor.experience || 0} years exp.</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 group/item">
                <DollarSign size={14} className="text-gray-400 group-hover/item:text-blue-500 transition-colors" />
                <span>₹{doctor.consultationFee || 'N/A'}/visit</span>
              </div>
            </div>

            {/* Clinic Address */}
            {doctor.clinicAddress && (
              <div className="mt-3 flex items-start gap-2 text-sm text-gray-500 group/item">
                <MapPin size={14} className="text-gray-400 mt-1 flex-shrink-0 group-hover/item:text-blue-500 transition-colors" />
                <span>{doctor.clinicAddress}</span>
              </div>
            )}

            {/* Action Buttons with slide-up animation on hover */}
            <div className={`mt-4 flex items-center justify-end gap-2 border-t pt-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-70'}`}>
              <button
                onClick={() => onView(doctor)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
                title="View Details"
              >
                <Eye size={18} className="text-gray-600 hover:text-blue-600 transition-colors" />
              </button>
              
              {doctor.status === 'PENDING_APPROVAL' && (
                <>
                  <button
                    onClick={() => onApprove(doctor)}
                    className="p-2 hover:bg-green-100 rounded-lg transition-all hover:scale-110"
                    title="Approve Doctor"
                  >
                    <Check size={18} className="text-green-600" />
                  </button>
                  <button
                    onClick={() => onReject(doctor.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                    title="Reject Doctor"
                  >
                    <XCircle size={18} className="text-red-600" />
                  </button>
                </>
              )}
              
              <button
                onClick={() => onDelete(doctor.id, 'doctor')}
                className="p-2 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                title="Delete Doctor"
              >
                <Trash2 size={18} className="text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick action overlay */}
      <div
        className={`absolute inset-0 bg-blue-600/5 backdrop-blur-sm flex items-center justify-center pointer-events-none opacity-0 transition-all duration-300 ${
          isHovered ? 'opacity-100' : ''
        }`}
      >
        <div className="bg-white rounded-xl p-3 shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
          <p className="text-sm font-medium text-gray-700">Quick actions</p>
          <div className="flex gap-2 mt-2">
            <button className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Mail size={16} className="text-blue-600" />
            </button>
            <button className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Calendar size={16} className="text-blue-600" />
            </button>
            <button className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <FileText size={16} className="text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Patient Table Row Component
const PatientRow = ({ patient, onView, onDelete, onBook }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr 
      className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
            {patient.name?.charAt(0)}
          </div>
          <span className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
            {patient.name}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-gray-600 group-hover:text-gray-900 transition-colors">{patient.email}</td>
      <td className="py-4 px-4 text-gray-600 group-hover:text-gray-900 transition-colors">{patient.phone}</td>
      <td className="py-4 px-4">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
          {patient.bloodGroup || 'N/A'}
        </span>
      </td>
      <td className="py-4 px-4 text-gray-600 group-hover:text-gray-900 transition-colors">{patient.city || 'N/A'}</td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(patient)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110"
            title="View Details"
          >
            <Eye size={18} className="text-gray-600 hover:text-blue-600 transition-colors" />
          </button>
          <button
            onClick={() => onBook(patient)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-all hover:scale-110"
            title="Book Appointment"
          >
            <Calendar size={18} className="text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(patient.id, 'patient')}
            className="p-2 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
            title="Delete Patient"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Activity Item Component
const ActivityItem = ({ activity, index }) => (
  <div className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 group hover:bg-gray-50 p-2 rounded-xl transition-all duration-300">
    <div className="relative">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Activity size={18} className="text-blue-600" />
      </div>
      {activity.unread && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
      )}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{activity.description}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-400">{activity.time}</span>
        {activity.type && (
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
            {activity.type}
          </span>
        )}
      </div>
    </div>
  </div>
);

// Notification Item Component
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
        isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isRead ? 'bg-gray-100' : 'bg-blue-100'
        }`}>
          <Bell className={`w-5 h-5 ${isRead ? 'text-gray-500' : 'text-blue-600'}`} />
        </div>
        {!isRead && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
          {notification.description || notification.message}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400">{notification.time}</span>
          {notification.type && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
              {notification.type}
            </span>
          )}
        </div>
      </div>

      {!isRead && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-blue-200 rounded-full">
            <Check size={14} className="text-blue-600" />
          </button>
        </div>
      )}
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ icon: Icon, title, description, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-200',
      light: 'bg-blue-50',
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-200',
      light: 'bg-green-50',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      shadow: 'shadow-purple-200',
      light: 'bg-purple-50',
    },
    yellow: {
      gradient: 'from-yellow-500 to-yellow-600',
      shadow: 'shadow-yellow-200',
      light: 'bg-yellow-50',
    },
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${classes.gradient} p-6 text-white shadow-lg ${classes.shadow} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full text-left`}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12 group-hover:scale-150 transition-transform duration-700 delay-100" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className={`w-12 h-12 ${classes.light} bg-opacity-20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-white/80 mb-4">{description}</p>
        <div className="flex items-center text-sm font-medium group-hover:gap-2 transition-all duration-300">
          <span>Get started</span>
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </button>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 animate-fadeIn" onClick={onClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className={`inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizes[size]} w-full animate-slideUp`}>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0,
    pendingDoctors: 0,
    averageDailyUsers: 0,
    averageDailyPatients: 0,
    averageDailyDoctors: 0,
    activeDoctors: 0,
    newUsersToday: 0,
    totalAppointments: 0,
    revenue: 0
  });
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [analytics, setAnalytics] = useState({
    days: 7,
    totalAppointments: 0,
    totalLabAppointments: 0,
    rangeAppointments: 0,
    rangeLabAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    activeDoctors: 0,
    newUsersToday: 0,
    totalRevenue: 0,
    revenueInRange: 0,
    dailyRegistrations: [],
    dailyAppointments: [],
    dailyLabAppointments: []
  });
  const [analyticsMonths, setAnalyticsMonths] = useState(6);
  const [detailedAnalytics, setDetailedAnalytics] = useState({
    months: 6,
    fromDate: '',
    toDate: '',
    totalCompletedAppointments: 0,
    totalRevenue: 0,
    topDoctors: [],
    monthlyTrends: []
  });
  
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [labEnrollments, setLabEnrollments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [labSearchTerm, setLabSearchTerm] = useState('');
  const [labStatusFilter, setLabStatusFilter] = useState('all');
  const [doctorSort, setDoctorSort] = useState('name_asc');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDoctorDetails, setShowDoctorDetails] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [doctorGrowthRange, setDoctorGrowthRange] = useState('weekly');
  const [patientGrowthRange, setPatientGrowthRange] = useState('weekly');
  const [labGrowthRange, setLabGrowthRange] = useState('weekly');
  const [appointmentTrendRange, setAppointmentTrendRange] = useState('daily');

  // Authentication
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Helper Functions
  const showTemporaryMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), MESSAGE_TIMEOUT);
  };

  const getFileName = (path) => {
    if (!path) return '—';
    return String(path).split(/[/\\\\]/).pop();
  };

  const isUnauthorizedError = (error) => {
    const status = error?.response?.status;
    return status === 401 || status === 403;
  };

  const isAdminRole = (role) => {
    if (!role) return false;
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  };

  const getAuthConfigOrNull = () => {
    const latestToken = localStorage.getItem('token');
    const latestUserRaw = localStorage.getItem('user');
    let latestUser = null;
    try {
      latestUser = latestUserRaw ? JSON.parse(latestUserRaw) : null;
    } catch {
      latestUser = null;
    }

    if (!latestToken || !isAdminRole(latestUser?.role)) {
      return null;
    }

    return {
      headers: {
        Authorization: `Bearer ${latestToken}`
      }
    };
  };

  // Data Fetching
  const fetchDashboardData = useCallback(async () => {
    const authConfig = getAuthConfigOrNull();
    if (!authConfig) {
      handleLogout();
      return;
    }

    setLoading(true);
    try {
      const [
        statsRes,
        doctorsRes,
        patientsRes,
        labEnrollmentsRes,
        activitiesRes,
        notificationsRes,
        analyticsRes,
        detailedAnalyticsRes
      ] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/users/stats`, authConfig),
        axios.get(`${API_BASE_URL}/users/doctors/details`, authConfig),
        axios.get(`${API_BASE_URL}/users/role/PATIENT`, authConfig),
        axios.get(`${API_BASE_URL}/lab-enrollments`, authConfig),
        axios.get(`${API_BASE_URL}/admin/activities`, authConfig),
        axios.get(`${API_BASE_URL}/admin/notifications`, authConfig).catch(() => ({ value: { data: [] } })),
        axios.get(`${API_BASE_URL}/users/analytics/overview?days=${analyticsDays}`, authConfig),
        axios.get(`${API_BASE_URL}/users/analytics/detailed?months=${analyticsMonths}`, authConfig)
      ]);

      const hasAuthFailure = [
        statsRes,
        doctorsRes,
        patientsRes,
        labEnrollmentsRes,
        activitiesRes,
        notificationsRes,
        analyticsRes,
        detailedAnalyticsRes
      ].some(
        (result) =>
          result.status === 'rejected' && isUnauthorizedError(result.reason)
      );

      if (hasAuthFailure) {
        handleLogout();
        return;
      }

      if (statsRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, ...statsRes.value.data }));
      }

      if (analyticsRes.status === 'fulfilled') {
        const data = analyticsRes.value.data || {};
        setAnalytics(data);
        setStats(prev => ({
          ...prev,
          totalAppointments: data.totalAppointments ?? prev.totalAppointments,
          revenue: data.totalRevenue ?? prev.revenue,
          activeDoctors: data.activeDoctors ?? prev.activeDoctors,
          newUsersToday: data.newUsersToday ?? prev.newUsersToday
        }));
      }

      if (detailedAnalyticsRes.status === 'fulfilled') {
        setDetailedAnalytics(detailedAnalyticsRes.value.data || {});
      }

      if (doctorsRes.status === 'fulfilled') {
        setDoctors(doctorsRes.value.data || []);
      }

      if (patientsRes.status === 'fulfilled') {
        setPatients(patientsRes.value.data || []);
      }

      if (labEnrollmentsRes.status === 'fulfilled') {
        setLabEnrollments(labEnrollmentsRes.value.data || []);
      }

      if (activitiesRes.status === 'fulfilled') {
        setRecentActivities(activitiesRes.value.data || []);
      }

      if (notificationsRes.status === 'fulfilled') {
        setNotifications(notificationsRes.value.data || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (isUnauthorizedError(error)) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [analyticsDays, analyticsMonths]);

  // Actions
  const handleApproveDoctor = async (doctorId) => {
    const authConfig = getAuthConfigOrNull();
    if (!authConfig) {
      handleLogout();
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/users/doctors/${doctorId}/approve`, {}, authConfig);
      showTemporaryMessage('success', 'Doctor approved successfully!');
      await fetchDashboardData();
      setShowApproveModal(false);
      setSelectedDoctor(null);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      const backendMessage = error?.response?.data?.error || error?.response?.data?.message;
      showTemporaryMessage('error', backendMessage || 'Failed to approve doctor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveEnrollment = async (enrollmentId) => {
    const authConfig = getAuthConfigOrNull();
    if (!authConfig) {
      handleLogout();
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/admin/lab-enrollments/${enrollmentId}/approve`, {}, authConfig);
      showTemporaryMessage('success', 'Lab enrollment approved.');
      await fetchDashboardData();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      const backendMessage = error?.response?.data?.error || error?.response?.data?.message;
      showTemporaryMessage('error', backendMessage || 'Failed to approve enrollment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    const authConfig = getAuthConfigOrNull();
    if (!authConfig) {
      handleLogout();
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/admin/lab-enrollments/${enrollmentId}/reject`, {}, authConfig);
      showTemporaryMessage('success', 'Lab enrollment rejected.');
      await fetchDashboardData();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      const backendMessage = error?.response?.data?.error || error?.response?.data?.message;
      showTemporaryMessage('error', backendMessage || 'Failed to reject enrollment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to reject this doctor?')) return;

    const authConfig = getAuthConfigOrNull();
    if (!authConfig) {
      handleLogout();
      return;
    }

    setActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/users/doctors/${doctorId}/reject`, {}, authConfig);
      showTemporaryMessage('success', 'Doctor rejected.');
      await fetchDashboardData();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      showTemporaryMessage('error', 'Failed to reject doctor.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userRole) => {
    if (!window.confirm(`Are you sure you want to delete this ${userRole}? This action cannot be undone.`)) return;

    const authConfig = getAuthConfigOrNull();
    if (!authConfig) {
      handleLogout();
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, authConfig);
      showTemporaryMessage('success', `${userRole} deleted successfully.`);
      await fetchDashboardData();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      showTemporaryMessage('error', 'Failed to delete user.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Effects
  useEffect(() => {
    const currentUserRaw = localStorage.getItem('user');
    let currentUser = null;
    try {
      currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
    } catch {
      currentUser = null;
    }

    if (!token || !isAdminRole(currentUser?.role)) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [navigate, token, fetchDashboardData]);

  const analyticsSeries = useMemo(() => {
    const byDate = new Map();
    const appointmentSeries = analytics.dailyAppointments || [];
    const registrationSeries = analytics.dailyRegistrations || [];

    appointmentSeries.forEach(item => {
      byDate.set(item.date, {
        date: item.date,
        appointments: item.count || 0,
        registrations: 0
      });
    });

    registrationSeries.forEach(item => {
      const existing = byDate.get(item.date) || {
        date: item.date,
        appointments: 0,
        registrations: 0
      };
      existing.registrations = item.count || 0;
      byDate.set(item.date, existing);
    });

    const rows = Array.from(byDate.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
    const maxValue = rows.reduce((max, row) => Math.max(max, row.appointments, row.registrations), 1);
    return { rows, maxValue };
  }, [analytics]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(value || 0));
  };

  const formatAvgIncrease = (value) => `Avg +${Number(value || 0).toFixed(2)}/day`;

  const monthlyTrend = useMemo(() => {
    const rows = detailedAnalytics.monthlyTrends || [];
    const maxAppointments = rows.reduce((max, row) => Math.max(max, row.appointments || 0), 1);
    const maxRevenue = rows.reduce((max, row) => Math.max(max, row.revenue || 0), 1);
    return { rows, maxAppointments, maxRevenue };
  }, [detailedAnalytics]);

  const appointmentAnalysis = useMemo(() => {
    const pending = Number(analytics.pendingAppointments || 0);
    const confirmed = Number(analytics.confirmedAppointments || 0);
    const completed = Number(analytics.completedAppointments || 0);
    const cancelled = Number(analytics.cancelledAppointments || 0);
    const totalInRange = pending + confirmed + completed + cancelled;

    const statusDistribution = [
      { key: 'pending', label: 'Pending', value: pending, color: '#f59e0b' },
      { key: 'confirmed', label: 'Confirmed', value: confirmed, color: '#3b82f6' },
      { key: 'completed', label: 'Completed', value: completed, color: '#22c55e' },
      { key: 'cancelled', label: 'Cancelled', value: cancelled, color: '#ef4444' }
    ].map((item) => ({
      ...item,
      percent: totalInRange > 0 ? (item.value / totalInRange) * 100 : 0
    }));

    const dailyAppointments = [...(analytics.dailyAppointments || [])]
      .map((item) => ({
        date: item.date,
        count: Number(item.count || 0)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const maxDailyAppointments = Math.max(1, ...dailyAppointments.map((row) => row.count));
    const totalDailyAppointments = dailyAppointments.reduce((sum, row) => sum + row.count, 0);
    const peakDaily = dailyAppointments.reduce(
      (best, row) => (row.count > (best?.count || -1) ? row : best),
      dailyAppointments[0] || null
    );

    const monthlyAppointments = [...(detailedAnalytics.monthlyTrends || [])]
      .map((item) => ({
        month: item.month,
        appointments: Number(item.appointments || 0),
        revenue: Number(item.revenue || 0)
      }))
      .sort((a, b) => String(a.month || '').localeCompare(String(b.month || '')));
    const maxMonthlyAppointments = Math.max(1, ...monthlyAppointments.map((row) => row.appointments));
    const maxMonthlyRevenue = Math.max(1, ...monthlyAppointments.map((row) => row.revenue));

    const completionRate = totalInRange > 0 ? ((completed / totalInRange) * 100).toFixed(1) : '0.0';
    const cancellationRate = totalInRange > 0 ? ((cancelled / totalInRange) * 100).toFixed(1) : '0.0';
    const averagePerDay =
      Number(analyticsDays) > 0 ? (Number(analytics.rangeAppointments || totalInRange) / Number(analyticsDays)).toFixed(1) : '0.0';

    return {
      totalInRange,
      completedInRange: completed,
      cancelledInRange: cancelled,
      completionRate,
      cancellationRate,
      averagePerDay,
      statusDistribution,
      dailyAppointments,
      maxDailyAppointments,
      totalDailyAppointments,
      peakDaily,
      monthlyAppointments,
      maxMonthlyAppointments,
      maxMonthlyRevenue
    };
  }, [analytics, detailedAnalytics, analyticsDays]);

  const formatMonth = (value) => {
    if (!value) return '-';
    const [year, month] = value.split('-').map(Number);
    if (!year || !month) return value;
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const appointmentTrend = useMemo(() => {
    const labDailyRaw = [...(analytics.dailyLabAppointments || [])]
      .map((item) => ({
        date: item.date,
        count: Number(item.count || 0)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const labDailyMap = new Map(labDailyRaw.map((row) => [row.date, row.count]));

    const dateKeys = Array.from(
      new Set([
        ...appointmentAnalysis.dailyAppointments.map((row) => row.date),
        ...labDailyRaw.map((row) => row.date)
      ])
    ).sort((a, b) => new Date(a) - new Date(b));

    const appointmentDailyMap = new Map(
      appointmentAnalysis.dailyAppointments.map((row) => [row.date, row.count])
    );

    const dailySeries = dateKeys.map((date) => ({
      key: date,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: appointmentDailyMap.get(date) || 0,
      labCount: labDailyMap.get(date) || 0
    }));

    const weeklyMap = new Map();
    dailySeries.forEach((row) => {
      const d = new Date(row.key);
      if (!Number.isFinite(d.getTime())) {
        return;
      }
      d.setHours(0, 0, 0, 0);
      const start = new Date(d);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = weeklyMap.get(key) || { key, label, count: 0, labCount: 0 };
      existing.count += row.count;
      weeklyMap.set(key, existing);
    });
    labDailyRaw.forEach((row) => {
      const d = new Date(row.date);
      if (!Number.isFinite(d.getTime())) {
        return;
      }
      d.setHours(0, 0, 0, 0);
      const start = new Date(d);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = weeklyMap.get(key) || { key, label, count: 0, labCount: 0 };
      existing.labCount += row.count;
      weeklyMap.set(key, existing);
    });
    const weeklySeries = Array.from(weeklyMap.values()).sort(
      (a, b) => new Date(a.key) - new Date(b.key)
    );

    const labMonthlyMap = new Map();
    labDailyRaw.forEach((row) => {
      const date = new Date(row.date);
      if (!Number.isFinite(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      labMonthlyMap.set(key, (labMonthlyMap.get(key) || 0) + row.count);
    });
    const monthlySeries = appointmentAnalysis.monthlyAppointments.map((row) => ({
      key: row.month,
      label: formatMonth(row.month),
      count: row.appointments,
      labCount: labMonthlyMap.get(row.month) || 0
    }));

    const series =
      appointmentTrendRange === 'monthly'
        ? monthlySeries
        : appointmentTrendRange === 'weekly'
          ? weeklySeries
          : dailySeries;

    const max = Math.max(1, ...series.map((row) => Math.max(row.count, row.labCount || 0)));
    const total = series.reduce((sum, row) => sum + row.count, 0);
    const labTotal = series.reduce((sum, row) => sum + (row.labCount || 0), 0);
    const peak = series.reduce(
      (best, row) => (row.count > (best?.count || -1) ? row : best),
      series[0] || null
    );

    const title =
      appointmentTrendRange === 'monthly'
        ? 'Monthly Appointments Trend'
        : appointmentTrendRange === 'weekly'
          ? 'Weekly Appointments Trend'
          : 'Daily Appointments Trend';

    const rangeLabel =
      appointmentTrendRange === 'monthly'
        ? `Last ${analyticsMonths} months`
        : appointmentTrendRange === 'weekly'
          ? `Last ${Math.max(1, Math.ceil(analyticsDays / 7))} weeks`
          : `Last ${analyticsDays} days`;

    const peakLabel =
      appointmentTrendRange === 'weekly'
        ? (peak ? `Week of ${peak.label}` : '-')
        : (peak?.label || '-');

    return { series, max, total, labTotal, peak, title, rangeLabel, peakLabel };
  }, [appointmentAnalysis, appointmentTrendRange, analyticsDays, analyticsMonths, analytics.dailyLabAppointments]);

  // Filtered Data
  const filteredDoctors = useMemo(() => {
    const filtered = doctors.filter(doctor => {
      const matchesSearch = 
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      return matchesSearch && doctor.status === filterStatus;
    });

    return filtered.sort((a, b) => {
      if (doctorSort === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (doctorSort === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (doctorSort === 'experience_desc') return (b.experience || 0) - (a.experience || 0);
      if (doctorSort === 'fee_desc') return (Number(b.consultationFee) || 0) - (Number(a.consultationFee) || 0);
      return 0;
    });
  }, [doctors, searchTerm, filterStatus, doctorSort]);

  const filteredLabEnrollments = useMemo(() => {
    const term = labSearchTerm.toLowerCase();
    const filtered = labEnrollments.filter((enrollment) => {
      const matchesSearch =
        enrollment.labName?.toLowerCase().includes(term) ||
        enrollment.email?.toLowerCase().includes(term) ||
        enrollment.city?.toLowerCase().includes(term) ||
        enrollment.contactPersonName?.toLowerCase().includes(term);

      if (labStatusFilter === 'all') return matchesSearch;
      return matchesSearch && String(enrollment.status || '').toUpperCase() === labStatusFilter;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [labEnrollments, labSearchTerm, labStatusFilter]);

  const doctorMetrics = useMemo(() => ({
    total: doctors.length,
    pending: doctors.filter(d => d.status === 'PENDING_APPROVAL').length,
    active: doctors.filter(d => d.status === 'ACTIVE').length,
    rejected: doctors.filter(d => d.status === 'REJECTED').length
  }), [doctors]);

  const doctorGrowthAnalysis = useMemo(() => {
    const now = new Date();
    const toDate = (value) => {
      const d = value ? new Date(value) : null;
      return d && Number.isFinite(d.getTime()) ? d : null;
    };

    const doctorCreatedDates = doctors
      .map((doctor) => toDate(doctor.createdAt || doctor.created_at || doctor.registeredAt || doctor.dateCreated))
      .filter(Boolean);

    const countInRange = (startDaysAgo, endDaysAgo = 0) => {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - startDaysAgo);

      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      end.setDate(end.getDate() - endDaysAgo);

      return doctorCreatedDates.filter((d) => d >= start && d <= end).length;
    };

    const hasCreatedAtData = doctorCreatedDates.length > 0;
    const weekNew = hasCreatedAtData
      ? countInRange(6, 0)
      : Math.round(Number(stats.averageDailyDoctors || 0) * 7);
    const prevWeekNew = hasCreatedAtData
      ? countInRange(13, 7)
      : Math.round(Number(stats.averageDailyDoctors || 0) * 7);
    const monthNew = hasCreatedAtData
      ? countInRange(29, 0)
      : Math.round(Number(stats.averageDailyDoctors || 0) * 30);
    const prevMonthNew = hasCreatedAtData
      ? countInRange(59, 30)
      : Math.round(Number(stats.averageDailyDoctors || 0) * 30);

    const growthPct = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const weeklySeries = Array.from({ length: 8 }, (_, idx) => {
      const endDaysAgo = (7 - idx) * 7;
      const startDaysAgo = endDaysAgo + 6;
      const start = new Date(now);
      start.setDate(start.getDate() - startDaysAgo);
      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        label,
        count: hasCreatedAtData ? countInRange(startDaysAgo, endDaysAgo) : 0
      };
    });
    const weeklyMax = Math.max(1, ...weeklySeries.map((row) => row.count));

    const dailySeries = Array.from({ length: 14 }, (_, idx) => {
      const daysAgo = 13 - idx;
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        label,
        count: hasCreatedAtData ? countInRange(daysAgo, daysAgo) : 0
      };
    });
    const dailyMax = Math.max(1, ...dailySeries.map((row) => row.count));

    const monthlySeries = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      return {
        label,
        count: hasCreatedAtData
          ? doctorCreatedDates.filter(
              (d) => d.getFullYear() === year && d.getMonth() === month
            ).length
          : 0
      };
    });
    const monthlyMax = Math.max(1, ...monthlySeries.map((row) => row.count));

    return {
      hasCreatedAtData,
      weekNew,
      prevWeekNew,
      monthNew,
      prevMonthNew,
      weekGrowthPct: growthPct(weekNew, prevWeekNew),
      monthGrowthPct: growthPct(monthNew, prevMonthNew),
      weeklySeries,
      weeklyMax,
      dailySeries,
      dailyMax,
      monthlySeries,
      monthlyMax
    };
  }, [doctors, stats.averageDailyDoctors]);

  const doctorGrowthSeries =
    doctorGrowthRange === 'daily'
      ? doctorGrowthAnalysis.dailySeries
      : doctorGrowthRange === 'monthly'
        ? doctorGrowthAnalysis.monthlySeries
        : doctorGrowthAnalysis.weeklySeries;

  const doctorGrowthMax =
    doctorGrowthRange === 'daily'
      ? doctorGrowthAnalysis.dailyMax
      : doctorGrowthRange === 'monthly'
        ? doctorGrowthAnalysis.monthlyMax
        : doctorGrowthAnalysis.weeklyMax;

  const doctorGrowthTotal = doctorGrowthSeries.reduce((sum, item) => sum + item.count, 0);
  const doctorGrowthAvg = doctorGrowthSeries.length
    ? doctorGrowthTotal / doctorGrowthSeries.length
    : 0;

  const doctorGrowthRangeLabel =
    doctorGrowthRange === 'daily'
      ? 'Last 14 days'
      : doctorGrowthRange === 'monthly'
        ? 'Last 6 months'
        : 'Last 8 weeks';

  const patientGrowthAnalysis = useMemo(() => {
    const now = new Date();
    const toDate = (value) => {
      const d = value ? new Date(value) : null;
      return d && Number.isFinite(d.getTime()) ? d : null;
    };

    const patientCreatedDates = patients
      .map((patient) => toDate(patient.createdAt || patient.created_at || patient.registeredAt || patient.dateCreated))
      .filter(Boolean);

    const countInRange = (startDaysAgo, endDaysAgo = 0) => {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - startDaysAgo);

      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      end.setDate(end.getDate() - endDaysAgo);

      return patientCreatedDates.filter((d) => d >= start && d <= end).length;
    };

    const hasCreatedAtData = patientCreatedDates.length > 0;
    const weekNew = hasCreatedAtData
      ? countInRange(6, 0)
      : Math.round(Number(stats.averageDailyPatients || 0) * 7);
    const prevWeekNew = hasCreatedAtData
      ? countInRange(13, 7)
      : Math.round(Number(stats.averageDailyPatients || 0) * 7);
    const monthNew = hasCreatedAtData
      ? countInRange(29, 0)
      : Math.round(Number(stats.averageDailyPatients || 0) * 30);
    const prevMonthNew = hasCreatedAtData
      ? countInRange(59, 30)
      : Math.round(Number(stats.averageDailyPatients || 0) * 30);

    const growthPct = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const weeklySeries = Array.from({ length: 8 }, (_, idx) => {
      const endDaysAgo = (7 - idx) * 7;
      const startDaysAgo = endDaysAgo + 6;
      const start = new Date(now);
      start.setDate(start.getDate() - startDaysAgo);
      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        label,
        count: hasCreatedAtData ? countInRange(startDaysAgo, endDaysAgo) : 0
      };
    });
    const weeklyMax = Math.max(1, ...weeklySeries.map((row) => row.count));

    const dailySeries = Array.from({ length: 14 }, (_, idx) => {
      const daysAgo = 13 - idx;
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        label,
        count: hasCreatedAtData ? countInRange(daysAgo, daysAgo) : 0
      };
    });
    const dailyMax = Math.max(1, ...dailySeries.map((row) => row.count));

    const monthlySeries = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      return {
        label,
        count: hasCreatedAtData
          ? patientCreatedDates.filter(
              (d) => d.getFullYear() === year && d.getMonth() === month
            ).length
          : 0
      };
    });
    const monthlyMax = Math.max(1, ...monthlySeries.map((row) => row.count));

    return {
      hasCreatedAtData,
      weekNew,
      prevWeekNew,
      monthNew,
      prevMonthNew,
      weekGrowthPct: growthPct(weekNew, prevWeekNew),
      monthGrowthPct: growthPct(monthNew, prevMonthNew),
      weeklySeries,
      weeklyMax,
      dailySeries,
      dailyMax,
      monthlySeries,
      monthlyMax
    };
  }, [patients, stats.averageDailyPatients]);

  const patientGrowthSeries =
    patientGrowthRange === 'daily'
      ? patientGrowthAnalysis.dailySeries
      : patientGrowthRange === 'monthly'
        ? patientGrowthAnalysis.monthlySeries
        : patientGrowthAnalysis.weeklySeries;

  const patientGrowthMax =
    patientGrowthRange === 'daily'
      ? patientGrowthAnalysis.dailyMax
      : patientGrowthRange === 'monthly'
        ? patientGrowthAnalysis.monthlyMax
        : patientGrowthAnalysis.weeklyMax;

  const patientGrowthTotal = patientGrowthSeries.reduce((sum, item) => sum + item.count, 0);
  const patientGrowthAvg = patientGrowthSeries.length
    ? patientGrowthTotal / patientGrowthSeries.length
    : 0;

  const patientGrowthRangeLabel =
    patientGrowthRange === 'daily'
      ? 'Last 14 days'
      : patientGrowthRange === 'monthly'
        ? 'Last 6 months'
        : 'Last 8 weeks';

  const labGrowthAnalysis = useMemo(() => {
    const now = new Date();
    const toDate = (value) => {
      const d = value ? new Date(value) : null;
      return d && Number.isFinite(d.getTime()) ? d : null;
    };

    const labCreatedDates = labEnrollments
      .map((lab) => toDate(lab.createdAt || lab.created_at || lab.registeredAt || lab.dateCreated))
      .filter(Boolean);

    const countInRange = (startDaysAgo, endDaysAgo = 0) => {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - startDaysAgo);

      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      end.setDate(end.getDate() - endDaysAgo);

      return labCreatedDates.filter((d) => d >= start && d <= end).length;
    };

    const hasCreatedAtData = labCreatedDates.length > 0;
    const weekNew = hasCreatedAtData ? countInRange(6, 0) : 0;
    const prevWeekNew = hasCreatedAtData ? countInRange(13, 7) : 0;
    const monthNew = hasCreatedAtData ? countInRange(29, 0) : 0;
    const prevMonthNew = hasCreatedAtData ? countInRange(59, 30) : 0;

    const growthPct = (current, previous) => {
      if (!previous) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const weeklySeries = Array.from({ length: 8 }, (_, idx) => {
      const endDaysAgo = (7 - idx) * 7;
      const startDaysAgo = endDaysAgo + 6;
      const start = new Date(now);
      start.setDate(start.getDate() - startDaysAgo);
      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        label,
        count: hasCreatedAtData ? countInRange(startDaysAgo, endDaysAgo) : 0
      };
    });
    const weeklyMax = Math.max(1, ...weeklySeries.map((row) => row.count));

    const dailySeries = Array.from({ length: 14 }, (_, idx) => {
      const daysAgo = 13 - idx;
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        label,
        count: hasCreatedAtData ? countInRange(daysAgo, daysAgo) : 0
      };
    });
    const dailyMax = Math.max(1, ...dailySeries.map((row) => row.count));

    const monthlySeries = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      return {
        label,
        count: hasCreatedAtData
          ? labCreatedDates.filter(
              (d) => d.getFullYear() === year && d.getMonth() === month
            ).length
          : 0
      };
    });
    const monthlyMax = Math.max(1, ...monthlySeries.map((row) => row.count));

    return {
      hasCreatedAtData,
      weekNew,
      prevWeekNew,
      monthNew,
      prevMonthNew,
      weekGrowthPct: growthPct(weekNew, prevWeekNew),
      monthGrowthPct: growthPct(monthNew, prevMonthNew),
      weeklySeries,
      weeklyMax,
      dailySeries,
      dailyMax,
      monthlySeries,
      monthlyMax
    };
  }, [labEnrollments]);

  const labGrowthSeries =
    labGrowthRange === 'daily'
      ? labGrowthAnalysis.dailySeries
      : labGrowthRange === 'monthly'
        ? labGrowthAnalysis.monthlySeries
        : labGrowthAnalysis.weeklySeries;

  const labGrowthMax =
    labGrowthRange === 'daily'
      ? labGrowthAnalysis.dailyMax
      : labGrowthRange === 'monthly'
        ? labGrowthAnalysis.monthlyMax
        : labGrowthAnalysis.weeklyMax;

  const labGrowthTotal = labGrowthSeries.reduce((sum, item) => sum + item.count, 0);
  const labGrowthAvg = labGrowthSeries.length
    ? labGrowthTotal / labGrowthSeries.length
    : 0;

  const labGrowthRangeLabel =
    labGrowthRange === 'daily'
      ? 'Last 14 days'
      : labGrowthRange === 'monthly'
        ? 'Last 6 months'
        : 'Last 8 weeks';

  const userAnalysis = useMemo(() => {
    const totalUsers = Number(stats.totalUsers || 0);
    const totalPatients = Number(stats.totalPatients || 0);
    const totalDoctors = Number(stats.totalDoctors || 0);
    const totalAdmins = Number(stats.totalAdmins || 0);
    const totalLabs = Number(labEnrollments.length || 0);

    const activePatients = patients.filter(p => p.status === 'ACTIVE').length;
    const suspendedPatients = patients.filter(p => p.status === 'SUSPENDED').length;
    const activeDoctors = doctors.filter(d => d.status === 'ACTIVE').length;
    const pendingDoctors = doctors.filter(d => d.status === 'PENDING_APPROVAL').length;
    const rejectedDoctors = doctors.filter(d => d.status === 'REJECTED').length;

    const asPercent = (value, total) => {
      if (!total) return '0.0';
      return ((value / total) * 100).toFixed(1);
    };

    return {
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAdmins,
      totalLabs,
      activePatients,
      suspendedPatients,
      activeDoctors,
      pendingDoctors,
      rejectedDoctors,
      patientShare: asPercent(totalPatients, totalUsers),
      doctorShare: asPercent(totalDoctors, totalUsers),
      adminShare: asPercent(totalAdmins, totalUsers),
      labShare: asPercent(totalLabs, totalUsers),
      activeDoctorShare: asPercent(activeDoctors, totalDoctors),
      pendingDoctorShare: asPercent(pendingDoctors, totalDoctors),
      rejectedDoctorShare: asPercent(rejectedDoctors, totalDoctors),
      activePatientShare: asPercent(activePatients, totalPatients),
      suspendedPatientShare: asPercent(suspendedPatients, totalPatients)
    };
  }, [stats, patients, doctors, labEnrollments]);

  const roleDistribution = useMemo(() => {
    const total = Number(userAnalysis.totalUsers || 0);
    const items = [
      { key: 'patients', label: 'Patients', value: Number(userAnalysis.totalPatients || 0), color: '#22c55e' },
      { key: 'doctors', label: 'Doctors', value: Number(userAnalysis.totalDoctors || 0), color: '#4f46e5' },
      { key: 'labs', label: 'Labs', value: Number(userAnalysis.totalLabs || 0), color: '#f97316' },
      { key: 'admins', label: 'Admins', value: Number(userAnalysis.totalAdmins || 0), color: '#f59e0b' }
    ];
    return items.map((item) => ({
      ...item,
      percent: total > 0 ? (item.value / total) * 100 : 0
    }));
  }, [userAnalysis]);

  const doctorStatusDistribution = useMemo(() => {
    const total = Number(userAnalysis.totalDoctors || 0);
    const items = [
      { key: 'active', label: 'Active', value: Number(userAnalysis.activeDoctors || 0), color: '#22c55e' },
      { key: 'pending', label: 'Pending', value: Number(userAnalysis.pendingDoctors || 0), color: '#eab308' },
      { key: 'rejected', label: 'Rejected', value: Number(userAnalysis.rejectedDoctors || 0), color: '#ef4444' }
    ];
    return items.map((item) => ({
      ...item,
      percent: total > 0 ? (item.value / total) * 100 : 0
    }));
  }, [userAnalysis]);

  const patientStatusDistribution = useMemo(() => {
    const total = Number(userAnalysis.totalPatients || 0);
    const items = [
      { key: 'active', label: 'Active', value: Number(userAnalysis.activePatients || 0), color: '#3b82f6' },
      { key: 'suspended', label: 'Suspended', value: Number(userAnalysis.suspendedPatients || 0), color: '#ef4444' }
    ];
    return items.map((item) => ({
      ...item,
      percent: total > 0 ? (item.value / total) * 100 : 0
    }));
  }, [userAnalysis]);

  const buildConicGradient = (items) => {
    let current = 0;
    const parts = items.map((item) => {
      const start = current;
      current += item.percent;
      return `${item.color} ${start}% ${Math.min(current, 100)}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  };

  const pendingCount = doctors.filter(d => d.status === 'PENDING_APPROVAL').length;
  const totalLabs = labEnrollments.length;
  const pendingLabEnrollments = labEnrollments.filter(
    (enrollment) => String(enrollment.status || '').toUpperCase() === 'PENDING'
  ).length;

  // Loading State
  if (loading && !doctors.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-blue-100 border-t-blue-400 rounded-full animate-spin-slow" />
              <Activity className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium mt-6">Loading admin dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Navigation Bar */}
<nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-sm z-40 border-b border-blue-100/30 animate-slideDown">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-20">
      {/* Logo and Brand with enhanced styling */}
      <div 
        className="flex items-center gap-3 group cursor-pointer" 
        onClick={() => setActiveTab('overview')}
      >
        <div className="relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity animate-pulse-slow"></div>
          {/* Logo */}
          <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg shadow-blue-200/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <span className="text-xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MedFlow</span>
          </span>
          <span className="block text-xs text-gray-400 font-medium">Admin Dashboard</span>
        </div>
      </div>

      {/* Desktop Navigation Links with Google-style hover effects */}
      <div className="hidden md:flex items-center space-x-1">
        {[
                { id: 'overview', icon: Home, label: 'Overview' },
                { id: 'lab-enrollments', icon: FileText, label: 'Lab Enrollments', badge: pendingLabEnrollments },
                { id: 'appointments', icon: Calendar, label: 'Appointments' },
                { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative px-4 py-2 rounded-xl transition-all duration-300 group flex items-center gap-2 ${
              activeTab === item.id 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-200' 
                : 'text-gray-600 hover:bg-blue-50/50 hover:text-blue-600'
            }`}
          >
            <item.icon 
              size={18} 
              className={`transition-colors ${
                activeTab === item.id 
                  ? 'text-blue-600' 
                  : 'text-gray-400 group-hover:text-blue-500'
              }`} 
            />
            <span className="text-sm font-medium">{item.label}</span>
            
            {/* Animated underline for active tab */}
            {activeTab === item.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></span>
            )}
            
            {/* Badge with animation */}
            {item.badge > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-red-200 animate-bounce-slow">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right Side Actions with Google-style buttons */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group border border-gray-200 hover:border-blue-200"
          >
            <Bell size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
            {notifications.length > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              </>
            )}
          </button>

          {/* Notifications Dropdown - Google Style */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-slideDown z-50">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bell size={16} className="text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                    Mark all read
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
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
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center">
                      <Bell className="w-8 h-8 text-blue-300" />
                    </div>
                    <p className="text-gray-900 font-medium">No notifications</p>
                    <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button with Google-style */}
        <button
          onClick={fetchDashboardData}
          className="p-2.5 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group border border-gray-200 hover:border-blue-200"
          title="Refresh Data"
        >
          <RefreshCw size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors group-hover:rotate-180 transition-all duration-500" />
        </button>

        {/* Theme Toggle with Google-style */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group border border-gray-200 hover:border-blue-200"
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? 
            <Sun size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" /> : 
            <Moon size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
          }
        </button>

        {/* User Menu - Google Style */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-sm transition-all duration-300 group border border-gray-200 hover:border-blue-200"
          >
            {/* User Avatar with gradient */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0) || 'A'}
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-gray-900">{user?.name?.split(' ')[0] || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            
            <ChevronDown 
              size={16} 
              className={`text-gray-500 hidden lg:block transition-all duration-300 ${
                showUserMenu ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {/* User Menu Dropdown - Google Style */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-slideDown z-50">
              {/* User info header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email || 'admin@medflow.com'}</p>
                  </div>
                </div>
              </div>
              
              {/* Menu items */}
              <div className="p-2">
                {[
                  { icon: User, label: 'Your Profile', tab: 'settings', description: 'View and edit profile' },
                  { icon: Settings, label: 'Settings', tab: 'settings', description: 'App preferences' },
                  { icon: HelpCircle, label: 'Help & Support', tab: 'help', description: 'Get assistance' },
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <item.icon size={16} className="text-blue-500" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </button>
                ))}
                
                <div className="border-t border-gray-100 my-2" />
                
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <LogOut size={16} className="text-red-500" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium text-red-600">Logout</span>
                    <p className="text-xs text-gray-400">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button with Google-style */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-200 hover:border-blue-200"
        >
          {mobileMenuOpen ? 
            <X size={20} className="text-gray-600" /> : 
            <Menu size={20} className="text-gray-600" />
          }
        </button>
      </div>
    </div>
  </div>

  {/* Mobile Navigation Menu - Google Style */}
  {mobileMenuOpen && (
    <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'overview', icon: Home, label: 'Overview' },
            { id: 'lab-enrollments', icon: FileText, label: 'Lab Enrollments', badge: pendingLabEnrollments },
            { id: 'appointments', icon: Calendar, label: 'Appointments' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200' 
                  : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-100 hover:border-blue-200'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-blue-600' : ''} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              
              {/* Badge for mobile */}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* User info in mobile menu */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@medflow.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</nav>



      {/* Main Content */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'doctors' && 'Doctor Management'}
              {activeTab === 'patients' && 'Patient Management'}
              {activeTab === 'lab-enrollments' && 'Lab Enrollment Requests'}
              {activeTab === 'appointments' && 'Appointment Management'}
              {/* {activeTab === 'analytics' && 'Analytics & Reports'} */}
              {activeTab === 'settings' && 'System Settings'}
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <Calendar size={16} className="text-blue-400" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Quick Stats in Header */}
          {activeTab === 'overview' && (
            <div className="hidden lg:flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Users</p>
                  <p className="text-sm font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Doctors</p>
                  <p className="text-sm font-bold text-green-600">{stats.totalDoctors}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Labs</p>
                  <p className="text-sm font-bold text-amber-600">{totalLabs}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-sm font-bold text-yellow-600">{pendingCount}</p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slideDown ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}







        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Grid */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={Users}
                label="Total Users"
                value={stats.totalUsers}
                color="blue"
                trend={formatAvgIncrease(stats.averageDailyUsers)}
                onClick={() => {}}
              />
              <StatCard 
                icon={User}
                label="Total Patients"
                value={stats.totalPatients}
                color="green"
                trend={formatAvgIncrease(stats.averageDailyPatients)}
                onClick={() => setActiveTab('patients')}
              />
              <StatCard 
                icon={Stethoscope}
                label="Total Doctors"
                value={stats.totalDoctors}
                color="purple"
                trend={formatAvgIncrease(stats.averageDailyDoctors)}
                onClick={() => setActiveTab('doctors')}
              />
              <StatCard 
                icon={Clock}
                label="Pending Approvals"
                value={stats.pendingDoctors}
                color="yellow"
                onClick={() => {
                  setActiveTab('doctors');
                  setFilterStatus('PENDING_APPROVAL');
                }}
              />
            </div> */}

{/* Quick Actions - Google Style Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Add New Doctor Card */}
  <div 
    onClick={() => navigate('/register')}
    className="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 cursor-pointer"
  >
    <div className="p-6">
      {/* Icon container - Google's subtle colored circles */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <UserPlus className="w-5 h-5 text-blue-600" />
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-auto" />
      </div>
      
      {/* Content - Clean and minimal */}
      <h3 className="text-base font-medium text-gray-900 mb-1">
        Add New Doctor
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        Invite a new doctor to join the platform
      </p>
      
      {/* Subtle metadata */}
      <div className="mt-4 text-xs text-gray-400">
        Quick action • 1 min
      </div>
    </div>
  </div>

  {/* Create Appointment Card */}
  <div 
    onClick={() => setActiveTab('patients')}
    className="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 cursor-pointer"
  >
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
          <Calendar className="w-5 h-5 text-green-600" />
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-auto" />
      </div>
      
      <h3 className="text-base font-medium text-gray-900 mb-1">
        Create Appointment
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        Schedule a new appointment for a patient
      </p>
      
      <div className="mt-4 text-xs text-gray-400">
        Quick action • 2 min
      </div>
    </div>
  </div>

  {/* Generate Report Card */}
  <div 
    onClick={() => setActiveTab('analytics')}
    className="group relative bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 cursor-pointer"
  >
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
          <BarChart3 className="w-5 h-5 text-purple-600" />
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-auto" />
      </div>
      
      <h3 className="text-base font-medium text-gray-900 mb-1">
        Generate Report
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        Create detailed analytics report
      </p>
      
      <div className="mt-4 text-xs text-gray-400">
        Quick action • 5 min
      </div>
    </div>
  </div>
</div>

{/* People Directory - Google's material design */}
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
  <div className="flex items-center justify-between gap-4 flex-wrap">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
        <Users className="w-5 h-5 text-gray-600" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-900">People Directory</h3>
        <p className="text-xs text-gray-500 mt-0.5">Jump to doctor or patient management</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={() => setActiveTab('doctors')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <Stethoscope size={16} />
        View Doctors
      </button>
      <button
        onClick={() => setActiveTab('patients')}
        className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <User size={16} />
        View Patients
      </button>
    </div>
  </div>
</div>

{/* Doctor Growth Analysis - Google Analytics style */}
<div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
  {/* Header - Clean and minimal */}
  <div className="px-6 py-4 border-b border-gray-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
          <TrendingUp size={16} className="text-gray-600" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-900">Doctor Growth Analysis</h2>
          <p className="text-xs text-gray-500 mt-0.5">Registration trends and growth metrics</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100">
          {doctorGrowthRangeLabel}
        </span>
        <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors">
          <Download size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  </div>

  {/* KPI Cards - Clean grid with dividers */}
  <div className="grid grid-cols-2 lg:grid-cols-4">
    <div className="px-6 py-4 border-r border-gray-100">
      <p className="text-xs text-gray-500 mb-1">New (7d)</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-semibold text-gray-900">{doctorGrowthAnalysis.weekNew}</p>
        <span className={`text-xs font-medium ${doctorGrowthAnalysis.weekGrowthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {doctorGrowthAnalysis.weekGrowthPct >= 0 ? '↑' : '↓'} {Math.abs(doctorGrowthAnalysis.weekGrowthPct)}%
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">vs previous 7 days</p>
    </div>
    
    <div className="px-6 py-4 border-r border-gray-100">
      <p className="text-xs text-gray-500 mb-1">New (30d)</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-semibold text-gray-900">{doctorGrowthAnalysis.monthNew}</p>
        <span className={`text-xs font-medium ${doctorGrowthAnalysis.monthGrowthPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {doctorGrowthAnalysis.monthGrowthPct >= 0 ? '↑' : '↓'} {Math.abs(doctorGrowthAnalysis.monthGrowthPct)}%
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">vs previous 30 days</p>
    </div>
    
    <div className="px-6 py-4 border-r border-gray-100">
      <p className="text-xs text-gray-500 mb-1">Avg. Weekly</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-semibold text-gray-900">
          {(doctorGrowthAnalysis.weeklySeries.reduce((sum, item) => sum + item.count, 0) / 8).toFixed(1)}
        </p>
      </div>
      <p className="text-xs text-gray-400 mt-1">per week (last 8 weeks)</p>
    </div>
    
    <div className="px-6 py-4">
      <p className="text-xs text-gray-500 mb-1">Peak Week</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-semibold text-gray-900">{doctorGrowthAnalysis.weeklyMax}</p>
      </div>
      <p className="text-xs text-gray-400 mt-1">highest registration week</p>
    </div>
  </div>

  {/* Chart Section - Clean and spacious */}
  <div className="p-6 border-t border-gray-100">
    {/* Chart controls */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-xs text-gray-600">New Doctors</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="text-xs text-gray-600">Average</span>
        </div>
      </div>
      <select
        className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={doctorGrowthRange}
        onChange={(e) => setDoctorGrowthRange(e.target.value)}
      >
        <option value="daily">Last 14 days</option>
        <option value="weekly">Last 8 weeks</option>
        <option value="monthly">Last 6 months</option>
      </select>
    </div>

    {/* Chart with minimal styling */}
    <div className="relative h-48">
      {/* Grid lines - very subtle */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[4, 3, 2, 1, 0].map((i) => (
          <div key={i} className="border-b border-gray-50 h-0 w-full" />
        ))}
      </div>

      {/* Bars */}
      <div className="relative h-full flex items-end justify-between gap-1">
        {doctorGrowthSeries.map((item, index) => {
          const barHeight = Math.max(8, (item.count / doctorGrowthMax) * 140);
          const avgHeight = (doctorGrowthAvg / doctorGrowthMax) * 140;
          
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div className="relative w-full flex justify-center">
                {/* Bar */}
                <div
                  className="w-6 md:w-8 rounded-sm bg-blue-500 group-hover:bg-blue-600 transition-all duration-200 cursor-pointer"
                  style={{ height: `${barHeight}px` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {item.count} doctors
                  </div>
                </div>
                
                {/* Average line */}
                {index === 0 && (
                  <div 
                    className="absolute left-0 right-0 border-t border-dashed border-gray-300 pointer-events-none"
                    style={{ bottom: `${avgHeight}px` }}
                  >
                    <span className="absolute -top-4 right-0 text-[10px] text-gray-400 bg-white px-1">
                      Avg
                    </span>
                  </div>
                )}
              </div>
              
              {/* Label */}
              <span className="text-[10px] text-gray-500 mt-2">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Footer with insights - Clean and minimal */}
    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">
          Total ({doctorGrowthRangeLabel.toLowerCase()}): <span className="font-medium text-gray-900">{doctorGrowthTotal}</span>
        </span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">
          {doctorGrowthAnalysis.hasCreatedAtData ? 'Based on registration dates' : 'Estimated growth'}
        </span>
      </div>
      {doctorGrowthAnalysis.weekGrowthPct > 20 && (
        <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-md">
          ↑ {doctorGrowthAnalysis.weekGrowthPct}% growth
        </span>
      )}
    </div>
  </div>
</div>




{/* Lab Growth Analysis - Google Analytics Style */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* Header */}
  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-50">
          <Building size={18} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-base font-medium text-gray-900">Lab Growth Analysis</h2>
          <p className="text-xs text-gray-500 mt-0.5">Enrollment trends and growth metrics</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          {labGrowthRangeLabel}
        </span>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Download size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  </div>

  {/* KPI Cards */}
  <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200 border-b border-gray-200">
    <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New (7d)</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-semibold text-gray-900">{labGrowthAnalysis.weekNew}</p>
        <span className={`text-xs font-medium ${labGrowthAnalysis.weekGrowthPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {labGrowthAnalysis.weekGrowthPct >= 0 ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
          {Math.abs(labGrowthAnalysis.weekGrowthPct)}%
        </span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">vs previous 7 days</p>
    </div>
    
    <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New (30d)</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-semibold text-gray-900">{labGrowthAnalysis.monthNew}</p>
        <span className={`text-xs font-medium ${labGrowthAnalysis.monthGrowthPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {labGrowthAnalysis.monthGrowthPct >= 0 ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
          {Math.abs(labGrowthAnalysis.monthGrowthPct)}%
        </span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">vs previous 30 days</p>
    </div>
    
    <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Weekly</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-semibold text-gray-900">
          {(labGrowthAnalysis.weeklySeries.reduce((sum, item) => sum + item.count, 0) / 8).toFixed(1)}
        </p>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">per week (last 8 weeks)</p>
    </div>
    
    <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Peak Week</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-semibold text-gray-900">{labGrowthAnalysis.weeklyMax}</p>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">highest enrollment week</p>
    </div>
  </div>

  {/* Chart Section */}
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          <span className="text-xs text-gray-600">New Labs</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
          <span className="text-xs text-gray-600">Average</span>
        </div>
      </div>
      <select
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
        value={labGrowthRange}
        onChange={(e) => setLabGrowthRange(e.target.value)}
      >
        <option value="daily">Daily (14 days)</option>
        <option value="weekly">Weekly (8 weeks)</option>
        <option value="monthly">Monthly (6 months)</option>
      </select>
    </div>

    <div className="relative h-48">
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[4, 3, 2, 1, 0].map((i) => (
          <div key={i} className="border-b border-gray-100 h-0 w-full" />
        ))}
      </div>

      <div className="relative h-full flex items-end justify-between gap-2">
        {labGrowthSeries.map((item, index) => {
          const barHeight = Math.max(8, (item.count / labGrowthMax) * 140);
          const avgHeight = (labGrowthAvg / labGrowthMax) * 140;
          
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div className="relative w-full flex justify-center">
                <div
                  className="w-8 md:w-10 rounded-t-sm bg-amber-600 group-hover:bg-amber-700 transition-all duration-200 cursor-pointer"
                  style={{ height: `${barHeight}px` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10">
                    {item.count} labs
                  </div>
                </div>
                
                {index === 0 && (
                  <div 
                    className="absolute left-0 right-0 border-t border-dashed border-gray-400 pointer-events-none"
                    style={{ bottom: `${avgHeight}px` }}
                  >
                    <span className="absolute -top-4 right-0 text-[10px] text-gray-500 bg-white px-1">
                      Avg
                    </span>
                  </div>
                )}
              </div>
              
              <span className="text-[11px] text-gray-500 mt-2 font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>

    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Total ({labGrowthRangeLabel.toLowerCase()}):</span>
        <span className="text-sm font-semibold text-gray-900">
          {labGrowthTotal}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">
          {labGrowthAnalysis.hasCreatedAtData ? 'Based on enrollment dates' : 'No enrollment timestamps'}
        </span>
        {labGrowthAnalysis.weekGrowthPct > 20 && (
          <span className="text-[11px] px-2 py-1 bg-green-50 text-green-700 rounded-full flex items-center gap-1">
            <ArrowUp size={10} />
            High growth
          </span>
        )}
        {labGrowthAnalysis.weekGrowthPct < -20 && (
          <span className="text-[11px] px-2 py-1 bg-red-50 text-red-700 rounded-full flex items-center gap-1">
            <ArrowDown size={10} />
            Decline
          </span>
        )}
      </div>
    </div>
  </div>
</div>

{/* Patient Growth Analysis - Google Analytics Style */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* Header with improved typography and subtle gradient */}
  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-50">
          <UsersRound size={18} className="text-emerald-600" />
        </div>
        <div>
          <h2 className="text-base font-medium text-gray-900">Patient Growth Analysis</h2>
          <p className="text-xs text-gray-500 mt-0.5">Registration trends and growth metrics</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
          {patientGrowthRangeLabel}
        </span>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <Download size={14} className="text-gray-400" />
        </button>
      </div>
    </div>
  </div>

  {/* KPI Cards - Google Analytics style with dividers */}
  <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200 border-b border-gray-200">
    <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New (7d)</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-semibold text-gray-900">{patientGrowthAnalysis.weekNew}</p>
        <span className={`text-xs font-medium ${patientGrowthAnalysis.weekGrowthPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {patientGrowthAnalysis.weekGrowthPct >= 0 ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
          {Math.abs(patientGrowthAnalysis.weekGrowthPct)}%
        </span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">vs previous 7 days</p>
    </div>
    
    <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New (30d)</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-semibold text-gray-900">{patientGrowthAnalysis.monthNew}</p>
        <span className={`text-xs font-medium ${patientGrowthAnalysis.monthGrowthPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {patientGrowthAnalysis.monthGrowthPct >= 0 ? <ArrowUp size={12} className="inline" /> : <ArrowDown size={12} className="inline" />}
          {Math.abs(patientGrowthAnalysis.monthGrowthPct)}%
        </span>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">vs previous 30 days</p>
    </div>
    
    <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Weekly</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-semibold text-gray-900">
          {(patientGrowthAnalysis.weeklySeries.reduce((sum, item) => sum + item.count, 0) / 8).toFixed(1)}
        </p>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">per week (last 8 weeks)</p>
    </div>
    
    <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Peak Week</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-semibold text-gray-900">{patientGrowthAnalysis.weeklyMax}</p>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">highest registration week</p>
    </div>
  </div>

  {/* Chart Section */}
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-xs text-gray-600">New Patients</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
          <span className="text-xs text-gray-600">Average</span>
        </div>
      </div>
      <select
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        value={patientGrowthRange}
        onChange={(e) => setPatientGrowthRange(e.target.value)}
      >
        <option value="daily">Daily (14 days)</option>
        <option value="weekly">Weekly (8 weeks)</option>
        <option value="monthly">Monthly (6 months)</option>
      </select>
    </div>

    {/* Chart with grid */}
    <div className="relative h-48">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[4, 3, 2, 1, 0].map((i) => (
          <div key={i} className="border-b border-gray-100 h-0 w-full" />
        ))}
      </div>

      {/* Bars */}
      <div className="relative h-full flex items-end justify-between gap-2">
        {patientGrowthSeries.map((item, index) => {
          const barHeight = Math.max(8, (item.count / patientGrowthMax) * 140);
          const avgHeight = (patientGrowthAvg / patientGrowthMax) * 140;
          
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div className="relative w-full flex justify-center">
                {/* Bar */}
                <div
                  className="w-8 md:w-10 rounded-t-sm bg-emerald-600 group-hover:bg-emerald-700 transition-all duration-200 cursor-pointer"
                  style={{ height: `${barHeight}px` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10">
                    {item.count} patients
                  </div>
                </div>
                
                {/* Average line indicator (only on first bar for clarity) */}
                {index === 0 && (
                  <div 
                    className="absolute left-0 right-0 border-t border-dashed border-gray-400 pointer-events-none"
                    style={{ bottom: `${avgHeight}px` }}
                  >
                    <span className="absolute -top-4 right-0 text-[10px] text-gray-500 bg-white px-1">
                      Avg
                    </span>
                  </div>
                )}
              </div>
              
              {/* Label */}
              <span className="text-[11px] text-gray-500 mt-2 font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Footer with insights */}
    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Total ({patientGrowthRangeLabel.toLowerCase()}):</span>
        <span className="text-sm font-semibold text-gray-900">
          {patientGrowthTotal}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">
          {patientGrowthAnalysis.hasCreatedAtData ? 'Based on registration dates' : 'Estimated growth'}
        </span>
        {patientGrowthAnalysis.weekGrowthPct > 20 && (
          <span className="text-[11px] px-2 py-1 bg-green-50 text-green-700 rounded-full flex items-center gap-1">
            <ArrowUp size={10} />
            High growth
          </span>
        )}
        {patientGrowthAnalysis.weekGrowthPct < -20 && (
          <span className="text-[11px] px-2 py-1 bg-red-50 text-red-700 rounded-full flex items-center gap-1">
            <ArrowDown size={10} />
            Decline
          </span>
        )}
      </div>
    </div>
  </div>
</div>
{/* Charts and Activities - Google Analytics Style */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Chart Section - Google Analytics Style */}
  <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-50">
            <BarChart3 size={18} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-medium text-gray-900">Analytics Overview</h2>
            <p className="text-xs text-gray-500 mt-0.5">Appointments and registrations trend</p>
          </div>
        </div>
        <select
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          value={analyticsDays}
          onChange={(e) => setAnalyticsDays(Number(e.target.value))}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>
    </div>

    {/* Mini KPI row */}
    <div className="grid grid-cols-4 divide-x divide-gray-200 border-b border-gray-200 bg-gray-50/30">
      <div className="px-6 py-3">
        <p className="text-xs text-gray-500">Total Appointments</p>
        <p className="text-lg font-semibold text-gray-900">{analytics.totalAppointments || 0}</p>
      </div>
      <div className="px-6 py-3">
        <p className="text-xs text-gray-500">Completed</p>
        <p className="text-lg font-semibold text-gray-900">{analytics.completedAppointments || 0}</p>
      </div>
      <div className="px-6 py-3">
        <p className="text-xs text-gray-500">Labs</p>
        <p className="text-lg font-semibold text-gray-900">{totalLabs}</p>
      </div>
      <div className="px-6 py-3">
        <p className="text-xs text-gray-500">Revenue</p>
        <p className="text-lg font-semibold text-gray-900">{formatCurrency(analytics.revenueInRange)}</p>
      </div>
    </div>

    {/* Chart */}
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="text-xs text-gray-600">Appointments</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs text-gray-600">Registrations</span>
        </div>
      </div>

      <div className="relative h-64">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[4, 3, 2, 1, 0].map((i) => (
            <div key={i} className="border-b border-gray-100 h-0 w-full" />
          ))}
        </div>

        {/* Bars */}
        <div className="relative h-full flex items-end justify-between gap-4">
          {analyticsSeries.rows.length > 0 ? (
            analyticsSeries.rows.map((row) => {
              // Calculate heights with better scaling
              const maxValue = analyticsSeries.maxValue;
              const apptHeight = Math.max(8, (row.appointments / maxValue) * 200);
              const regHeight = Math.max(8, (row.registrations / maxValue) * 200);
              
              // Ensure both bars are visible even if one is zero
              const showApptBar = row.appointments > 0;
              const showRegBar = row.registrations > 0;
              
              const label = new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
              
              return (
                <div key={row.date} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="relative w-full flex items-end justify-center gap-1">
                    {/* Appointments bar */}
                    {showApptBar ? (
                      <div
                        className="w-3 md:w-4 rounded-t-sm bg-blue-600 group-hover:bg-blue-700 transition-all duration-200 cursor-pointer relative"
                        style={{ height: `${apptHeight}px` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10">
                          Appointments: {row.appointments}
                        </div>
                      </div>
                    ) : (
                      // Placeholder for zero values - shows a tiny bar to indicate position
                      <div className="w-3 md:w-4 h-[4px] rounded-t-sm bg-blue-200 opacity-30" />
                    )}
                    
                    {/* Registrations bar */}
                    {showRegBar ? (
                      <div
                        className="w-3 md:w-4 rounded-t-sm bg-emerald-500 group-hover:bg-emerald-600 transition-all duration-200 cursor-pointer relative"
                        style={{ height: `${regHeight}px` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10">
                          Registrations: {row.registrations}
                        </div>
                      </div>
                    ) : (
                      // Placeholder for zero values
                      <div className="w-3 md:w-4 h-[4px] rounded-t-sm bg-emerald-200 opacity-30" />
                    )}
                  </div>
                  
                  {/* Date label */}
                  <span className="text-[10px] text-gray-500 mt-2 font-medium">{label}</span>
                  
                  {/* Small value indicator for zero values */}
                  {(!showApptBar || !showRegBar) && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {!showApptBar && <span className="text-[8px] text-blue-300">0</span>}
                      {!showRegBar && <span className="text-[8px] text-emerald-300">0</span>}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No analytics data yet
            </div>
          )}
        </div>
      </div>

      {/* Footer with totals */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-xs text-gray-500">Appointments: {analytics.totalAppointments || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-gray-500">Registrations: {analytics.totalRegistrations || 0}</span>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-700">
          Revenue: {formatCurrency(stats.revenue)}
        </span>
      </div>
    </div>
  </div>

  {/* Recent Activities - Google Analytics Style */}
{/* Recent Activities - Google Analytics Style */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* Header */}
  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-50">
          <Activity size={18} className="text-amber-600" />
        </div>
        <div>
          <h2 className="text-base font-medium text-gray-900">Recent Activities</h2>
          <p className="text-xs text-gray-500 mt-0.5">Latest updates and events</p>
        </div>
      </div>
      <button 
        onClick={() => {/* Add navigation to full activity log */}}
        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group"
      >
        View All
        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  </div>

  {/* Activity List */}
  <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
    {recentActivities.length > 0 ? (
      recentActivities.map((activity, idx) => (
        <ActivityItem 
          key={activity.id || idx} 
          activity={activity} 
          index={idx}
          onMarkRead={(id) => {
            // Add your mark as read logic here
            console.log('Mark as read:', id);
          }}
        />
      ))
    ) : (
      <div className="py-12 px-4 text-center">
        <div className="relative">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-full blur-xl opacity-50 animate-pulse" />
          
          {/* Icon container */}
          <div className="relative w-16 h-16 mx-auto bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center mb-3">
            <Activity size={24} className="text-amber-400" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-700">No recent activities</p>
        <p className="text-xs text-gray-400 mt-1">Activities will appear here when they happen</p>
      </div>
    )}
  </div>

  {/* Footer with activity stats */}
  {recentActivities.length > 0 && (
    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-3">
          <span className="text-gray-500">
            <span className="font-medium text-gray-700">{recentActivities.length}</span> total
          </span>
          {recentActivities.filter(a => a.unread).length > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-red-600 font-medium">
                {recentActivities.filter(a => a.unread).length} unread
              </span>
            </>
          )}
        </div>
        <span className="text-gray-400">
          Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )}
</div>
</div>


          </div>
        )}

        {/* Doctors Tab */}
{/* Doctors Tab */}
{activeTab === 'doctors' && (
  <div className="space-y-6 animate-fadeIn">
    {/* Google-style Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-medium text-gray-800">Doctors Directory</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and monitor all doctors in the system</p>
      </div>
      <button
        onClick={() => navigate('/register')}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add New Doctor
      </button>
    </div>

    {/* Google-style Metrics Cards with Status Filters */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* All Doctors Card */}
      <div 
        onClick={() => setFilterStatus('all')}
        className={`bg-white rounded-lg border p-5 cursor-pointer transition-all hover:shadow-md ${
          filterStatus === 'all' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">All Doctors</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{doctorMetrics.total}</p>
            <p className="text-xs text-gray-400 mt-2">Total registered</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            filterStatus === 'all' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <svg className={`w-5 h-5 ${filterStatus === 'all' ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 4v2a5 5 0 01-10 0V8l-1-4h8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Pending Approval Card */}
      <div 
        onClick={() => setFilterStatus('PENDING_APPROVAL')}
        className={`bg-white rounded-lg border p-5 cursor-pointer transition-all hover:shadow-md ${
          filterStatus === 'PENDING_APPROVAL' ? 'border-yellow-500 ring-2 ring-yellow-100' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{doctorMetrics.pending}</p>
            <p className="text-xs text-gray-400 mt-2">Awaiting review</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            filterStatus === 'PENDING_APPROVAL' ? 'bg-yellow-100' : 'bg-gray-100'
          }`}>
            <svg className={`w-5 h-5 ${filterStatus === 'PENDING_APPROVAL' ? 'text-yellow-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Approved Card */}
      <div 
        onClick={() => setFilterStatus('ACTIVE')}
        className={`bg-white rounded-lg border p-5 cursor-pointer transition-all hover:shadow-md ${
          filterStatus === 'ACTIVE' ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{doctorMetrics.active}</p>
            <p className="text-xs text-gray-400 mt-2">Active doctors</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            filterStatus === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <svg className={`w-5 h-5 ${filterStatus === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Rejected Card */}
      <div 
        onClick={() => setFilterStatus('REJECTED')}
        className={`bg-white rounded-lg border p-5 cursor-pointer transition-all hover:shadow-md ${
          filterStatus === 'REJECTED' ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{doctorMetrics.rejected}</p>
            <p className="text-xs text-gray-400 mt-2">Not approved</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            filterStatus === 'REJECTED' ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            <svg className={`w-5 h-5 ${filterStatus === 'REJECTED' ? 'text-red-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* Google-style Search and Filter Bar */}
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Main Search Row */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input - Google style */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search doctors by name, email, or specialization..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={doctorSort}
              onChange={(e) => setDoctorSort(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[180px]"
            >
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="experience_desc">Most Experienced</option>
              <option value="fee_desc">Highest Fee</option>
              <option value="fee_asc">Lowest Fee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="px-4 py-3 bg-gray-50/50 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">Quick filters:</span>
        {[
          { key: 'all', label: 'All', color: 'gray' },
          { key: 'PENDING_APPROVAL', label: 'Pending', color: 'yellow' },
          { key: 'ACTIVE', label: 'Approved', color: 'green' },
          { key: 'REJECTED', label: 'Rejected', color: 'red' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilterStatus(item.key)}
            className={`
              px-3 py-1 text-xs rounded-full transition-all
              ${filterStatus === item.key 
                ? `bg-${item.color}-100 text-${item.color}-700 border border-${item.color}-200 font-medium` 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            {item.label}
            {item.key !== 'all' && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                filterStatus === item.key ? `bg-${item.color}-200` : 'bg-gray-200'
              }`}>
                {item.key === 'PENDING_APPROVAL' && doctorMetrics.pending}
                {item.key === 'ACTIVE' && doctorMetrics.active}
                {item.key === 'REJECTED' && doctorMetrics.rejected}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Filters Display */}
      {(searchTerm || filterStatus !== 'all' || doctorSort !== 'name_asc') && (
        <div className="px-4 py-3 border-t border-gray-200 bg-blue-50/30 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">Active filters:</span>
          
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              <Search size={12} />
              {searchTerm}
              <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-blue-900">
                <X size={12} />
              </button>
            </span>
          )}
          
          {filterStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Status: {filterStatus.replace('_', ' ')}
              <button onClick={() => setFilterStatus('all')} className="ml-1 hover:text-blue-900">
                <X size={12} />
              </button>
            </span>
          )}
          
          {doctorSort !== 'name_asc' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
              Sort: {doctorSort.replace('_', ' ').replace('desc', '↓').replace('asc', '↑')}
              <button onClick={() => setDoctorSort('name_asc')} className="ml-1 hover:text-blue-900">
                <X size={12} />
              </button>
            </span>
          )}

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setDoctorSort('name_asc');
            }}
            className="ml-auto text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset all
          </button>
        </div>
      )}
    </div>

    {/* Results Summary */}
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-700">{filteredDoctors.length}</span> of <span className="font-medium text-gray-700">{doctorMetrics.total}</span> doctors
      </p>
      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled>
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm text-gray-600">Page 1 of 1</span>
        <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>

    {/* Doctors Grid - Google-style Cards */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {filteredDoctors.length > 0 ? (
        filteredDoctors.map(doctor => (
          <div key={doctor.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
            {/* Header with gradient */}
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Doctor Avatar with specialty color */}
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                    doctor.specialization === 'Cardiologist' ? 'from-red-400 to-pink-500' :
                    doctor.specialization === 'Pediatrician' ? 'from-green-400 to-emerald-500' :
                    doctor.specialization === 'Neurologist' ? 'from-purple-400 to-indigo-500' :
                    doctor.specialization === 'Dermatologist' ? 'from-orange-400 to-amber-500' :
                    'from-blue-400 to-cyan-500'
                  } flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
                  {doctor.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">Dr. {doctor.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{doctor.specialization || 'General Practitioner'}</p>
                    </div>
                    {(() => {
                      switch(doctor.status) {
                        case 'ACTIVE':
                          return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
                        case 'PENDING_APPROVAL':
                          return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
                        case 'REJECTED':
                          return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rejected</span>;
                        default:
                          return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{doctor.status}</span>;
                      }
                    })()}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{doctor.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{doctor.experience || '0'} years exp.</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Fee: ₹{doctor.consultationFee || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowDoctorDetails(true);
                      }}
                      className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                    
                    {doctor.status === 'PENDING_APPROVAL' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowApproveModal(true);
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectDoctor(doctor.id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </>
                    )}
                    
                    {doctor.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleDeleteUser(doctor.id)}
                        className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 4v2a5 5 0 01-10 0V8l-1-4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            We couldn't find any doctors matching your current filters. Try adjusting your search criteria.
          </p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setDoctorSort('name_asc');
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  </div>
)}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Patients Header */}
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                <UserPlus size={18} />
                Add Patient
              </button>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Patient</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Email</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Phone</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Blood Group</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">City</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length > 0 ? (
                      patients.map(patient => (
                        <PatientRow 
                          key={patient.id} 
                          patient={patient}
                          onView={(pat) => {
                            setSelectedPatient(pat);
                            setShowPatientDetails(true);
                          }}
                          onBook={(pat) => {
                            navigate(`/patient/book?patientId=${pat.id}`);
                          }}
                          onDelete={handleDeleteUser}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-12">
                          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No patients found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        
{activeTab === 'lab-enrollments' && (
  <div className="space-y-6 animate-fadeIn">
    {/* Google-style header with search and filters */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search bar - Google style */}
        <div className="relative flex-1 w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={labSearchTerm}
            onChange={(event) => setLabSearchTerm(event.target.value)}
            placeholder="Search labs by name, email, city..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
          />
        </div>

        {/* Filter and actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative">
            <select
              value={labStatusFilter}
              onChange={(event) => setLabStatusFilter(event.target.value)}
              className="appearance-none w-full lg:w-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-gray-100"
            >
              <option value="all">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
          
          <button
            onClick={fetchDashboardData}
            className="px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 hover:shadow transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} className="text-gray-500" />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors">
          All labs
        </button>
        <button className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">
          Pending review
        </button>
        <button className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">
          Recently added
        </button>
        <button className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors">
          Needs attention
        </button>
      </div>
    </div>

    {/* Stats summary */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Total Labs</p>
        <p className="text-2xl font-semibold text-gray-900">{filteredLabEnrollments.length}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Pending</p>
        <p className="text-2xl font-semibold text-yellow-600">
          {filteredLabEnrollments.filter(e => e.status === 'PENDING').length}
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Approved</p>
        <p className="text-2xl font-semibold text-green-600">
          {filteredLabEnrollments.filter(e => e.status === 'APPROVED').length}
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Rejected</p>
        <p className="text-2xl font-semibold text-red-600">
          {filteredLabEnrollments.filter(e => e.status === 'REJECTED').length}
        </p>
      </div>
    </div>

    {/* Lab cards grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredLabEnrollments.length > 0 ? (
        filteredLabEnrollments.map((enrollment) => {
          const statusKey = String(enrollment.status || 'PENDING').toUpperCase();
          const status = LAB_ENROLLMENT_STATUS[statusKey] || LAB_ENROLLMENT_STATUS.PENDING;
          const testCount = enrollment.testCategories?.length || 0;

          return (
            <div key={enrollment.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 space-y-4">
              {/* Header with status */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{enrollment.labName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Reg: {enrollment.registrationNumber || '—'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${status.bgColor} ${status.textColor}`}>
                  {status.label}
                </span>
              </div>

              {/* Contact information grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{enrollment.email || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 min-w-0">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{enrollment.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 min-w-0 col-span-2">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">
                    {[enrollment.city, enrollment.state].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
              </div>

              {/* Contact person */}
              {enrollment.contactPersonName && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <User size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="font-medium">Contact:</span>
                  <span className="truncate">{enrollment.contactPersonName}</span>
                </div>
              )}

              {/* Metrics */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Tests</p>
                  <p className="text-sm font-semibold text-gray-700">{testCount}</p>
                </div>
                <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Turnaround</p>
                  <p className="text-sm font-semibold text-gray-700">{enrollment.reportTurnaround || '—'}h</p>
                </div>
                <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Home</p>
                  <p className="text-sm font-semibold text-gray-700">{enrollment.homeCollection ? '✓' : '✗'}</p>
                </div>
                <div className="text-center p-1.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Emergency</p>
                  <p className="text-sm font-semibold text-gray-700">{enrollment.emergencyServices ? '✓' : '✗'}</p>
                </div>
              </div>

              {/* Document indicators */}
              <div className="flex flex-wrap gap-2 text-xs">
                {enrollment.licenseDocPath && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1">
                    <FileText size={12} />
                    License
                  </span>
                )}
                {enrollment.accreditationDocPaths?.length > 0 && (
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full flex items-center gap-1">
                    <FileText size={12} />
                    Accred ({enrollment.accreditationDocPaths.length})
                  </span>
                )}
                {enrollment.logoPath && (
                  <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full flex items-center gap-1">
                    <FileText size={12} />
                    Logo
                  </span>
                )}
              </div>

              {/* Actions */}
              {statusKey === 'PENDING' ? (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleApproveEnrollment(enrollment.id)}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectEnrollment(enrollment.id)}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
                  <span>Updated {enrollment.updatedAt ? new Date(enrollment.updatedAt).toLocaleDateString() : '—'}</span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View details →
                  </button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="max-w-sm mx-auto">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lab enrollments found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filter to find what you're looking for.</p>
            <button 
              onClick={() => {
                setLabSearchTerm('');
                setLabStatusFilter('all');
              }}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)}



{/* Appointments Tab */}
{activeTab === 'appointments' && (
  <div className="space-y-6 animate-fadeIn">
    {/* Google-style Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-medium text-gray-800">Appointments</h1>
        <p className="text-sm text-gray-500 mt-1">Track and analyze your appointment data</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Report
        </button>
      </div>
    </div>

    {/* Google-style Metrics Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total in Range</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{appointmentAnalysis.totalInRange}</p>
            <p className="text-xs text-gray-400 mt-2">
              {analyticsDays} day period
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{appointmentAnalysis.completionRate}%</p>
            <p className="text-xs text-gray-400 mt-2">
              {appointmentAnalysis.completedInRange} completed
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Cancellation Rate</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{appointmentAnalysis.cancellationRate}%</p>
            <p className="text-xs text-gray-400 mt-2">
              {appointmentAnalysis.cancelledInRange} cancelled
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Average per Day</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{appointmentAnalysis.averagePerDay}</p>
            <p className="text-xs text-gray-400 mt-2">
              Peak: {appointmentAnalysis.peakDaily?.count || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* Google-style Filters Bar */}
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Time Range:</span>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1.5 text-sm rounded-md font-medium border ${
              appointmentTrendRange === 'daily'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'text-gray-600 hover:bg-gray-50 border-gray-200'
            }`}
            onClick={() => setAppointmentTrendRange('daily')}
          >
            Daily
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md font-medium border ${
              appointmentTrendRange === 'weekly'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'text-gray-600 hover:bg-gray-50 border-gray-200'
            }`}
            onClick={() => setAppointmentTrendRange('weekly')}
          >
            Weekly
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md font-medium border ${
              appointmentTrendRange === 'monthly'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'text-gray-600 hover:bg-gray-50 border-gray-200'
            }`}
            onClick={() => setAppointmentTrendRange('monthly')}
          >
            Monthly
          </button>
        </div>
        <div className="h-4 w-px bg-gray-200 mx-2" />
        {appointmentTrendRange === 'monthly' ? (
          <select
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={analyticsMonths}
            onChange={(e) => setAnalyticsMonths(Number(e.target.value))}
          >
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
          </select>
        ) : (
          <select
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={analyticsDays}
            onChange={(e) => setAnalyticsDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        )}
      </div>
    </div>

    {/* Main Chart - Updated Google-style Graph */}
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">{appointmentTrend.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {appointmentTrend.rangeLabel} • Total: {appointmentTrend.total} •{' '}
                  {appointmentTrendRange === 'monthly' ? 'Appointment date' : 'Booking date'}
                </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-xs text-gray-600">Appointments</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-xs text-gray-600">Lab Appointments</span>
              </span>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100">
              Peak: {appointmentTrend.peak?.count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {appointmentTrend.series.length > 0 ? (
          <div className="h-80">
            {/* Chart Container */}
            <div className="relative h-full flex">
              {/* Y-axis labels */}
              <div className="w-12 flex flex-col justify-between text-xs text-gray-400 py-2">
                <span>{appointmentTrend.max}</span>
                <span>{Math.round(appointmentTrend.max * 0.75)}</span>
                <span>{Math.round(appointmentTrend.max * 0.5)}</span>
                <span>{Math.round(appointmentTrend.max * 0.25)}</span>
                <span>0</span>
              </div>
              
              {/* Grid lines */}
              <div className="flex-1 relative">
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-b border-gray-100 w-full h-0"></div>
                  ))}
                </div>
                
                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-around gap-2 pb-2">
                  {appointmentTrend.series.map((row) => {
                    const height = Math.max(
                      8,
                      (row.count / appointmentTrend.max) * 100
                    );
                    const labHeight = Math.max(
                      8,
                      ((row.labCount || 0) / appointmentTrend.max) * 100
                    );
                    
                    return (
                      <div key={row.key} className="flex-1 h-full flex flex-col items-center group">
                        <div className="relative w-full h-full flex items-end justify-center gap-0.5">
                          {/* Appointments bar */}
                          <div 
                            className="w-6 md:w-8 rounded-t-sm bg-blue-500 transition-all duration-200 group-hover:bg-blue-600 cursor-pointer"
                            style={{ height: `${height}%` }}
                          >
                            {/* Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                              {row.count} appointments
                            </div>
                          </div>
                          
                          {/* Lab bar */}
                          {(row.labCount || 0) > 0 && (
                            <div 
                              className="w-6 md:w-8 rounded-t-sm bg-amber-500 transition-all duration-200 group-hover:bg-amber-600 cursor-pointer"
                              style={{ height: `${labHeight}%` }}
                            >
                              {/* Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                                {row.labCount || 0} lab appointments
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* X-axis label */}
                        <span className="text-[10px] text-gray-500 mt-2 whitespace-nowrap">
                          {row.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">
            No appointment data available
          </div>
        )}
      </div>
    </div>

    {/* Two Column Layout for Secondary Charts - Updated Google Style */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">Status Distribution</h2>
              <p className="text-xs text-gray-500 mt-0.5">Breakdown by appointment status</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {appointmentAnalysis.statusDistribution.map((item) => (
              <div key={item.key} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{item.value}</span>
                    <span className="text-xs text-gray-400 w-12 text-right">{item.percent.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Appointments</span>
              <span className="font-medium text-gray-900">{appointmentAnalysis.totalInRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly/Monthly Trend Card - Simplified */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                {appointmentTrendRange === 'daily' ? 'Daily Trend' : 
                 appointmentTrendRange === 'weekly' ? 'Weekly Trend' : 'Monthly Trend'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {appointmentTrendRange === 'daily' ? 'Last 7 days' : 
                 appointmentTrendRange === 'weekly' ? 'Last 8 weeks' : 'Last 6 months'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Mini Chart */}
        <div className="p-6">
          <div className="h-32">
            <div className="relative h-full flex items-end justify-between gap-1">
              {appointmentTrend.series.slice(-7).map((row, index) => {
                const height = Math.max(
                  8,
                  (row.count / appointmentTrend.max) * 80
                );
                
                return (
                  <div key={row.key} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex justify-center">
                      <div 
                        className="w-4 md:w-6 rounded-t-sm bg-blue-500 transition-all duration-200 group-hover:bg-blue-600 cursor-pointer"
                        style={{ height: `${height}px` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                          {row.count} appointments
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] text-gray-500 mt-1">
                      {index % 2 === 0 ? row.label : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-medium text-gray-900">{appointmentTrend.total}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Average</p>
              <p className="text-sm font-medium text-gray-900">
                {Math.round(appointmentTrend.total / appointmentTrend.series.length)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}




{/* Analytics Tab */}
{activeTab === 'analytics' && (
  <div className="space-y-6 animate-fadeIn">
    {/* Header with period selector */}
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
      <select
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={analyticsMonths}
        onChange={(e) => setAnalyticsMonths(Number(e.target.value))}
      >
        <option value={3}>Last 3 months</option>
        <option value={6}>Last 6 months</option>
        <option value={12}>Last 12 months</option>
      </select>
    </div>

    {/* User & Patient Overview Cards */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Total Users</span>
          <Users size={18} className="text-gray-400" />
        </div>
        <p className="text-2xl font-semibold text-gray-900">{userAnalysis.totalUsers}</p>
        <p className="text-xs text-gray-500 mt-1">{formatAvgIncrease(stats.averageDailyUsers)}</p>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Patients</span>
          <Activity size={18} className="text-green-400" />
        </div>
        <p className="text-2xl font-semibold text-gray-900">{userAnalysis.totalPatients}</p>
        <p className="text-xs text-gray-500 mt-1">{userAnalysis.patientShare}% of users • {formatAvgIncrease(stats.averageDailyPatients)}</p>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Doctors</span>
          <UserCheck size={18} className="text-indigo-400" />
        </div>
        <p className="text-2xl font-semibold text-gray-900">{userAnalysis.totalDoctors}</p>
        <p className="text-xs text-gray-500 mt-1">{userAnalysis.doctorShare}% of users • {formatAvgIncrease(stats.averageDailyDoctors)}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Labs</span>
          <Building size={18} className="text-amber-400" />
        </div>
        <p className="text-2xl font-semibold text-gray-900">{userAnalysis.totalLabs}</p>
        <p className="text-xs text-gray-500 mt-1">{userAnalysis.labShare}% of users</p>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Admins</span>
          <Shield size={18} className="text-purple-400" />
        </div>
        <p className="text-2xl font-semibold text-gray-900">{userAnalysis.totalAdmins}</p>
        <p className="text-xs text-gray-500 mt-1">{userAnalysis.adminShare}% of users</p>
      </div>
    </div>

    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Role Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-base font-medium text-gray-900 mb-4">User Role Distribution</h3>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-full" style={{ background: buildConicGradient(roleDistribution) }}>
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-semibold text-gray-900">{userAnalysis.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full space-y-3">
            {roleDistribution.map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value} ({item.percent.toFixed(1)}%)</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300" 
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-base font-medium text-gray-900 mb-4">Doctor Status Distribution</h3>
        <div className="space-y-4">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
            {doctorStatusDistribution.map((item) => (
              <div
                key={item.key}
                style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                className="h-full transition-all duration-300 hover:opacity-80"
                title={`${item.label}: ${item.value}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {doctorStatusDistribution.map((item) => (
              <div key={item.key} className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900">{item.value} ({item.percent.toFixed(1)}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
        <h3 className="text-base font-medium text-gray-900 mb-4">Patient Status Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex mb-4">
              {patientStatusDistribution.map((item) => (
                <div
                  key={item.key}
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  className="h-full transition-all duration-300 hover:opacity-80"
                  title={`${item.label}: ${item.value}`}
                />
              ))}
            </div>
            <div className="space-y-3">
              {patientStatusDistribution.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-700">{item.label}</span>
                    </div>
                    <span className="font-medium text-gray-900">{item.value} ({item.percent.toFixed(1)}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300" 
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center bg-gray-50 rounded-xl p-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Total Patients</p>
              <p className="text-3xl font-semibold text-gray-900">{userAnalysis.totalPatients}</p>
              <p className="text-xs text-gray-500 mt-2">{userAnalysis.patientShare}% of all users</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Revenue Section */}
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">Revenue Analytics</h2>
      </div>
      
      <div className="p-6">
        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(detailedAnalytics.totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">Selected period</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Completed Appointments</p>
            <p className="text-2xl font-semibold text-gray-900">{detailedAnalytics.totalCompletedAppointments || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total appointments</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Labs Onboarded</p>
            <p className="text-2xl font-semibold text-gray-900">{totalLabs}</p>
            <p className="text-xs text-gray-500 mt-1">Total enrollments</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Average per Appointment</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(detailedAnalytics.totalCompletedAppointments ? 
                detailedAnalytics.totalRevenue / detailedAnalytics.totalCompletedAppointments : 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Avg. revenue</p>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Monthly Trend</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {monthlyTrend.rows.length > 0 ? (
              <>
                <div className="h-64 flex items-end justify-between gap-2">
                  {monthlyTrend.rows.map((row) => {
                    const appointmentsHeight = Math.max(8, ((row.appointments || 0) / monthlyTrend.maxAppointments) * 200);
                    const revenueHeight = Math.max(8, ((row.revenue || 0) / monthlyTrend.maxRevenue) * 200);
                    return (
                      <div key={row.month} className="flex-1 flex flex-col items-center group">
                        <div className="w-full flex items-end justify-center gap-1 mb-2">
                          <div
                            className="w-4 bg-blue-500 rounded-t transition-all group-hover:bg-blue-600"
                            style={{ height: `${appointmentsHeight}px` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6 bg-gray-900 text-white text-xs rounded px-2 py-1">
                              {row.appointments || 0} appointments
                            </div>
                          </div>
                          <div
                            className="w-4 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-600"
                            style={{ height: `${revenueHeight}px` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6 bg-gray-900 text-white text-xs rounded px-2 py-1">
                              {formatCurrency(row.revenue)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{formatMonth(row.month)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200">
                  <span className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-3 h-3 rounded-sm bg-blue-500" />
                    Completed Appointments
                  </span>
                  <span className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                    Revenue
                  </span>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No monthly data available
              </div>
            )}
          </div>
        </div>

        {/* Top Doctors Table */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Top Performing Doctors</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Doctor</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Completed Appointments</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(detailedAnalytics.topDoctors || []).length > 0 ? (
                  (detailedAnalytics.topDoctors || []).map((doctor, index) => (
                    <tr key={doctor.doctorId} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">Dr. {doctor.doctorName || '-'}</span>
                          {index === 0 && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Top</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{doctor.completedAppointments || 0}</td>
                      <td className="py-3 px-4 text-sm font-medium text-emerald-700">{formatCurrency(doctor.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-12 text-gray-400">
                      No doctor revenue data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </main>

      {/* Approve Doctor Modal */}
      <Modal 
        isOpen={showApproveModal} 
        onClose={() => setShowApproveModal(false)}
        title="Approve Doctor"
        size="lg"
      >
        {selectedDoctor && (
          <div>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Full Name</label>
                  <p className="font-semibold">Dr. {selectedDoctor.name}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Specialization</label>
                  <p className="font-semibold">{selectedDoctor.specialization || 'General'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="font-semibold">{selectedDoctor.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <p className="font-semibold">{selectedDoctor.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Experience</label>
                  <p className="font-semibold">{selectedDoctor.experience || 0} years</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Consultation Fee</label>
                  <p className="font-semibold">₹{selectedDoctor.consultationFee || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Clinic Address</label>
                <p className="text-sm">{selectedDoctor.clinicAddress || 'Not provided'}</p>
              </div>

              {selectedDoctor.bio && (
                <div>
                  <label className="text-xs text-gray-500">Bio</label>
                  <p className="text-sm text-gray-600">{selectedDoctor.bio}</p>
                </div>
              )}

              {selectedDoctor.licenseCertificateUrl && (
                <div>
                  <label className="text-xs text-gray-500">License Certificate</label>
                  <a
                    href={selectedDoctor.licenseCertificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block mt-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    View Certificate <FileText size={14} className="inline ml-1" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApproveDoctor(selectedDoctor.id)}
                disabled={actionLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {actionLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    Approving...
                  </span>
                ) : 'Approve Doctor'}
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Doctor Details Modal */}
      <Modal 
        isOpen={showDoctorDetails} 
        onClose={() => setShowDoctorDetails(false)}
        title="Doctor Details"
        size="xl"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-200">
                {selectedDoctor.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dr. {selectedDoctor.name}</h2>
                <p className="text-gray-500">{selectedDoctor.specialization || 'General Practitioner'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedDoctor.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-700' 
                      : selectedDoctor.status === 'PENDING_APPROVAL'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedDoctor.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Personal Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm group">
                    <Mail size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="group-hover:text-blue-600 transition-colors">{selectedDoctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group">
                    <Phone size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="group-hover:text-blue-600 transition-colors">{selectedDoctor.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group">
                    <MapPin size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="group-hover:text-blue-600 transition-colors">{selectedDoctor.clinicAddress || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Professional Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm group">
                    <Award size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="group-hover:text-blue-600 transition-colors">{selectedDoctor.experience || 0} years experience</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group">
                    <DollarSign size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="group-hover:text-blue-600 transition-colors">₹{selectedDoctor.consultationFee || 'N/A'} per consultation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm group">
                    <FileText size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="group-hover:text-blue-600 transition-colors">{selectedDoctor.qualification || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedDoctor.bio && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Biography</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all">
                  {selectedDoctor.bio}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
