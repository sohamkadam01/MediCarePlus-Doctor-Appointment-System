// DoctorDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  PieChart,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  Star,
  UserRound,
  Users,
  X,
  XCircle,
  Home,
  Menu,
  ChevronDown,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Download,
  FileText,
  Mail,
  Phone,
  MapPin,
  Heart,
  Award,
  ThumbsUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader,
  Video,
  MessageCircle,
  Wallet,
  Pill,
  Thermometer,
  Droplet,
  Scale,
  Coffee,
  Sun,
  Moon,
  Edit,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import authService from '../services/AuthService';
import DoctorChatbot from '../components/DoctorChatbot';
import PatientVitalsModal from '../components/PatientVitalsModal';
import patientVitalService from '../services/PatientVitalService';

const API_BASE_URL = 'http://localhost:8080/api';

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeDateKey = (value) => {
  if (value == null) return '';
  if (Array.isArray(value) && value.length >= 3) {
    const y = String(value[0]).padStart(4, '0');
    const m = String(value[1]).padStart(2, '0');
    const d = String(value[2]).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const raw = String(value);
  if (raw.length >= 10 && raw[4] === '-' && raw[7] === '-') {
    return raw.slice(0, 10);
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return getLocalDateString(parsed);
};

// Google-like Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    violet: 'from-violet-500 to-violet-600',
    cyan: 'from-cyan-500 to-cyan-600'
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.direction === 'up' ? (
                <TrendingUp size={14} className="text-emerald-500" />
              ) : (
                <TrendingDown size={14} className="text-rose-500" />
              )}
              <span className={`text-xs font-medium ${trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.value}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10 shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${colorClasses[color]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </div>
  );
};

// Google-like Patient Card Component
const PatientCard = ({ patient, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {patient.patientName?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{patient.patientName}</h3>
              <p className="text-xs text-gray-500">
                {patient.age} yrs • {patient.gender} • {patient.bloodGroup}
              </p>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full ${getStatusColor(patient.lastStatus)}`}>
            {patient.lastStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-400">Total Visits</p>
            <p className="font-medium text-gray-900">{patient.totalAppointments}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-gray-400">Last Visit</p>
            <p className="font-medium text-gray-900">{patient.lastAppointmentDate}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone size={12} />
            <span className="truncate max-w-[100px]">{patient.emergencyContactPhone || 'N/A'}</span>
          </div>
          <button
            onClick={() => onViewDetails(patient)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <span>View</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Google-like Appointment Request Card
const AppointmentRequestCard = ({ appointment, onAccept, onReject, isLoading }) => {
  const isUrgent = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`) < new Date(Date.now() + 24*60*60*1000);

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {isUrgent && (
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-violet-700 font-semibold text-lg">
              {appointment.patientName?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{appointment.patientName || 'Patient'}</h3>
                {isUrgent && (
                  <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {appointment.patientSnapshotAge || 'N/A'} yrs • {appointment.patientSnapshotGender || 'N/A'}
                {appointment.patientSnapshotBloodGroup && ` • ${appointment.patientSnapshotBloodGroup}`}
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
            Pending
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">Date</p>
            <p className="text-xs font-medium text-gray-700">
              {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">Time</p>
            <p className="text-xs font-medium text-gray-700">{appointment.appointmentTime || '--:--'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">Fee</p>
            <p className="text-xs font-medium text-emerald-600">₹{Number(appointment.consultationFee || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-[10px] text-gray-400">Type</p>
            <p className="text-xs font-medium text-gray-700 capitalize">
              {String(appointment.visitType || 'clinic').toLowerCase().replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-[10px] font-medium text-gray-400 min-w-[45px]">Reason</span>
            <p className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-1.5 flex-1">
              {appointment.reason || 'General Consultation'}
            </p>
          </div>
          {appointment.symptoms && (
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-medium text-gray-400 min-w-[45px]">Symptoms</span>
              <p className="text-xs text-gray-600 bg-amber-50 rounded-lg px-3 py-1.5 flex-1">
                {appointment.symptoms}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onReject(appointment.id)}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <XCircle size={14} />
            <span>Decline</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onAccept(appointment.id)}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-200"
          >
            <CheckCircle2 size={14} />
            <span>Accept</span>
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-lg">
              <Loader size={16} className="animate-spin text-indigo-600" />
              <span className="text-xs font-medium text-gray-700">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Google-like Today Appointment Row
const TodayAppointmentRow = ({ appointment, onComplete, onViewReceipt, onViewRecords, isLoading }) => {
  return (
    <tr className="hover:bg-gray-50/80 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
            {appointment.patientName?.charAt(0) || 'P'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{appointment.patientName || 'Patient'}</p>
            <p className="text-xs text-gray-400">
              {appointment.patientSnapshotAge || 'N/A'} • {appointment.patientSnapshotGender || 'N/A'}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-700">{appointment.appointmentTime || '--:--'}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-600 max-w-[200px] truncate" title={appointment.reason}>
          {appointment.reason || 'Consultation'}
        </div>
        {appointment.symptoms && (
          <div className="text-xs text-gray-400 truncate max-w-[200px]" title={appointment.symptoms}>
            {appointment.symptoms}
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <span className="text-sm font-medium text-emerald-600">
          ₹{Number(appointment.consultationFee || 0).toFixed(2)}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-1 rounded-full ${
          appointment.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
          appointment.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
          appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
          'bg-rose-100 text-rose-700'
        }`}>
          {appointment.status || 'PENDING'}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onViewRecords(appointment)}
            className="text-xs px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium inline-flex items-center gap-1"
          >
            <FileText size={14} />
            <span>Records</span>
          </button>
          {appointment.status === 'CONFIRMED' ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onComplete(appointment.id)}
              className="text-xs px-3 py-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors font-medium inline-flex items-center gap-1"
            >
              <CheckCircle2 size={14} />
              <span>Complete</span>
            </button>
          ) : appointment.status === 'COMPLETED' ? (
            <button
              type="button"
              onClick={() => onViewReceipt(appointment.id)}
              className="text-xs px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium"
            >
              Receipt
            </button>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      </td>
    </tr>
  );
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  
  // State Management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedAppointmentForVitals, setSelectedAppointmentForVitals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [doctorReviews, setDoctorReviews] = useState([]);
  const [doctorReviewSummary, setDoctorReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [paymentAnalyticsData, setPaymentAnalyticsData] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showConfirmedModal, setShowConfirmedModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilitySlotsLoading, setAvailabilitySlotsLoading] = useState(false);
  const [availabilityPreviewSlots, setAvailabilityPreviewSlots] = useState([]);
  const [activeSection, setActiveSection] = useState('Overview');
  const [myPatientsSearchText, setMyPatientsSearchText] = useState('');
  const [reviewSearchText, setReviewSearchText] = useState('');
  const [reviewSortBy, setReviewSortBy] = useState('latest');
  const [messageFilter, setMessageFilter] = useState('all');
  const [messageThreads, setMessageThreads] = useState([]);
  const [selectedMessageThreadId, setSelectedMessageThreadId] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [threadMessagesById, setThreadMessagesById] = useState({});
  const [messageThreadsLoading, setMessageThreadsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingByThread, setTypingByThread] = useState({});
  const [onlineByUserId, setOnlineByUserId] = useState({});
  const [highlightedNextAppointmentKey, setHighlightedNextAppointmentKey] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatientVitals, setSelectedPatientVitals] = useState([]);
  const [selectedPatientVitalsLoading, setSelectedPatientVitalsLoading] = useState(false);
  const [selectedPatientVitalsError, setSelectedPatientVitalsError] = useState('');
  
  const hasSeenInitialNextAppointment = useRef(false);
  const messageSocketRef = useRef(null);
  const typingStopTimerRef = useRef(null);
  const typingThreadRef = useRef(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00'
  });

  const token = localStorage.getItem('token');
  const axiosConfig = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token]
  );
  
  const isUnauthorizedError = (error) => {
    const status = error?.response?.status;
    return status === 401 || status === 403;
  };

  // Navigation items for top bar
  const navItems = [
    { id: 'Overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'Appointments', icon: CalendarDays, label: 'Appointments' },
    { id: 'My Patients', icon: Users, label: 'Patients' },
    { id: 'Reviews', icon: Star, label: 'Reviews' },
    { id: 'Payments', icon: CreditCard, label: 'Payments' },
    { id: 'Messages', icon: MessageSquare, label: 'Messages', badge: true },
    // { id: 'Settings', icon: Settings, label: 'Settings' }
  ];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'DOCTOR' || !token) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchDashboardData(currentUser.id);
  }, [navigate, token]);

  useEffect(() => {
    const fetchOwnSlots = async () => {
      if (!availabilityForm.date || !token) {
        setAvailabilityPreviewSlots([]);
        return;
      }

      setAvailabilitySlotsLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/doctors/availability/slots?date=${availabilityForm.date}`,
          axiosConfig
        );
        setAvailabilityPreviewSlots((res?.data || []).map((slot) => String(slot).slice(0, 5)));
      } catch (error) {
        setAvailabilityPreviewSlots([]);
      } finally {
        setAvailabilitySlotsLoading(false);
      }
    };

    fetchOwnSlots();
  }, [availabilityForm.date, token, axiosConfig]);

  const fetchDashboardData = async (doctorId) => {
    try {
      const [doctorRes, appointmentsRes, todayAppointmentsRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/doctors/details/${doctorId}`, axiosConfig),
        axios.get(`${API_BASE_URL}/appointments/doctor`, axiosConfig),
        axios.get(`${API_BASE_URL}/appointments/doctor/today`, axiosConfig)
      ]);
      
      if (doctorRes.status === 'fulfilled') {
        setDoctorDetails(doctorRes.value?.data || null);
      } else {
        if (isUnauthorizedError(doctorRes.reason)) {
          handleLogout();
          return;
        }
        setDoctorDetails(null);
      }

      if (appointmentsRes.status === 'fulfilled') {
        setAppointments(appointmentsRes.value?.data || []);
      } else {
        if (isUnauthorizedError(appointmentsRes.reason)) {
          handleLogout();
          return;
        }
        setAppointments([]);
      }

      if (todayAppointmentsRes.status === 'fulfilled') {
        setTodayAppointments(todayAppointmentsRes.value?.data || []);
      } else {
        if (isUnauthorizedError(todayAppointmentsRes.reason)) {
          handleLogout();
          return;
        }
        setTodayAppointments([]);
      }

      try {
        const paymentAnalyticsRes = await axios.get(
          `${API_BASE_URL}/appointments/doctor/payments/analytics`,
          axiosConfig
        );
        setPaymentAnalyticsData(paymentAnalyticsRes?.data || null);
      } catch (error) {
        setPaymentAnalyticsData(null);
      }

      try {
        setReviewsLoading(true);
        const [reviewsRes, summaryRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/appointments/doctors/${doctorId}/reviews`, axiosConfig),
          axios.get(`${API_BASE_URL}/appointments/doctors/${doctorId}/reviews/summary`, axiosConfig)
        ]);
        setDoctorReviews(reviewsRes?.data || []);
        setDoctorReviewSummary(summaryRes?.data || { averageRating: 0, totalReviews: 0 });
      } catch (error) {
        setDoctorReviews([]);
        setDoctorReviewSummary({ averageRating: 0, totalReviews: 0 });
      } finally {
        setReviewsLoading(false);
      }

      try {
        setMessageThreadsLoading(true);
        const threadsRes = await axios.get(`${API_BASE_URL}/messages/doctor/threads`, axiosConfig);
        setMessageThreads(threadsRes?.data || []);
      } catch (error) {
        setMessageThreads([]);
      } finally {
        setMessageThreadsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch doctor dashboard:', error);
      if (isUnauthorizedError(error)) {
        handleLogout();
      }
      setPaymentAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const today = getLocalDateString();
  const pendingAppointments = appointments.filter((a) => {
    if (a.status !== 'PENDING') return false;
    const dateKey = normalizeDateKey(a.appointmentDate);
    return dateKey ? dateKey >= today : false;
  });
  
  const confirmedAppointments = appointments.filter((a) => a.status === 'CONFIRMED');
  
  const todayEarnings = todayAppointments
    .filter((a) => {
      const status = String(a.status || '').toUpperCase();
      return status === 'COMPLETED';
    })
    .reduce((sum, a) => sum + Number(a.consultationFee || 0), 0);

  const doctorName = doctorDetails?.doctorName || doctorDetails?.user?.name || appointments?.[0]?.doctorName || user?.name || 'Doctor';
  const doctorSpecialization = doctorDetails?.specializationName || doctorDetails?.specialization || appointments?.[0]?.specialization || 'General Physician';

  const todayOverviewList = todayAppointments.slice(0, 50);
  const sortedToday = [...todayOverviewList].sort((a, b) => {
    const statusPriority = (value) => {
      const s = String(value || '').toUpperCase();
      if (s === 'CONFIRMED') return 0;
      if (s === 'PENDING') return 1;
      if (s === 'IN_PROGRESS') return 2;
      if (s === 'COMPLETED') return 3;
      if (s === 'CANCELLED') return 4;
      return 5;
    };

    const statusDiff = statusPriority(a.status) - statusPriority(b.status);
    if (statusDiff !== 0) return statusDiff;

    return String(a.appointmentTime || '').localeCompare(String(b.appointmentTime || ''));
  });

  const patientDetailsToday = sortedToday.filter((item) => {
    const status = String(item.status || '').toUpperCase();
    return status === 'CONFIRMED' || status === 'COMPLETED';
  });

  const todayOps = useMemo(() => {
    const completed = todayAppointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelled = todayAppointments.filter((a) => a.status === 'CANCELLED').length;
    const pending = todayAppointments.filter((a) => a.status === 'PENDING').length;
    const confirmed = todayAppointments.filter((a) => a.status === 'CONFIRMED').length;
    const total = todayAppointments.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;
    const avgFeeToday =
      total > 0
        ? todayAppointments.reduce((sum, a) => sum + Number(a.consultationFee || 0), 0) / total
        : 0;
    const now = new Date();
    const activeTodaySorted = todayAppointments
      .filter((a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
      .map((a) => ({
        raw: a,
        dateTime: new Date(`${a.appointmentDate || today}T${a.appointmentTime || '00:00:00'}`)
      }))
      .sort((a, b) => a.dateTime - b.dateTime);

    const nextUpcoming = activeTodaySorted.find((item) => item.dateTime >= now);
    const nextAppointment = nextUpcoming?.raw || activeTodaySorted[0]?.raw || null;

    return {
      total,
      completed,
      cancelled,
      pending,
      confirmed,
      completionRate,
      cancellationRate,
      avgFeeToday,
      nextAppointment
    };
  }, [todayAppointments, today]);

  const analysisByDay = useMemo(() => {
    const map = {};
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getLocalDateString(d);
      map[key] = 0;
    }
    appointments.forEach((a) => {
      const dateKey = normalizeDateKey(a.appointmentDate);
      if (dateKey && map[dateKey] !== undefined) {
        map[dateKey] += 1;
      }
    });
    return Object.entries(map).map(([date, count]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      count
    }));
  }, [appointments]);

  const weeklyAveragePatients = useMemo(() => {
    if (!analysisByDay.length) return 0;
    const total = analysisByDay.reduce((sum, item) => sum + item.count, 0);
    return total / analysisByDay.length;
  }, [analysisByDay]);

  const weeklyMaxPatients = useMemo(() => {
    const maxCount = analysisByDay.reduce((max, item) => Math.max(max, item.count), 0);
    return Math.max(1, maxCount, Math.ceil(weeklyAveragePatients));
  }, [analysisByDay, weeklyAveragePatients]);

  const patientMix = useMemo(() => {
    const isOnlineVisit = (visitType) => {
      const normalized = String(visitType || '').toUpperCase();
      return normalized.includes('ONLINE') || normalized.includes('VIDEO');
    };

    const safeDateTime = (item) =>
      new Date(`${item.appointmentDate || '1970-01-01'}T${item.appointmentTime || '00:00:00'}`);

    const nonCancelled = appointments.filter((a) => a.status !== 'CANCELLED');
    const sortedAll = [...nonCancelled].sort((a, b) => safeDateTime(a) - safeDateTime(b));

    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 30);

    const firstSeenByPatient = new Map();
    sortedAll.forEach((a) => {
      if (!firstSeenByPatient.has(a.patientId)) {
        firstSeenByPatient.set(a.patientId, safeDateTime(a));
      }
    });

    const sourceAppointments = sortedAll.filter((a) => safeDateTime(a) >= windowStart);
    const counts = { old: 0, online: 0, new: 0 };
    const seenInWindowByPatient = new Set();
    const patientsWithHistoryBeforeWindow = new Set();

    firstSeenByPatient.forEach((firstSeenDate, patientId) => {
      if (patientId !== undefined && patientId !== null && firstSeenDate < windowStart) {
        patientsWithHistoryBeforeWindow.add(patientId);
      }
    });

    sourceAppointments.forEach((a) => {
      if (isOnlineVisit(a.visitType)) {
        counts.online += 1;
        return;
      }
      const patientId = a.patientId;

      if (patientId === undefined || patientId === null) {
        counts.old += 1;
        return;
      }

      if (patientsWithHistoryBeforeWindow.has(patientId)) {
        counts.old += 1;
        return;
      }

      if (seenInWindowByPatient.has(patientId)) {
        counts.old += 1;
        return;
      }

      counts.new += 1;
      seenInWindowByPatient.add(patientId);
    });

    const total = counts.old + counts.online + counts.new || 1;
    return {
      ...counts,
      total,
      oldPct: Math.round((counts.old / total) * 100),
      onlinePct: Math.round((counts.online / total) * 100),
      newPct: Math.round((counts.new / total) * 100)
    };
  }, [appointments]);

  const filteredDoctorReviews = useMemo(() => {
    const q = reviewSearchText.trim().toLowerCase();
    const source = Array.isArray(doctorReviews) ? doctorReviews : [];
    const patientReviewCount = source.reduce((acc, review) => {
      const key = String(review.patientId ?? review.patientName ?? '').trim();
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const filtered = !q ? source : source.filter((review) =>
      String(review.patientName || '').toLowerCase().includes(q) ||
      String(review.feedback || '').toLowerCase().includes(q)
    );

    const sorted = [...filtered].sort((a, b) => {
      const keyA = String(a.patientId ?? a.patientName ?? '').trim();
      const keyB = String(b.patientId ?? b.patientName ?? '').trim();
      const countA = patientReviewCount[keyA] || 0;
      const countB = patientReviewCount[keyB] || 0;
      const dateA = new Date(a.reviewedAt || a.appointmentDate || 0).getTime();
      const dateB = new Date(b.reviewedAt || b.appointmentDate || 0).getTime();

      if (reviewSortBy === 'most_reviewed_patient') {
        if (countB !== countA) return countB - countA;
        return dateB - dateA;
      }
      if (reviewSortBy === 'less_reviewed_patient') {
        if (countA !== countB) return countA - countB;
        return dateB - dateA;
      }
      return dateB - dateA;
    });

    return sorted;
  }, [doctorReviews, reviewSearchText, reviewSortBy]);

  const filteredAppointmentsList = useMemo(() => {
    const q = searchText.toLowerCase();
    return [...appointments]
      .filter((a) => (a.patientName || '').toLowerCase().includes(q))
      .filter((a) => {
        if (appointmentStatusFilter === 'all') return true;
        return String(a.status || '').toUpperCase() === appointmentStatusFilter.toUpperCase();
      })
      .sort((a, b) => {
        const da = new Date(`${a.appointmentDate || '1970-01-01'}T${a.appointmentTime || '00:00:00'}`);
        const db = new Date(`${b.appointmentDate || '1970-01-01'}T${b.appointmentTime || '00:00:00'}`);
        return db - da;
      });
  }, [appointments, searchText, appointmentStatusFilter]);

  const appointmentStatusCounts = useMemo(() => {
    const counts = {
      all: appointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    };
    appointments.forEach((a) => {
      const s = String(a.status || '').toUpperCase();
      if (s === 'PENDING') counts.pending += 1;
      if (s === 'CONFIRMED') counts.confirmed += 1;
      if (s === 'COMPLETED') counts.completed += 1;
      if (s === 'CANCELLED') counts.cancelled += 1;
    });
    return counts;
  }, [appointments]);

  const derivedPaymentAnalytics = useMemo(() => {
    const safeFee = (value) => Number(value || 0);
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const completed = appointments.filter((a) => String(a.status || '').toUpperCase() === 'COMPLETED');
    const pendingOrConfirmed = appointments.filter((a) => {
      const s = String(a.status || '').toUpperCase();
      return s === 'PENDING' || s === 'CONFIRMED';
    });
    const cancelled = appointments.filter((a) => String(a.status || '').toUpperCase() === 'CANCELLED');

    const totalRevenue = completed.reduce((sum, a) => sum + safeFee(a.consultationFee), 0);
    const expectedRevenue = pendingOrConfirmed.reduce((sum, a) => sum + safeFee(a.consultationFee), 0);
    const cancelledAmount = cancelled.reduce((sum, a) => sum + safeFee(a.consultationFee), 0);

    const thisMonthCompleted = completed.filter((a) => String(a.appointmentDate || '').startsWith(currentMonthKey));
    const thisMonthRevenue = thisMonthCompleted.reduce((sum, a) => sum + safeFee(a.consultationFee), 0);
    const thisMonthAvgFee = thisMonthCompleted.length > 0 ? thisMonthRevenue / thisMonthCompleted.length : 0;

    const onlineCompletedRevenue = completed
      .filter((a) => String(a.visitType || '').toUpperCase().includes('ONLINE'))
      .reduce((sum, a) => sum + safeFee(a.consultationFee), 0);
    const clinicCompletedRevenue = Math.max(0, totalRevenue - onlineCompletedRevenue);

    const last6Months = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return {
        key,
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: 0
      };
    });
    const revenueByMonth = new Map(last6Months.map((m) => [m.key, 0]));
    completed.forEach((a) => {
      const date = String(a.appointmentDate || '');
      const key = date.length >= 7 ? date.slice(0, 7) : '';
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(key, revenueByMonth.get(key) + safeFee(a.consultationFee));
      }
    });
    const monthlyRevenue = last6Months.map((m) => ({
      ...m,
      revenue: revenueByMonth.get(m.key) || 0
    }));
    const monthlyPeak = Math.max(1, ...monthlyRevenue.map((m) => m.revenue));

    const last7Days = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(now.getDate() - (6 - idx));
      const key = getLocalDateString(d);
      return {
        key,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: 0
      };
    });
    const revenueByDay = new Map(last7Days.map((d) => [d.key, 0]));
    completed.forEach((a) => {
      const key = normalizeDateKey(a.appointmentDate);
      if (revenueByDay.has(key)) {
        revenueByDay.set(key, revenueByDay.get(key) + safeFee(a.consultationFee));
      }
    });
    const weeklyRevenue = last7Days.map((d) => ({
      ...d,
      revenue: revenueByDay.get(d.key) || 0
    }));
    const weeklyPeak = Math.max(1, ...weeklyRevenue.map((d) => d.revenue));
    const weeklyTotalRevenue = weeklyRevenue.reduce((sum, d) => sum + d.revenue, 0);
    const weeklyAverageRevenue = weeklyRevenue.length > 0 ? weeklyTotalRevenue / weeklyRevenue.length : 0;

    const collectibleBase = totalRevenue + expectedRevenue;
    const collectionRate = collectibleBase > 0 ? Math.round((totalRevenue / collectibleBase) * 100) : 0;

    const recentPaid = [...completed]
      .sort((a, b) => {
        const da = new Date(`${a.appointmentDate || '1970-01-01'}T${a.appointmentTime || '00:00:00'}`);
        const db = new Date(`${b.appointmentDate || '1970-01-01'}T${b.appointmentTime || '00:00:00'}`);
        return db - da;
      })
      .slice(0, 6);

    return {
      totalRevenue,
      expectedRevenue,
      cancelledAmount,
      thisMonthRevenue,
      thisMonthAvgFee,
      onlineCompletedRevenue,
      clinicCompletedRevenue,
      monthlyRevenue,
      monthlyPeak,
      weeklyRevenue,
      weeklyPeak,
      weeklyTotalRevenue,
      weeklyAverageRevenue,
      collectionRate,
      recentPaid
    };
  }, [appointments]);

  const paymentAnalytics = useMemo(() => {
    const source = paymentAnalyticsData || derivedPaymentAnalytics;

    const monthlyRevenue = Array.isArray(source?.monthlyRevenue) ? source.monthlyRevenue : [];
    const weeklyRevenue = Array.isArray(source?.weeklyRevenue) ? source.weeklyRevenue : [];
    const recentPaid = Array.isArray(source?.recentPaid) ? source.recentPaid : [];

    return {
      totalRevenue: Number(source?.totalRevenue || 0),
      expectedRevenue: Number(source?.expectedRevenue || 0),
      cancelledAmount: Number(source?.cancelledAmount || 0),
      thisMonthRevenue: Number(source?.thisMonthRevenue || 0),
      thisMonthAvgFee: Number(source?.thisMonthAvgFee || 0),
      onlineCompletedRevenue: Number(source?.onlineCompletedRevenue || 0),
      clinicCompletedRevenue: Number(source?.clinicCompletedRevenue || 0),
      monthlyRevenue,
      monthlyPeak: Math.max(1, Number(source?.monthlyPeak || 1)),
      weeklyRevenue,
      weeklyPeak: Math.max(1, Number(source?.weeklyPeak || 1)),
      weeklyTotalRevenue: Number(source?.weeklyTotalRevenue || 0),
      weeklyAverageRevenue: Number(source?.weeklyAverageRevenue || 0),
      collectionRate: Number(source?.collectionRate || 0),
      recentPaid
    };
  }, [paymentAnalyticsData, derivedPaymentAnalytics]);

  const monthlyAverageRevenue =
    (paymentAnalytics.monthlyRevenue || []).reduce((sum, item) => sum + Number(item.revenue || 0), 0) /
    Math.max(1, (paymentAnalytics.monthlyRevenue || []).length);
  const monthlyAverageLinePct =
    (monthlyAverageRevenue / Math.max(1, Number(paymentAnalytics.monthlyPeak || 1))) * 100;
  const weeklyAverageLinePct =
    (Number(paymentAnalytics.weeklyAverageRevenue || 0) / Math.max(1, Number(paymentAnalytics.weeklyPeak || 1))) * 100;

  const messageQuickTemplates = [
    'Please join 5 minutes before your slot.',
    'Please share your latest reports before consultation.',
    'Your appointment is confirmed. See you soon.',
    'Please schedule a follow-up after 7 days.'
  ];

  useEffect(() => {
    if (!selectedMessageThreadId && messageThreads.length > 0) {
      setSelectedMessageThreadId(String(messageThreads[0].id));
    }
  }, [selectedMessageThreadId, messageThreads]);

  useEffect(() => {
    if (!selectedMessageThreadId) return;
    const key = String(selectedMessageThreadId);
    if (threadMessagesById[key]) return;
    openMessageThread(key);
  }, [selectedMessageThreadId, threadMessagesById]);

  const filteredMessageThreads = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return messageThreads
      .filter((thread) => (q ? String(thread.patientName || '').toLowerCase().includes(q) : true))
      .filter((thread) => {
        if (messageFilter === 'unread') return thread.unreadCount > 0;
        if (messageFilter === 'today') return normalizeDateKey(thread.appointmentDate) === today;
        if (messageFilter === 'pending') {
          return thread.appointmentStatus === 'PENDING';
        }
        return true;
      });
  }, [messageThreads, messageFilter, searchText, today]);

  const activeMessageThread = useMemo(
    () => messageThreads.find((thread) => String(thread.id) === String(selectedMessageThreadId)) || filteredMessageThreads[0] || null,
    [messageThreads, selectedMessageThreadId, filteredMessageThreads]
  );

  const totalUnreadMessages = useMemo(
    () => messageThreads.reduce((sum, thread) => sum + Number(thread.unreadCount || 0), 0),
    [messageThreads]
  );

  const fetchMessageThreads = async () => {
    try {
      setMessageThreadsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/messages/doctor/threads`, axiosConfig);
      setMessageThreads(res?.data || []);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      setMessageThreads([]);
    } finally {
      setMessageThreadsLoading(false);
    }
  };

  const openMessageThread = async (threadId) => {
    const id = String(threadId);
    setSelectedMessageThreadId(id);
    try {
      setMessagesLoading(true);
      const [messagesRes, markReadRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/messages/doctor/threads/${id}/messages`, axiosConfig),
        axios.patch(`${API_BASE_URL}/messages/doctor/threads/${id}/read`, {}, axiosConfig)
      ]);

      if (messagesRes.status === 'fulfilled') {
        setThreadMessagesById((prev) => ({ ...prev, [id]: messagesRes.value?.data || [] }));
      } else if (isUnauthorizedError(messagesRes.reason)) {
        handleLogout();
        return;
      } else {
        setThreadMessagesById((prev) => ({ ...prev, [id]: prev[id] || [] }));
      }

      if (markReadRes.status === 'rejected' && isUnauthorizedError(markReadRes.reason)) {
        handleLogout();
        return;
      }

      await fetchMessageThreads();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      setThreadMessagesById((prev) => ({ ...prev, [id]: prev[id] || [] }));
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessageToThread = async (textInput) => {
    const text = String(textInput || '').trim();
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
        `${API_BASE_URL}/messages/doctor/threads/${activeMessageThread.id}/messages`,
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
      await fetchMessageThreads();
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
    }
  };

  const handleDraftTyping = (value) => {
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
  };

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
            const res = await axios.get(`${API_BASE_URL}/messages/doctor/threads`, axiosConfig);
            if (isActive) {
              setMessageThreads(res?.data || []);
            }
          } catch (error) {
            // Ignore transient refresh failures
          }
        } catch (error) {
          // Ignore malformed websocket payloads
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

  const doctorPatientsList = useMemo(() => {
    const byPatient = new Map();

    appointments.forEach((a) => {
      const patientKey = a.patientId ?? `name:${a.patientName || 'unknown'}`;
      const dateTime = new Date(`${a.appointmentDate || '1970-01-01'}T${a.appointmentTime || '00:00:00'}`);

      if (!byPatient.has(patientKey)) {
        byPatient.set(patientKey, {
          patientId: a.patientId,
          patientName: a.patientName || 'Patient',
          age: a.patientSnapshotAge ?? 'N/A',
          gender: a.patientSnapshotGender ?? 'N/A',
          bloodGroup: a.patientSnapshotBloodGroup ?? 'N/A',
          allergies: a.patientSnapshotAllergies || 'None',
          emergencyContactName:
            a.patientEmergencyContactName ?? a.patient_emergency_contact_name ?? 'N/A',
          emergencyContactPhone:
            a.patientEmergencyContactPhone ?? a.patient_emergency_contact_phone ?? 'N/A',
          totalAppointments: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          lastAppointmentDate: a.appointmentDate || '-',
          lastAppointmentTime: a.appointmentTime || '-',
          lastStatus: a.status || 'PENDING',
          _lastDateTime: dateTime
        });
      }

      const item = byPatient.get(patientKey);
      item.totalAppointments += 1;
      const status = String(a.status || '').toUpperCase();
      if (status === 'PENDING') item.pending += 1;
      if (status === 'CONFIRMED') item.confirmed += 1;
      if (status === 'COMPLETED') item.completed += 1;
      if (status === 'CANCELLED') item.cancelled += 1;

      if (dateTime > item._lastDateTime) {
        item._lastDateTime = dateTime;
        item.lastAppointmentDate = a.appointmentDate || '-';
        item.lastAppointmentTime = a.appointmentTime || '-';
        item.lastStatus = a.status || 'PENDING';
      }
    });

    return Array.from(byPatient.values())
      .sort((a, b) => b._lastDateTime - a._lastDateTime);
  }, [appointments]);

  const filteredDoctorPatientsList = useMemo(() => {
    const q = myPatientsSearchText.trim().toLowerCase();
    if (!q) return doctorPatientsList;
    return doctorPatientsList.filter((p) =>
      p.patientName.toLowerCase().includes(q) ||
      String(p.emergencyContactName || '').toLowerCase().includes(q) ||
      String(p.emergencyContactPhone || '').toLowerCase().includes(q)
    );
  }, [doctorPatientsList, myPatientsSearchText]);

  const selectedPatientRecords = useMemo(() => {
    if (!selectedPatient?.patientId) return [];
    return appointments
      .filter((appt) => appt.patientId === selectedPatient.patientId)
      .sort((a, b) => {
        const da = new Date(`${a.appointmentDate || '1970-01-01'}T${a.appointmentTime || '00:00:00'}`);
        const db = new Date(`${b.appointmentDate || '1970-01-01'}T${b.appointmentTime || '00:00:00'}`);
        return db - da;
      });
  }, [appointments, selectedPatient]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleDoctorChatQuickAction = (action) => {
    const key = String(action || '').toUpperCase();
    if (key === 'OPEN_OVERVIEW') {
      setActiveSection('Overview');
      return;
    }
    if (key === 'OPEN_APPOINTMENTS') {
      setActiveSection('Appointments');
      setAppointmentStatusFilter('all');
      return;
    }
    if (key === 'OPEN_PENDING_REQUESTS') {
      setActiveSection('Appointments');
      setAppointmentStatusFilter('pending');
      return;
    }
    if (key === 'OPEN_CONFIRMED_APPOINTMENTS') {
      setActiveSection('Appointments');
      setAppointmentStatusFilter('confirmed');
    }
  };

  const clearMessageLater = () => {
    window.setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getAvailabilityErrorMessage = (error) => {
    const raw =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      '';
    const normalized = String(raw).toLowerCase();

    if (
      normalized.includes('uk_doctor_availability_slot') ||
      normalized.includes('duplicate entry') ||
      normalized.includes('duplicate key')
    ) {
      return 'This schedule already exists for the selected date/time. Please choose a different time range or update existing slots.';
    }

    if (normalized.includes('start time must be before end time')) {
      return 'Start time must be earlier than end time.';
    }

    if (normalized.includes('doctor is not active')) {
      return 'Your account is not active yet. Please contact admin to enable scheduling.';
    }

    return raw || 'Failed to update availability.';
  };

  const handleAcceptAppointment = async (appointmentId) => {
    setActionLoadingId(appointmentId);
    try {
      await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/confirm`, {}, axiosConfig);
      
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId ? { ...item, status: 'CONFIRMED' } : item
        )
      );
      setTodayAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId ? { ...item, status: 'CONFIRMED' } : item
        )
      );
      
      setMessage({ type: 'success', text: 'Appointment accepted successfully.' });
      clearMessageLater();

      if (user?.id) {
        await fetchDashboardData(user.id);
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      const serverMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to accept appointment.';
      setMessage({ type: 'error', text: serverMessage });
      clearMessageLater();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    setActionLoadingId(appointmentId);
    try {
      await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
        { reason: 'Rejected by doctor' },
        axiosConfig
      );
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId ? { ...item, status: 'CANCELLED' } : item
        )
      );
      setTodayAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId ? { ...item, status: 'CANCELLED' } : item
        )
      );
      setMessage({ type: 'success', text: 'Appointment rejected successfully.' });
      clearMessageLater();

      if (user?.id) {
        await fetchDashboardData(user.id);
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      const serverMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to reject appointment.';
      setMessage({ type: 'error', text: serverMessage });
      clearMessageLater();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewReceipt = async (appointmentId) => {
    if (!appointmentId) return;
    setReceiptLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/appointments/${appointmentId}/receipt`, axiosConfig);
      setSelectedReceipt(res?.data || null);
      setShowReceiptModal(true);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      const serverMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Receipt is not available yet.';
      setMessage({ type: 'error', text: serverMessage });
      clearMessageLater();
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    const appointmentToComplete = appointments.find(a => a.id === appointmentId);
    
    if (!appointmentToComplete) {
      setMessage({ type: 'error', text: 'Appointment not found.' });
      clearMessageLater();
      return;
    }
    
    if (!appointmentToComplete.patientId) {
      setMessage({ type: 'error', text: 'Patient information not available.' });
      clearMessageLater();
      return;
    }
    
    setSelectedAppointmentForVitals(appointmentToComplete);
    setShowVitalsModal(true);
  };

  const handleAppointmentCompleted = async (appointmentId) => {
    if (!appointmentId) {
      console.error('Appointment ID is undefined');
      setMessage({ type: 'error', text: 'Invalid appointment ID' });
      clearMessageLater();
      return;
    }

    setActionLoadingId(appointmentId);
    try {
      const response = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {}, axiosConfig);
      const updatedAppointment = response?.data;
      
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId
            ? { ...item, ...updatedAppointment, status: 'COMPLETED' }
            : item
        )
      );
      
      setTodayAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId
            ? { ...item, ...updatedAppointment, status: 'COMPLETED' }
            : item
        )
      );
      
      setMessage({ type: 'success', text: 'Appointment completed and vitals recorded successfully.' });
      clearMessageLater();
    } catch (error) {
      console.error('Error completing appointment:', error);
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      const serverMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Failed to mark appointment as completed.';
      setMessage({ type: 'error', text: serverMessage });
      clearMessageLater();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteWithoutVitals = async (appointmentId) => {
    if (!appointmentId) {
      console.error('Appointment ID is undefined');
      setMessage({ type: 'error', text: 'Invalid appointment ID' });
      clearMessageLater();
      return;
    }

    if (window.confirm('Are you sure you want to complete this appointment without recording vitals?')) {
      setActionLoadingId(appointmentId);
      try {
        const response = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}/complete`, {}, axiosConfig);
        const updatedAppointment = response?.data;
        
        setAppointments((prev) =>
          prev.map((item) =>
            item.id === appointmentId
              ? { ...item, ...updatedAppointment, status: 'COMPLETED' }
              : item
          )
        );
        
        setTodayAppointments((prev) =>
          prev.map((item) =>
            item.id === appointmentId
              ? { ...item, ...updatedAppointment, status: 'COMPLETED' }
              : item
          )
        );
        
        setMessage({ type: 'success', text: 'Appointment marked as completed.' });
        clearMessageLater();
      } catch (error) {
        console.error('Error completing appointment:', error);
        if (isUnauthorizedError(error)) {
          handleLogout();
          return;
        }
        const serverMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Failed to mark appointment as completed.';
        setMessage({ type: 'error', text: serverMessage });
        clearMessageLater();
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleSetDailyAvailability = async () => {
    if (!availabilityForm.date || !availabilityForm.startTime || !availabilityForm.endTime) {
      setMessage({ type: 'error', text: 'Please select date, start time and end time.' });
      clearMessageLater();
      return;
    }

    setAvailabilityLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/doctors/availability/daily`,
        {
          date: availabilityForm.date,
          startTime: availabilityForm.startTime,
          endTime: availabilityForm.endTime
        },
        axiosConfig
      );
      setMessage({ type: 'success', text: 'Availability updated successfully.' });
      clearMessageLater();

      const res = await axios.get(
        `${API_BASE_URL}/doctors/availability/slots?date=${availabilityForm.date}`,
        axiosConfig
      );
      setAvailabilityPreviewSlots((res?.data || []).map((slot) => String(slot).slice(0, 5)));
    } catch (error) {
      if (error?.response?.status === 401) {
        handleLogout();
        return;
      }
      if (error?.response?.status === 403) {
        setMessage({ type: 'error', text: 'Access denied for setting availability. Please verify your doctor account status.' });
        clearMessageLater();
        return;
      }
      setMessage({ type: 'error', text: getAvailabilityErrorMessage(error) });
      clearMessageLater();
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleViewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
    if (!patient?.patientId) {
      setSelectedPatientVitals([]);
      setSelectedPatientVitalsError('No patient ID available for vitals.');
      return;
    }
    setSelectedPatientVitalsError('');
    setSelectedPatientVitalsLoading(true);
    patientVitalService
      .getPatientVitals(patient.patientId)
      .then((data) => {
        const rows = Array.isArray(data) ? data : [];
        const sorted = [...rows].sort((a, b) => {
          const da = new Date(a.recordedAt || a.createdAt || 0);
          const db = new Date(b.recordedAt || b.createdAt || 0);
          return db - da;
        });
        setSelectedPatientVitals(sorted);
      })
      .catch((error) => {
        if (isUnauthorizedError(error)) {
          handleLogout();
          return;
        }
        setSelectedPatientVitals([]);
        setSelectedPatientVitalsError(error?.message || 'Unable to load vitals.');
      })
      .finally(() => setSelectedPatientVitalsLoading(false));
  };

  const handleViewPatientFromAppointment = (appointment) => {
    const fallback = {
      patientId: appointment.patientId,
      patientName: appointment.patientName || 'Patient',
      age: appointment.patientSnapshotAge ?? 'N/A',
      gender: appointment.patientSnapshotGender ?? 'N/A',
      bloodGroup: appointment.patientSnapshotBloodGroup ?? 'N/A',
      allergies: appointment.patientSnapshotAllergies || 'None',
      emergencyContactName: appointment.patientEmergencyContactName ?? 'N/A',
      emergencyContactPhone: appointment.patientEmergencyContactPhone ?? 'N/A',
      lastAppointmentDate: appointment.appointmentDate || '-',
      lastAppointmentTime: appointment.appointmentTime || '-',
      lastStatus: appointment.status || 'PENDING'
    };
    const fromList = doctorPatientsList.find((p) => p.patientId === appointment.patientId);
    handleViewPatientDetails(fromList || fallback);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-indigo-100 border-t-indigo-400 rounded-full animate-spin-slow" />
              <Heart className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium mt-6">Loading doctor dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Navigation Bar - Google Style */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-2 rounded-lg shadow-md">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  MediCare
                </span>
                <span className="block text-[10px] text-gray-400">Doctor Portal</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeSection === item.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {item.badge && totalUnreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {totalUnreadMessages}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden lg:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-64">
                <Search size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-700"
                />
              </div>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              >
                <Bell size={18} className="text-gray-600" />
                {patientDetailsToday.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                )}
              </button>

            


              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                    {doctorName?.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-700">Dr. {doctorName?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-400">{doctorSpecialization}</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                      <p className="text-sm font-medium text-gray-900">Dr. {doctorName}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-left">
                        <UserRound size={14} className="text-gray-500" />
                        <span className="text-sm text-gray-700">Profile</span>
                      </button>
                    
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 text-left"
                      >
                        <LogOut size={14} className="text-rose-500" />
                        <span className="text-sm text-rose-600">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-2">
              <div className="grid grid-cols-4 gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center p-2 rounded-lg ${
                      activeSection === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'
                    }`}
                  >
                    <item.icon size={16} />
                    <span className="text-[10px] mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Mobile Search */}
              <div className="mt-2 flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <Search size={14} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed right-4 top-16 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {patientDetailsToday.length > 0 ? (
              patientDetailsToday.slice(0, 5).map((patient) => (
                <div key={patient.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-gray-900">{patient.patientName}</span> - {patient.appointmentTime}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{patient.status} appointment</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{activeSection}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Overview Section */}
  {activeSection === 'Overview' && (
  <div className="space-y-8">
    {/* Stats Grid - Made cards bigger */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  <StatCard
    icon={CalendarDays}
    label="Today's Appointments"
    value={todayOps.total}
    trend={{ value: 12, direction: 'up' }}
    color="blue"
    className="scale-110 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-br from-white to-blue-50/30"
    iconClassName="w-10 h-10"
    valueClassName="text-3xl font-bold"
    labelClassName="text-base"
  />
  <StatCard
    icon={Users}
    label="Total Patients"
    value={doctorPatientsList.length}
    trend={{ value: 8, direction: 'up' }}
    color="emerald"
    className="scale-110 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-br from-white to-emerald-50/30"
    iconClassName="w-10 h-10"
    valueClassName="text-3xl font-bold"
    labelClassName="text-base"
  />
  <StatCard
    icon={Clock}
    label="Pending Requests"
    value={pendingAppointments.length}
    trend={{ value: 5, direction: 'down' }}
    color="amber"
    className="scale-110 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-br from-white to-amber-50/30"
    iconClassName="w-10 h-10"
    valueClassName="text-3xl font-bold"
    labelClassName="text-base"
  />
  <StatCard
    icon={DollarSign}
    label="Today's Earnings"
    value={`₹${todayEarnings.toFixed(0)}`}
    color="violet"
    className="scale-110 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-br from-white to-violet-50/30"
    iconClassName="w-10 h-10"
    valueClassName="text-3xl font-bold"
    labelClassName="text-base"
  />
</div>

    {/* Today's Operations */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-700">Today's Operations</h2>
            <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full font-medium">
              {todayOps.total} appointments
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-emerald-50/50 rounded-xl p-4">
              <p className="text-xs text-emerald-600 font-medium">Completion</p>
              <p className="text-xl font-semibold text-emerald-700">{todayOps.completionRate}%</p>
            </div>
            <div className="bg-rose-50/50 rounded-xl p-4">
              <p className="text-xs text-rose-600 font-medium">Cancellation</p>
              <p className="text-xl font-semibold text-rose-700">{todayOps.cancellationRate}%</p>
            </div>
            <div className="bg-amber-50/50 rounded-xl p-4">
              <p className="text-xs text-amber-600 font-medium">Pending</p>
              <p className="text-xl font-semibold text-amber-700">{todayOps.pending}</p>
            </div>
            <div className="bg-blue-50/50 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium">Avg Fee</p>
              <p className="text-xl font-semibold text-blue-700">₹{todayOps.avgFeeToday.toFixed(0)}</p>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-medium text-amber-700 mb-2">Next Appointment</p>
            {todayOps.nextAppointment ? (
              <p className="text-sm font-medium">
                {todayOps.nextAppointment.appointmentTime} - {todayOps.nextAppointment.patientName}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No upcoming appointment</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <h2 className="text-base font-medium text-gray-700">Quick Actions</h2>
        </div>
        <div className="p-6 space-y-3">
          <button className="w-full p-4 text-left bg-gray-50/80 rounded-xl hover:bg-blue-50/50 transition-all group">
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Set Availability</p>
            <p className="text-xs text-gray-400 mt-1">Manage your schedule</p>
          </button>
          <button className="w-full p-4 text-left bg-gray-50/80 rounded-xl hover:bg-blue-50/50 transition-all group">
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">View Reports</p>
            <p className="text-xs text-gray-400 mt-1">Analytics & insights</p>
          </button>
          <button className="w-full p-4 text-left bg-gray-50/80 rounded-xl hover:bg-blue-50/50 transition-all group">
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Messages</p>
            <p className="text-xs text-gray-400 mt-1">{totalUnreadMessages} unread</p>
          </button>
        </div>
      </div>
    </div>

    {/* Today's Appointments Table - Updated with Google-like design */}
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-700">Today's Appointments</h2>
          <button
            onClick={() => setActiveSection('Appointments')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            View all →
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {sortedToday.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No appointments scheduled for today</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedToday.map((appointment) => (
                <TodayAppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  onComplete={handleCompleteAppointment}
                  onViewReceipt={handleViewReceipt}
                  onViewRecords={handleViewPatientFromAppointment}
                  isLoading={actionLoadingId === appointment.id}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>

    {/* Two Column Layout */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Appointment Requests */}
<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
  <div className="px-6 py-4 border-b border-gray-100 bg-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">Appointment Requests</h2>
        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          {pendingAppointments.length}
        </span>
      </div>
      <button
        onClick={() => {
          setActiveSection('Appointments');
          setAppointmentStatusFilter('pending');
        }}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
      >
        View all →
      </button>
    </div>
  </div>

  <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
    {pendingAppointments.length === 0 ? (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
          <CalendarDays className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">No pending requests</p>
        <p className="text-xs text-gray-400 mt-1">New requests will appear here</p>
      </div>
    ) : (
      <div className="space-y-3">
        {pendingAppointments.slice(0, 3).map((appointment) => (
          <AppointmentRequestCard
            key={appointment.id}
            appointment={appointment}
            onAccept={handleAcceptAppointment}
            onReject={handleRejectAppointment}
            isLoading={actionLoadingId === appointment.id}
          />
        ))}
        
        {pendingAppointments.length > 3 && (
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setActiveSection('Appointments');
                setAppointmentStatusFilter('pending');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              +{pendingAppointments.length - 3} more requests
            </button>
          </div>
        )}
      </div>
    )}
  </div>
</div>

      {/* Patient Mix */}
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
  <div className="px-6 py-4 border-b border-gray-100 bg-white">
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold text-gray-800">Patient Mix</h2>
      <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
        Last 30 days
      </span>
    </div>
  </div>

  <div className="p-6">
    <div className="flex flex-col md:flex-row items-center gap-8">
      {/* Donut Chart */}
      <div className="relative group">
        <div
          className="h-32 w-32 rounded-full transition-transform duration-300 group-hover:scale-105"
          style={{
            background: `conic-gradient(
              #3b82f6 0deg ${patientMix.oldPct * 3.6}deg,
              #10b981 ${patientMix.oldPct * 3.6}deg ${(patientMix.oldPct + patientMix.onlinePct) * 3.6}deg,
              #f43f5e ${(patientMix.oldPct + patientMix.onlinePct) * 3.6}deg 360deg
            )`,
            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
            <span className="text-xl font-bold text-gray-800">{patientMix.total}</span>
          </div>
        </div>
      </div>

      {/* Legend with Progress Bars */}
      <div className="flex-1 w-full space-y-4">
        {/* Returning Patients */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-gray-700">Returning</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{patientMix.oldPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${patientMix.oldPct}%` }}
            />
          </div>
        </div>

        {/* Online Patients */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-gray-700">Online</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{patientMix.onlinePct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${patientMix.onlinePct}%` }}
            />
          </div>
        </div>

        {/* New Patients */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-sm font-medium text-gray-700">New</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{patientMix.newPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${patientMix.newPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    </div>

    {/* Patient Analysis Chart */}
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h2 className="text-base font-medium text-gray-700">Patient Analysis (7 days)</h2>
      </div>
      <div className="p-6">
        <div className="relative h-40">
          <div className="absolute left-0 right-0 border-t border-dashed border-gray-200" style={{ bottom: '50%' }}>
            <span className="absolute -top-5 right-0 text-xs text-gray-400 bg-white px-2">
              Avg {weeklyAveragePatients.toFixed(1)}
            </span>
          </div>
          <div className="h-full grid grid-cols-7 gap-3 items-end">
            {analysisByDay.map((item) => {
              const height = (item.count / weeklyMaxPatients) * 100;
              return (
                <div key={item.date} className="flex flex-col items-center h-full justify-end">
                  <div
                    className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2 font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>

    {/* Availability Section */}
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-md">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h2 className="text-base font-medium text-gray-700">Set Daily Availability</h2>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={availabilityForm.date}
            onChange={(e) => setAvailabilityForm({ ...availabilityForm, date: e.target.value })}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <input
            type="time"
            value={availabilityForm.startTime}
            onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <input
            type="time"
            value={availabilityForm.endTime}
            onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={handleSetDailyAvailability}
            disabled={availabilityLoading}
            className="px-6 py-3 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
          >
            {availabilityLoading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {availabilityForm.date && availabilityPreviewSlots.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-3">Published slots:</p>
            <div className="flex flex-wrap gap-2">
              {availabilityPreviewSlots.map((slot) => (
                <span key={slot} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

        {/* Appointments Section */}
        {activeSection === 'Appointments' && (
          <div className="space-y-6">
            {/* Status Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                onClick={() => setAppointmentStatusFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  appointmentStatusFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                All ({appointmentStatusCounts.all})
              </button>
              <button
                onClick={() => setAppointmentStatusFilter('pending')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  appointmentStatusFilter === 'pending'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Pending ({appointmentStatusCounts.pending})
              </button>
              <button
                onClick={() => setAppointmentStatusFilter('confirmed')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  appointmentStatusFilter === 'confirmed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Confirmed ({appointmentStatusCounts.confirmed})
              </button>
              <button
                onClick={() => setAppointmentStatusFilter('completed')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  appointmentStatusFilter === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Completed ({appointmentStatusCounts.completed})
              </button>
              <button
                onClick={() => setAppointmentStatusFilter('cancelled')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  appointmentStatusFilter === 'cancelled'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Cancelled ({appointmentStatusCounts.cancelled})
              </button>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">
                    Appointment List ({filteredAppointmentsList.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5">
                      <Search size={14} className="text-gray-400 mr-2" />
                      <input
                        type="text"
                        placeholder="Search patient..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-48 bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Fee</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAppointmentsList.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                              {appointment.patientName?.charAt(0) || 'P'}
                            </div>
                            <span className="font-medium text-gray-900">{appointment.patientName || 'Patient'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{appointment.appointmentDate}</td>
                        <td className="px-4 py-3 text-gray-600">{appointment.appointmentTime}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{appointment.reason || '-'}</td>
                        <td className="px-4 py-3 font-medium text-emerald-600">₹{Number(appointment.consultationFee || 0).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            appointment.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                            appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* My Patients Section */}
        {activeSection === 'My Patients' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{doctorPatientsList.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">With Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doctorPatientsList.filter(p => p.completed > 0).length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">With Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doctorPatientsList.filter(p => p.pending > 0).length}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-2">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={myPatientsSearchText}
                    onChange={(e) => setMyPatientsSearchText(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctorPatientsList.map((patient) => (
                <PatientCard
                  key={patient.patientId || patient.patientName}
                  patient={patient}
                  onViewDetails={handleViewPatientDetails}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {activeSection === 'Reviews' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Average Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {Number(doctorReviewSummary?.averageRating || 0).toFixed(1)}
                  </p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        size={16}
                        className={Number(doctorReviewSummary?.averageRating || 0) >= value
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{doctorReviewSummary?.totalReviews || 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">4+ Star Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredDoctorReviews.filter(r => Number(r.rating || 0) >= 4).length}
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-2">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search reviews..."
                    value={reviewSearchText}
                    onChange={(e) => setReviewSearchText(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
                <select
                  value={reviewSortBy}
                  onChange={(e) => setReviewSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="latest">Latest Reviews</option>
                  <option value="most_reviewed_patient">Most Reviewed Patient</option>
                  <option value="less_reviewed_patient">Less Reviewed Patient</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filteredDoctorReviews.map((review) => (
                  <div key={review.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.patientName || 'Patient'}</p>
                        <p className="text-xs text-gray-400">{review.appointmentDate}</p>
                      </div>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            size={14}
                            className={Number(review.rating || 0) >= value
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.feedback || 'No written feedback'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payments Section */}
        {activeSection === 'Payments' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Collected Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{paymentAnalytics.totalRevenue.toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Expected Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{paymentAnalytics.expectedRevenue.toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">₹{paymentAnalytics.thisMonthRevenue.toFixed(0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Collection Rate</p>
                <p className="text-2xl font-bold text-gray-900">{paymentAnalytics.collectionRate}%</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">Revenue Trend (Last 6 Months)</h2>
              </div>
              <div className="p-4">
                <div className="relative h-40">
                  <div className="absolute left-0 right-0 border-t border-dashed border-gray-300" style={{ bottom: '50%' }}>
                    <span className="absolute -top-4 right-0 text-[10px] text-gray-400 bg-white px-1">
                      Avg ₹{monthlyAverageRevenue.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-full grid grid-cols-6 gap-2 items-end">
                    {paymentAnalytics.monthlyRevenue.map((item) => {
                      const height = (item.revenue / paymentAnalytics.monthlyPeak) * 100;
                      return (
                        <div key={item.key} className="flex flex-col items-center h-full justify-end">
                          <div
                            className="w-full bg-indigo-500 rounded-t-sm"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                          <span className="text-[10px] text-gray-500 mt-1">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">Recent Payments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Patient</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paymentAnalytics.recentPaid.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 font-medium text-gray-900">{payment.patientName}</td>
                        <td className="px-4 py-3 text-gray-600">{payment.appointmentDate}</td>
                        <td className="px-4 py-3 font-medium text-emerald-600">
                          ₹{Number(payment.amount ?? payment.consultationFee ?? 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Messages Section */}
        {activeSection === 'Messages' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[600px] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Messages</h2>
                <div className="flex items-center gap-2">
                  {['all', 'unread', 'today', 'pending'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMessageFilter(filter)}
                      className={`text-xs px-3 py-1 rounded-full ${
                        messageFilter === filter
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Thread List */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                {messageThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => openMessageThread(thread.id)}
                    className={`w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 ${
                      activeMessageThread?.id === thread.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{thread.patientName}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{thread.lastMessageText || 'No messages'}</p>
                    {thread.unreadCount > 0 && (
                      <span className="mt-1 text-[10px] px-1.5 py-0.5 bg-rose-500 text-white rounded-full">
                        {thread.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Message Area */}
              <div className="flex-1 flex flex-col">
                {activeMessageThread ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-900">{activeMessageThread.patientName}</h3>
                      <p className="text-xs text-gray-500">
                        {onlineByUserId[Number(activeMessageThread.patientId)] ? 'Online' : 'Offline'}
                        {typingByThread[String(activeMessageThread.id)] && ' • typing...'}
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {(threadMessagesById[String(activeMessageThread.id)] || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${msg.sender === 'doctor' ? 'order-2' : ''}`}>
                            <div
                              className={`px-3 py-2 rounded-lg text-sm ${
                                msg.sender === 'doctor'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {msg.text}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={messageDraft}
                          onChange={(e) => handleDraftTyping(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessageToThread(messageDraft)}
                          placeholder="Type a message..."
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => sendMessageToThread(messageDraft)}
                          disabled={!messageDraft.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    Select a conversation to start messaging
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showConfirmedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Patient Details</h3>
              <button onClick={() => setShowConfirmedModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {patientDetailsToday.map((patient) => (
                <div key={patient.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{patient.patientName}</p>
                  <p className="text-xs text-gray-500">{patient.appointmentTime} - {patient.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Receipt</h3>
              <button onClick={() => setShowReceiptModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <p><span className="text-gray-500">Receipt ID:</span> {selectedReceipt.receiptId}</p>
              <p><span className="text-gray-500">Patient:</span> {selectedReceipt.patientName}</p>
              <p><span className="text-gray-500">Amount:</span> ₹{Number(selectedReceipt.amount || 0).toFixed(2)}</p>
              <p><span className="text-gray-500">Date:</span> {selectedReceipt.appointmentDate}</p>
            </div>
          </div>
        </div>
      )}

      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Patient Details</h3>
              <button onClick={() => setShowPatientModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-lg">
                  {selectedPatient.patientName?.charAt(0)}
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">{selectedPatient.patientName}</p>
                  <p className="text-xs text-gray-500">{selectedPatient.age} yrs � {selectedPatient.gender}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Blood Group</p>
                  <p className="font-medium">{selectedPatient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Allergies</p>
                  <p className="font-medium">{selectedPatient.allergies}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Emergency Contact</p>
                  <p className="font-medium">{selectedPatient.emergencyContactName} - {selectedPatient.emergencyContactPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Last Visit</p>
                  <p className="font-medium">{selectedPatient.lastAppointmentDate} at {selectedPatient.lastAppointmentTime}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-800">Latest Vitals</h4>
                  {selectedPatientVitalsLoading && (
                    <span className="text-xs text-gray-400">Loading...</span>
                  )}
                </div>
                {selectedPatientVitalsError && (
                  <p className="text-xs text-rose-600">{selectedPatientVitalsError}</p>
                )}
                {!selectedPatientVitalsLoading && !selectedPatientVitalsError && selectedPatientVitals.length === 0 && (
                  <p className="text-xs text-gray-400">No vitals recorded yet.</p>
                )}
                {selectedPatientVitals.length > 0 && (
                  <div className="space-y-2">
                    {selectedPatientVitals.slice(0, 3).map((vital) => (
                      <div key={vital.id} className="rounded-lg border border-gray-100 p-3 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            {vital.recordedAt
                              ? new Date(vital.recordedAt).toLocaleString()
                              : 'Recorded'}
                          </span>
                          <span className="text-[10px] text-gray-400">Vitals</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>BP: {vital.systolicBp || '-'} / {vital.diastolicBp || '-'}</div>
                          <div>HR: {vital.heartRate || '-'}</div>
                          <div>SpO2: {vital.spo2 || '-'}</div>
                          <div>Temp: {vital.temperature || '-'}</div>
                          <div>Weight: {vital.weight || '-'}</div>
                          <div>Sugar: {vital.bloodSugar || '-'}</div>
                        </div>
                        {vital.notes && (
                          <p className="mt-2 text-[11px] text-gray-500">Notes: {vital.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Recent Records</h4>
                {selectedPatientRecords.length === 0 ? (
                  <p className="text-xs text-gray-400">No records available.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedPatientRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="rounded-lg border border-gray-100 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-800">
                            {record.appointmentDate || '-'} {record.appointmentTime || ''}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {record.status || 'PENDING'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          <p>Reason: {record.reason || 'Consultation'}</p>
                          {record.diagnosis && <p>Diagnosis: {record.diagnosis}</p>}
                          {record.prescription && <p>Prescription: {record.prescription}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Patient Vitals Modal */}
      {showVitalsModal && selectedAppointmentForVitals && (
        <PatientVitalsModal
          isOpen={showVitalsModal}
          onClose={() => {
            setShowVitalsModal(false);
            setSelectedAppointmentForVitals(null);
          }}
          appointment={selectedAppointmentForVitals}
          patientId={selectedAppointmentForVitals.patientId}
          onSuccess={handleAppointmentCompleted}
          onSkip={handleCompleteWithoutVitals}
          axiosConfig={axiosConfig}
        />
      )}

      <DoctorChatbot
        doctorName={user?.name?.split(' ')[0] || 'Doctor'}
        onQuickAction={handleDoctorChatQuickAction}
      />
    </div>
  );
};

export default DoctorDashboard;


