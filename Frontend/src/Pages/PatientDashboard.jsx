// PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  Bell,
  CreditCard,
  Settings,
  LogOut,
  Search,
  MapPin,
  Filter,
  Star,
  ChevronRight,
  Plus,
  Video,
  Phone,
  Mail,
  Download,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Home,
  Menu,
  X
} from 'lucide-react';
import axios from 'axios';
import authService from '../services/AuthService';
import appointmentService from '../services/AppointmentService';
import AppointmentList from '../components/AppointmentList';
import BookAppointmentModal from '../components/BookAppointmentModal';
import AppointmentCard from '../components/AppointmentCard';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [appointments, setAppointments] = useState({
    upcoming: [],
    past: []
  });
  const [doctors, setDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE_URL = 'http://localhost:8080/api';
  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: { 'Authorization': `Bearer ${token}` }
  };

  useEffect(() => {
    const userData = authService.getCurrentUser();
    if (!userData || userData.role !== 'PATIENT') {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchDashboardData(userData);
  }, []);

  const normalizeDoctor = (doctor, details, specializationName) => {
    const feeValue = details?.consultation_fee ?? details?.consultationFee ?? null;
    return {
      ...doctor,
      specialization: specializationName || 'General Medicine',
      experience: details?.experience_year ?? details?.experience ?? 0,
      fee: feeValue,
      consultationFee: feeValue,
      rating: doctor?.rating ?? '4.5'
    };
  };

  const fetchDoctors = async () => {
    try {
      const [doctorsRes, specializationsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/role/DOCTOR/active`, axiosConfig),
        axios.get(`${API_BASE_URL}/specializations`, axiosConfig).catch(() => ({ data: [] }))
      ]);

      const specializationMap = new Map(
        (specializationsRes.data || []).map((spec) => [spec.id, spec.name])
      );

      const doctors = doctorsRes.data || [];
      const doctorDetails = await Promise.all(
        doctors.map((doctor) =>
          axios
            .get(`${API_BASE_URL}/doctors/details/${doctor.id}`, axiosConfig)
            .then((res) => ({ doctorId: doctor.id, details: res.data }))
            .catch(() => ({ doctorId: doctor.id, details: null }))
        )
      );

      const detailsMap = new Map(
        doctorDetails.map((entry) => [entry.doctorId, entry.details])
      );

      return doctors
        .map((doctor) => {
          const details = detailsMap.get(doctor.id);
          const specializationId = details?.specialization_id ?? details?.specializationId;
          const specializationName = specializationMap.get(specializationId);
          return normalizeDoctor(doctor, details, specializationName);
        })
        .filter((doctor) => doctor.status === 'ACTIVE');
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  };

  const fetchPatientDetails = async (currentUser) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/patient-details/user/${currentUser.id}`,
        axiosConfig
      );
      return response.data;
    } catch (error) {
      return null;
    }
  };

  const fetchAppointments = async () => {
    try {
      const [upcoming, past] = await Promise.all([
        appointmentService.getUpcomingAppointments().catch(() => []),
        appointmentService.getPastAppointments().catch(() => [])
      ]);
      const grouped = { upcoming, past };
      setAppointments(grouped);
      return grouped;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const fallback = { upcoming: [], past: [] };
      setAppointments(fallback);
      return fallback;
    }
  };

  const fetchDashboardData = async (currentUser) => {
    setLoading(true);
    try {
      const [
        patientData,
        appointmentData,
        doctorData
      ] = await Promise.all([
        fetchPatientDetails(currentUser),
        fetchAppointments(),
        fetchDoctors()
      ]);

      setPatientDetails(patientData);
      setAppointments(appointmentData);
      setDoctors(doctorData);
      setNotifications([]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedSpecialization === 'all') return matchesSearch;
    return matchesSearch && doctor.specialization === selectedSpecialization;
  });

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );

  const DoctorCard = ({ doctor }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
         onClick={() => {
           setSelectedDoctor(doctor);
           setShowBookModal(true);
         }}>
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
          {doctor.name?.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">Dr. {doctor.name}</h3>
          <p className="text-sm text-blue-600">{doctor.specialization}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{doctor.rating || '4.5'}</span>
            </div>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{doctor.experience} years exp.</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-green-600">₹{doctor.fee}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDoctor(doctor);
                setShowBookModal(true);
              }}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl transition-transform duration-300 z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-900">MediCarePlus</span>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600">Welcome back,</p>
            <p className="font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-1">Patient ID: {user?.id}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home size={20} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'appointments' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar size={20} />
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'doctors' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Stethoscope size={20} />
              Find Doctors
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'records' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText size={20} />
              Medical Records
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'payments' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CreditCard size={20} />
              Payments
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'profile' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User size={20} />
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'settings' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
              Settings
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 p-4 lg:p-8">
        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p>{message.text}</p>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Calendar} label="Upcoming Appointments" value={appointments.upcoming.length} color="bg-blue-600" />
              <StatCard icon={Clock} label="Past Appointments" value={appointments.past.length} color="bg-green-600" />
              <StatCard icon={FileText} label="Prescriptions" value="12" color="bg-purple-600" />
              <StatCard icon={Bell} label="Notifications" value={notifications.length} color="bg-yellow-600" />
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
                <button 
                  onClick={() => setActiveTab('appointments')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </button>
              </div>
              {appointments.upcoming.length > 0 ? (
                <div className="space-y-3">
                  {appointments.upcoming.slice(0, 3).map(app => (
                    <AppointmentCard 
                      key={app.id} 
                      appointment={app} 
                      type="upcoming"
                      onUpdate={fetchAppointments}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <button 
                    onClick={() => setActiveTab('doctors')}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Book Now
                  </button>
                </div>
              )}
            </div>

            {/* Recommended Doctors */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Recommended Doctors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.slice(0, 4).map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Recent Notifications</h2>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notif, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Bell className="w-4 h-4 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-800">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No notifications</p>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
            
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
              <AppointmentList 
                appointments={appointments.upcoming}
                type="upcoming"
                onUpdate={fetchAppointments}
              />
            </div>

            {/* Past Appointments */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Past Appointments</h2>
              <AppointmentList 
                appointments={appointments.past}
                type="past"
                onUpdate={fetchAppointments}
              />
            </div>
          </div>
        )}

        {/* Find Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Find Doctors</h1>
            
            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by doctor name or specialization"
                    className="bg-transparent border-none focus:ring-0 w-full outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map(doctor => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">Personal Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Blood Group</span>
                    <span className="font-medium">{patientDetails?.bloodGroup || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age</span>
                    <span className="font-medium">{patientDetails?.age || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-medium">{patientDetails?.gender || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Allergies</span>
                    <span className="font-medium">{patientDetails?.allergies || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-4">Medical History</h2>
                <p className="text-gray-600">{patientDetails?.medicalHistory || 'No medical history recorded'}</p>
              </div>

              {/* Prescriptions */}
              <div className="bg-white rounded-xl p-6 shadow-sm md:col-span-2">
                <h2 className="font-semibold text-gray-800 mb-4">Recent Prescriptions</h2>
                <div className="space-y-3">
                  {appointments.past
                    .filter(app => app.prescription)
                    .slice(0, 3)
                    .map(app => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Prescription from Dr. {app.doctor?.name}</p>
                          <p className="text-xs text-gray-500">{app.appointmentDate}</p>
                        </div>
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Summary */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {user?.name?.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">Patient</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Member since</p>
                    <p className="text-sm font-medium">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-800 mb-4">Personal Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Full Name</label>
                        <p className="font-medium">{user?.name}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Email</label>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Phone</label>
                        <p className="font-medium">{user?.phone}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Blood Group</label>
                        <p className="font-medium">{patientDetails?.bloodGroup || 'Not specified'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Address</label>
                      <p className="font-medium">{patientDetails?.address || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Emergency Contact</label>
                      <p className="font-medium">{patientDetails?.emergencyContactName || 'Not specified'} - {patientDetails?.emergencyContactPhone || ''}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => navigate('/patient/details')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab (Placeholder) */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Payments</h1>
            <p className="text-gray-500 text-center py-12">Payment history will appear here</p>
          </div>
        )}

        {/* Settings Tab (Placeholder) */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
            <p className="text-gray-500 text-center py-12">Settings options will appear here</p>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && selectedDoctor && (
        <BookAppointmentModal
          isOpen={showBookModal}
          onClose={() => {
            setShowBookModal(false);
            setSelectedDoctor(null);
          }}
          doctor={selectedDoctor}
          onSuccess={() => {
            fetchAppointments();
            setMessage({ type: 'success', text: 'Appointment booked successfully!' });
            setActiveTab('appointments');
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
          }}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
