// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Stethoscope,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  LogOut,
  Search,
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
  Activity
} from 'lucide-react';
import axios from 'axios';
import authService from '../services/AuthService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0,
    pendingDoctors: 0,
    activeDoctors: 0,
    newUsersToday: 0,
    totalAppointments: 0
  });
  
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE_URL = 'http://localhost:8080/api';
  const token = localStorage.getItem('token');

  const axiosConfig = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [navigate, token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        statsRes,
        doctorsRes,
        patientsRes,
        activitiesRes
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/stats`, axiosConfig).catch(() => ({ data: {} })),
        axios.get(`${API_BASE_URL}/users/doctors/pending/details`, axiosConfig).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/users/role/PATIENT`, axiosConfig).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/admin/activities`, axiosConfig).catch(() => ({ data: [] }))
      ]);

      setStats(prev => ({
        ...prev,
        ...(statsRes.data || {})
      }));
      setDoctors(doctorsRes.data || []);
      setPatients(patientsRes.data || []);
      setRecentActivities(activitiesRes.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setMessage({ 
        type: 'error', 
        text: 'Failed to load dashboard data. Please refresh.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    setActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/users/doctors/${doctorId}/approve`, {}, axiosConfig);
      
      setMessage({ type: 'success', text: 'Doctor approved successfully!' });
      
      // Refresh data
      fetchDashboardData();
      setShowApproveModal(false);
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve doctor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to reject this doctor?')) return;
    
    setActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/users/doctors/${doctorId}/reject`, {}, axiosConfig);
      
      setMessage({ type: 'success', text: 'Doctor rejected.' });
      fetchDashboardData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reject doctor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userRole) => {
    if (!window.confirm(`Are you sure you want to delete this ${userRole}?`)) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, axiosConfig);
      
      setMessage({ type: 'success', text: 'User deleted successfully.' });
      fetchDashboardData();
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user.' });
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'pending') return matchesSearch && doctor.status === 'PENDING_APPROVAL';
    if (filterStatus === 'active') return matchesSearch && doctor.status === 'ACTIVE';
    if (filterStatus === 'rejected') return matchesSearch && doctor.status === 'REJECTED';
    
    return matchesSearch;
  });

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              {trend} from yesterday
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const DoctorCard = ({ doctor }) => (
    <div className="bg-white rounded-xl p-4 shadow border border-slate-100 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
          {doctor.name?.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
              <p className="text-sm text-gray-500">{doctor.specialization || 'General'}</p>
              <p className="text-xs text-gray-400 mt-1">{doctor.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {doctor.status === 'PENDING_APPROVAL' && (
                <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <Clock size={12} />
                  Pending
                </span>
              )}
              {doctor.status === 'ACTIVE' && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle size={12} />
                  Active
                </span>
              )}
              {doctor.status === 'REJECTED' && (
                <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <XCircle size={12} />
                  Rejected
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span>📞 {doctor.phone}</span>
            <span>🎓 {doctor.experience || 0} years exp.</span>
          </div>
          
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => setSelectedDoctor(doctor)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye size={18} className="text-gray-600" />
            </button>
            {doctor.status === 'PENDING_APPROVAL' && (
              <>
                <button
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setShowApproveModal(true);
                  }}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Check size={18} className="text-green-600" />
                </button>
                <button
                  onClick={() => handleRejectDoctor(doctor.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <XCircle size={18} className="text-red-600" />
                </button>
              </>
            )}
            <button
              onClick={() => handleDeleteUser(doctor.id, 'doctor')}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-900">Admin Panel</span>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'overview' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home size={20} />
              Overview
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
              Doctors
              {stats.pendingDoctors > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.pendingDoctors}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'patients' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User size={20} />
              Patients
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'analytics' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} />
              Analytics
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
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'doctors' && 'Manage Doctors'}
              {activeTab === 'patients' && 'Manage Patients'}
              {activeTab === 'analytics' && 'Analytics'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchDashboardData}
              className="p-3 bg-white rounded-xl shadow hover:shadow-md transition-all"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
            <button className="p-3 bg-white rounded-xl shadow hover:shadow-md transition-all">
              <Download size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={Users}
                label="Total Users"
                value={stats.totalUsers}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
                trend="+12"
              />
              <StatCard 
                icon={User}
                label="Total Patients"
                value={stats.totalPatients}
                color="bg-gradient-to-br from-green-500 to-green-600"
                trend="+8"
              />
              <StatCard 
                icon={Stethoscope}
                label="Total Doctors"
                value={stats.totalDoctors}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
                trend="+3"
              />
              <StatCard 
                icon={Clock}
                label="Pending Approvals"
                value={stats.pendingDoctors}
                color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              />
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Distribution */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold mb-4">User Distribution</h2>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                  {/* Add Chart Here */}
                  <p className="text-gray-400">Chart component would go here</p>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
                <div className="space-y-4">
                  {recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Activity size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{activity.description}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow flex flex-wrap gap-4">
              <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                <Search size={20} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors by name, email, specialization..."
                  className="bg-transparent border-none focus:ring-0 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Doctors</option>
                <option value="pending">Pending Approval</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))
              ) : (
                <div className="bg-white rounded-xl p-12 text-center">
                  <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-500 font-medium">No doctors found</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Patient Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Blood Group</th>
                    <th className="text-left py-3 px-4">City</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(patient => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{patient.name}</td>
                      <td className="py-3 px-4">{patient.email}</td>
                      <td className="py-3 px-4">{patient.phone}</td>
                      <td className="py-3 px-4">{patient.bloodGroup || 'N/A'}</td>
                      <td className="py-3 px-4">{patient.city || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Eye size={18} className="text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded ml-2">
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Approve Doctor Modal */}
      {showApproveModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Approve Doctor</h2>
            <div className="text-gray-700 mb-6 space-y-2 text-sm">
              <p><span className="font-semibold">Doctor:</span> Dr. {selectedDoctor.name}</p>
              <p><span className="font-semibold">Email:</span> {selectedDoctor.email || 'N/A'}</p>
              <p><span className="font-semibold">Phone:</span> {selectedDoctor.phone || 'N/A'}</p>
              <p><span className="font-semibold">Specialization:</span> {selectedDoctor.specialization || 'N/A'}</p>
              <p><span className="font-semibold">Experience:</span> {selectedDoctor.experience ?? 'N/A'} years</p>
              <p><span className="font-semibold">Qualification:</span> {selectedDoctor.qualification || 'N/A'}</p>
              <p><span className="font-semibold">Consultation Fee:</span> {selectedDoctor.consultationFee ?? 'N/A'}</p>
              <p><span className="font-semibold">Clinic Address:</span> {selectedDoctor.clinicAddress || 'N/A'}</p>
              <p><span className="font-semibold">Bio:</span> {selectedDoctor.bio || 'N/A'}</p>
              {selectedDoctor.licenseCertificateUrl && (
                <p>
                  <span className="font-semibold">License:</span>{' '}
                  <a
                    href={selectedDoctor.licenseCertificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Certificate
                  </a>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleApproveDoctor(selectedDoctor.id)}
                disabled={actionLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {actionLoading ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
