import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Science,
  CalendarMonth,
  Schedule,
  CheckCircle,
  Warning,
  Search,
  Tune,
  MoreVert,
  Close,
  ChevronRight,
  Person,
  TrendingUp,
  OpenInNew,
  Description,
  Biotech,
  LocalHospital,
  Timeline,
  Percent,
  Speed,
  Refresh,
  Download,
  Print,
  Share,
  Settings,
  Logout,
  Dashboard,
  Assignment,
  Assessment,
  Build,
  CreditCard
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const Lab = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [activeAnalyses, setActiveAnalyses] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [labInfo, setLabInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareAppointment, setShareAppointment] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [shareError, setShareError] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  // Get token and user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      window.location.href = '/login';
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      fetchLabData(token, userData.id);
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
    }
  }, []);

  const fetchLabData = async (token, userId) => {
    setLoading(true);
    try {
      // Fetch lab enrollment details
      const labResponse = await axios.get(`${API_BASE_URL}/lab-enrollments/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabInfo(labResponse.data);

      // Fetch today's appointments
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/lab/appointments/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(appointmentsResponse.data);

      // Fetch active analyses
      const analysesResponse = await axios.get(`${API_BASE_URL}/lab/analyses/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveAnalyses(analysesResponse.data);

      // Fetch quality metrics
      const metricsResponse = await axios.get(`${API_BASE_URL}/lab/metrics/quality`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQualityMetrics(metricsResponse.data);

      // Fetch instrument status
      const instrumentsResponse = await axios.get(`${API_BASE_URL}/lab/instruments/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstruments(instrumentsResponse.data);

      const paymentsResponse = await axios.get(`${API_BASE_URL}/lab/appointments/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaymentHistory(paymentsResponse.data);

    } catch (error) {
      console.error('Error fetching lab data:', error);
      setError(error.response?.data?.message || 'Failed to load lab data');
      
      // If token expired, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/lab/search`, {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle search results
      console.log('Search results:', response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/lab/appointments/${appointmentId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh appointments
      fetchLabData(token, user.id);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const openShareModal = (appointment) => {
    setShareAppointment(appointment);
    setShareFile(null);
    setShareError('');
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setShareAppointment(null);
    setShareFile(null);
    setShareError('');
    setShareLoading(false);
  };

  const handleSharePdf = async () => {
    if (!shareFile) {
      setShareError('Please select a PDF report to share.');
      return;
    }
    setShareLoading(true);
    try {
      const fileDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(shareFile);
      });

      const stored = JSON.parse(localStorage.getItem('sharedLabReports') || '[]');
      const reportEntry = {
        id: `LABREP-${Date.now()}`,
        appointmentId: shareAppointment?.id,
        patientId: shareAppointment?.patientId || null,
        patientEmail: shareAppointment?.patientEmail || '',
        patientName: shareAppointment?.patientName || '',
        mrn: shareAppointment?.mrn || '',
        testName: shareAppointment?.testName || 'Lab Test',
        labName: labInfo?.labName || 'Lab',
        createdAt: new Date().toISOString(),
        fileName: shareFile.name,
        fileDataUrl
      };
      stored.unshift(reportEntry);
      localStorage.setItem('sharedLabReports', JSON.stringify(stored));

      window.alert('PDF report shared successfully.');
      closeShareModal();
    } catch (err) {
      setShareError('Failed to share report. Please try again.');
      setShareLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-[#1A73E8]',
      checked_in: 'bg-[#34A853]',
      pending: 'bg-[#F9AB00]',
      completed: 'bg-[#5F6368]',
      cancelled: 'bg-[#C5221F]'
    };
    return colors[status] || 'bg-[#5F6368]';
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      urgent: 'bg-[#FCE8E8] text-[#C5221F] border border-[#FAD2D2]',
      high: 'bg-[#FEF7E0] text-[#B06000] border border-[#FEEDB0]',
      routine: 'bg-[#F1F3F4] text-[#5F6368] border border-[#DADCE0]'
    };
    return styles[priority] || styles.routine;
  };

  const labPaymentAnalytics = useMemo(() => {
    const allAppointments = Array.isArray(paymentHistory) ? paymentHistory : [];
    const completed = allAppointments.filter(
      (app) => String(app.status || '').toUpperCase() === 'COMPLETED'
    );
    const pending = allAppointments.filter((app) => {
      const status = String(app.status || '').toUpperCase();
      return status === 'PENDING' || status === 'CONFIRMED' || status === 'CHECKED_IN' || status === 'IN_PROGRESS';
    });

    const totalCollected = completed.reduce((sum, app) => sum + Number(app.testPrice || 0), 0);
    const pendingAmount = pending.reduce((sum, app) => sum + Number(app.testPrice || 0), 0);
    const totalTransactions = completed.length;
    const avgTransaction = totalTransactions > 0 ? totalCollected / totalTransactions : 0;
    const highestTransaction = completed.reduce(
      (max, app) => Math.max(max, Number(app.testPrice || 0)),
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
        monthMap.set(monthKey, monthMap.get(monthKey) + Number(app.testPrice || 0));
      }
    });
    const monthlyRevenue = monthBuckets.map((bucket) => ({
      ...bucket,
      amount: monthMap.get(bucket.key) || 0
    }));

    const paymentHistoryItems = [...completed]
      .sort((a, b) => {
        const da = new Date(`${a.appointmentDate || '1970-01-01'}T${a.appointmentTime || '00:00:00'}`);
        const db = new Date(`${b.appointmentDate || '1970-01-01'}T${b.appointmentTime || '00:00:00'}`);
        return db - da;
      })
      .map((app) => ({
        id: app.id,
        date: app.appointmentDate || '-',
        time: app.appointmentTime ? String(app.appointmentTime).slice(0, 5) : '-',
        patientName: app.patientName || 'Patient',
        testName: app.testName || 'Lab Test',
        amount: Number(app.testPrice || 0),
        method: app.bookingSource ? String(app.bookingSource).toUpperCase() : 'CASH',
        status: 'PAID'
      }));

    return {
      totalCollected,
      pendingAmount,
      totalTransactions,
      avgTransaction,
      highestTransaction,
      monthlyRevenue,
      paymentHistory: paymentHistoryItems
    };
  }, [paymentHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F3F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1A73E8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5F6368]">Loading lab dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F1F3F4] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <Warning className="text-[#C5221F] text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#202124] mb-2">Error Loading Dashboard</h2>
          <p className="text-[#5F6368] mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#1A73E8] text-white px-6 py-2 rounded-lg hover:bg-[#1557B0] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F4] font-['Google Sans',sans-serif]">
      {/* Top Navigation - Google Style */}
      <header className="bg-white border-b border-[#DADCE0] sticky top-0 z-50">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Biotech className="text-[#1A73E8] text-3xl" />
              <span className="text-xl font-medium text-[#202124]">
                Lab<span className="text-[#1A73E8]">Core</span>
              </span>
              {labInfo && (
                <span className="ml-2 text-xs bg-[#E8F0FE] text-[#1A73E8] px-2 py-1 rounded-full">
                  {labInfo.labName}
                </span>
              )}
            </div>
            
            {/* Google-style search */}
            <div className="hidden md:flex items-center bg-[#F1F3F4] rounded-full h-12 w-[480px] px-4 hover:shadow-sm transition-shadow">
              <Search className="text-[#5F6368] text-xl" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search patients, tests, or MRN..."
                className="bg-transparent border-none px-4 flex-1 text-[#202124] placeholder-[#5F6368] focus:outline-none text-sm"
              />
              {searchQuery && (
                <button 
                  onClick={handleSearch}
                  className="text-[#1A73E8] text-sm font-medium hover:bg-[#E8F0FE] px-3 py-1 rounded-full transition-colors"
                >
                  Search
                </button>
              )}
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fetchLabData(localStorage.getItem('token'), user.id)}
              className="w-10 h-10 rounded-full hover:bg-[#F1F3F4] flex items-center justify-center text-[#5F6368] transition-colors"
              title="Refresh"
            >
              <Refresh />
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-[#F1F3F4] flex items-center justify-center text-[#5F6368] transition-colors">
              <Download />
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-[#F1F3F4] flex items-center justify-center text-[#5F6368] transition-colors">
              <Print />
            </button>
            <div className="w-[1px] h-8 bg-[#DADCE0] mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[#202124]">{user?.name || 'Lab Director'}</p>
                <p className="text-xs text-[#5F6368]">{labInfo?.labType || 'Diagnostic Lab'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#1A73E8] flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || 'L'}
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 hover:bg-[#F1F3F4] rounded-full transition-colors"
                title="Sign out"
              >
                <Logout className="text-[#5F6368]" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary navigation */}
        <div className="px-6 flex items-center gap-6 h-12 text-sm overflow-x-auto">
          <button 
            className={`h-full px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'overview' 
                ? 'border-[#1A73E8] text-[#1A73E8]' 
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`} 
            onClick={() => setActiveTab('overview')}
          >
            <Dashboard className="inline mr-1 text-lg" />
            Overview
          </button>
          <button 
            className={`h-full px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'schedule' 
                ? 'border-[#1A73E8] text-[#1A73E8]' 
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`} 
            onClick={() => setActiveTab('schedule')}
          >
            <CalendarMonth className="inline mr-1 text-lg" />
            Schedule
          </button>
          <button 
            className={`h-full px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'analyses' 
                ? 'border-[#1A73E8] text-[#1A73E8]' 
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`} 
            onClick={() => setActiveTab('analyses')}
          >
            <Timeline className="inline mr-1 text-lg" />
            Active Analyses
          </button>
          <button 
            className={`h-full px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'reports' 
                ? 'border-[#1A73E8] text-[#1A73E8]' 
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`} 
            onClick={() => setActiveTab('reports')}
          >
            <Assessment className="inline mr-1 text-lg" />
            Reports
          </button>
          <button 
            className={`h-full px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'quality' 
                ? 'border-[#1A73E8] text-[#1A73E8]' 
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`} 
            onClick={() => setActiveTab('quality')}
          >
            <Build className="inline mr-1 text-lg" />
            Quality Control
          </button>
          <button 
            className={`h-full px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'payments' 
                ? 'border-[#1A73E8] text-[#1A73E8]' 
                : 'border-transparent text-[#5F6368] hover:text-[#202124]'
            }`} 
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard className="inline mr-1 text-lg" />
            Payments
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {activeTab !== 'payments' && (
          <>
        {/* Quick actions bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-normal text-[#202124]">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0] || 'Director'}
          </h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[#1A73E8] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1557B0] transition-colors shadow-sm">
              <Science className="text-xl" />
              New Order
            </button>
            <button className="flex items-center gap-2 bg-white text-[#1A73E8] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#F1F3F4] transition-colors border border-[#DADCE0]">
              <Tune />
              Filter
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {qualityMetrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl border border-[#DADCE0] p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-[#5F6368] text-sm">{metric.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  metric.status === 'optimal' ? 'bg-[#E6F4EA] text-[#137333]' :
                  metric.status === 'good' ? 'bg-[#FEF7E0] text-[#B06000]' :
                  'bg-[#FCE8E8] text-[#C5221F]'
                }`}>
                  {metric.trend}
                </span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-light text-[#202124]">{metric.value}</span>
                <span className="text-[#5F6368] text-sm mb-1">{metric.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments Section */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#DADCE0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DADCE0] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <CalendarMonth className="text-[#1A73E8]" />
                <h2 className="text-[#202124] font-medium">Today's Schedule</h2>
                <span className="bg-[#E8F0FE] text-[#1A73E8] text-xs px-2 py-1 rounded-full font-medium">
                  {appointments.length} appointments
                </span>
              </div>
              <button className="text-[#1A73E8] text-sm font-medium hover:bg-[#E8F0FE] px-3 py-1.5 rounded-full transition-colors">
                View all
              </button>
            </div>
            
            <div className="divide-y divide-[#F1F3F4] max-h-[500px] overflow-y-auto">
              {appointments.length > 0 ? (
                appointments.map((apt, idx) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-6 py-4 hover:bg-[#F8F9FA] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(apt.status)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="font-medium text-[#202124]">{apt.patientName}</p>
                            <span className="text-xs text-[#5F6368] font-mono">{apt.mrn}</span>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getPriorityStyle(apt.priority)}`}>
                              {apt.priority?.charAt(0).toUpperCase() + apt.priority?.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-sm flex-wrap">
                            <span className="text-[#1A73E8] bg-[#E8F0FE] px-2 py-0.5 rounded text-xs">
                              {apt.testName}
                            </span>
                            <span className="flex items-center gap-1 text-[#5F6368] text-xs">
                              <Schedule className="text-sm" />
                              {apt.scheduledTime}
                            </span>
                            <span className="text-[#5F6368] text-xs">•</span>
                            <span className="text-[#5F6368] text-xs">{apt.doctorName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.status === 'completed' && (
                          <button
                            onClick={() => openShareModal(apt)}
                            className="flex items-center gap-1 text-xs text-[#1A73E8] border border-[#DADCE0] rounded-lg px-2 py-1 hover:bg-[#E8F0FE] transition-colors"
                            title="Share result by PDF"
                          >
                            <Share className="text-sm" />
                            Share PDF
                          </button>
                        )}
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusUpdate(apt.id, e.target.value)}
                          className="text-xs border border-[#DADCE0] rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-[#1A73E8]"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="checked_in">Checked In</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="text-[#5F6368] hover:text-[#1A73E8] p-2 hover:bg-[#F1F3F4] rounded-full transition-colors">
                          <ChevronRight />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-[#5F6368]">
                  No appointments scheduled for today
                </div>
              )}
            </div>
          </div>

          {/* Active Analyses Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#DADCE0] p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Timeline className="text-[#1A73E8]" />
                  <h3 className="font-medium text-[#202124]">Live Analyses</h3>
                </div>
                <span className="text-xs bg-[#E6F4EA] text-[#137333] px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#34A853] rounded-full animate-pulse" />
                  {activeAnalyses.length} Active
                </span>
              </div>

              <div className="space-y-5 max-h-[400px] overflow-y-auto">
                {activeAnalyses.length > 0 ? (
                  activeAnalyses.map((analysis) => (
                    <div key={analysis.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-[#202124]">{analysis.patientName}</p>
                          <p className="text-xs text-[#5F6368]">{analysis.testName}</p>
                        </div>
                        <span className="text-xs font-mono text-[#5F6368]">{analysis.id}</span>
                      </div>
                      
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#5F6368]">Progress</span>
                          <span className="font-medium text-[#1A73E8]">{analysis.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-[#E8F0FE] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${analysis.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#1A73E8] rounded-full"
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-[#5F6368]">
                          <span>Started: {analysis.startedTime}</span>
                          <span>Instrument: {analysis.instrument}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[#5F6368] py-4">
                    No active analyses
                  </div>
                )}
              </div>

              <button className="w-full mt-5 py-3 border border-[#DADCE0] rounded-lg text-[#1A73E8] font-medium text-sm hover:bg-[#F8F9FA] transition-colors flex items-center justify-center gap-2">
                Open Lab Monitor
                <OpenInNew className="text-lg" />
              </button>
            </div>

            {/* Instrument Status Card */}
            <div className="bg-white rounded-xl border border-[#DADCE0] p-5">
              <h4 className="text-sm font-medium text-[#202124] mb-3">Instrument Status</h4>
              <div className="space-y-3">
                {instruments.map((instrument, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        instrument.status === 'online' ? 'bg-[#34A853]' :
                        instrument.status === 'maintenance' ? 'bg-[#F9AB00]' :
                        'bg-[#C5221F]'
                      }`} />
                      <span className="text-sm text-[#202124]">{instrument.name}</span>
                    </div>
                    <span className="text-xs text-[#5F6368]">{instrument.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
          </>
        )}
        {activeTab === 'payments' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-[#DADCE0] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5F6368]">Total Collected</p>
                    <p className="text-2xl font-bold text-[#202124] mt-1">₹ {labPaymentAnalytics.totalCollected.toFixed(2)}</p>
                    <p className="text-xs text-[#5F6368] mt-2">Lifetime</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#E8F0FE] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1A73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#DADCE0] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5F6368]">Pending Amount</p>
                    <p className="text-2xl font-bold text-[#202124] mt-1">₹ {labPaymentAnalytics.pendingAmount.toFixed(2)}</p>
                    <p className="text-xs text-[#5F6368] mt-2">Upcoming tests</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#FEF7E0] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#B06000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#DADCE0] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5F6368]">Transactions</p>
                    <p className="text-2xl font-bold text-[#202124] mt-1">{labPaymentAnalytics.totalTransactions}</p>
                    <p className="text-xs text-[#5F6368] mt-2">Completed tests</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#E6F4EA] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#137333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#DADCE0] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#5F6368]">Average Test Fee</p>
                    <p className="text-2xl font-bold text-[#202124] mt-1">₹ {labPaymentAnalytics.avgTransaction.toFixed(2)}</p>
                    <p className="text-xs text-[#5F6368] mt-2">Highest: ₹ {labPaymentAnalytics.highestTransaction.toFixed(2)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#F3E8FD] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#7B1FA2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#DADCE0] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#DADCE0]">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium text-[#5F6368]">Monthly Revenue Trend</h2>
                  <span className="text-xs text-[#5F6368] bg-[#F1F3F4] px-2 py-1 rounded-full">Last 6 months</span>
                </div>
              </div>
              <div className="p-6">
                <div className="relative h-48">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="border-b border-[#F1F3F4] h-0" />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-end justify-around pb-1">
                    {labPaymentAnalytics.monthlyRevenue.map((item) => {
                      const maxAmount = Math.max(...labPaymentAnalytics.monthlyRevenue.map(d => d.amount));
                      const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                      return (
                        <div key={item.key} className="flex flex-col items-center w-12">
                          <div className="relative w-full flex justify-center mb-2">
                            <span className="text-xs font-medium text-[#5F6368]">₹{item.amount.toFixed(0)}</span>
                          </div>
                          <div className="w-8 bg-[#F1F3F4] rounded-sm h-32 relative">
                            <div
                              className="absolute bottom-0 w-full bg-[#1A73E8] rounded-sm transition-all duration-500"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#5F6368] mt-2">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#DADCE0] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#DADCE0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E8F0FE] flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#1A73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-medium text-[#5F6368]">Payment History</h2>
                      <p className="text-xs text-[#5F6368]">
                        {labPaymentAnalytics.paymentHistory.length} total transactions
                      </p>
                    </div>
                  </div>

                  {labPaymentAnalytics.paymentHistory.length > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-[#5F6368]">Total Collected</p>
                        <p className="text-sm font-medium text-[#202124]">
                          ₹{labPaymentAnalytics.paymentHistory.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-[#DADCE0]" />
                      <div className="text-right">
                        <p className="text-xs text-[#5F6368]">Avg. per test</p>
                        <p className="text-sm font-medium text-[#202124]">
                          ₹{(
                            labPaymentAnalytics.paymentHistory.reduce((sum, item) => sum + item.amount, 0) /
                            labPaymentAnalytics.paymentHistory.length
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {labPaymentAnalytics.paymentHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#F1F3F4] rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#5F6368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-[#202124] mb-1">No payment history</h3>
                    <p className="text-xs text-[#5F6368] mb-6">Completed lab tests will appear here</p>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="px-4 py-2 bg-[#1A73E8] text-white text-xs font-medium rounded-md hover:bg-[#1557B0] transition-colors"
                    >
                      View Schedule
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-[#5F6368] border-b border-[#DADCE0]">
                          <th className="pb-3 font-medium">Date & Time</th>
                          <th className="pb-3 font-medium">Patient</th>
                          <th className="pb-3 font-medium">Test</th>
                          <th className="pb-3 font-medium">Source</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F3F4]">
                        {labPaymentAnalytics.paymentHistory.slice(0, 12).map((item) => (
                          <tr key={item.id} className="hover:bg-[#F8F9FA]">
                            <td className="py-3 text-xs">
                              <div>{item.date}</div>
                              <div className="text-[#5F6368]">{item.time}</div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#F1F3F4] flex items-center justify-center text-xs font-medium text-[#5F6368]">
                                  {item.patientName.charAt(0)}
                                </div>
                                <span className="text-xs">{item.patientName}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="text-xs text-[#202124]">{item.testName}</span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-[#5F6368]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <span className="text-xs text-[#5F6368]">{item.method}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333]">
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
      </main>

      {/* Share Result Modal */}
      {shareModalOpen && shareAppointment && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg border border-[#DADCE0] shadow-lg">
            <div className="px-6 py-4 border-b border-[#E0E0E0] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-[#202124]">Share Test Result</h3>
                <p className="text-xs text-[#5F6368] mt-1">
                  {shareAppointment.patientName} • {shareAppointment.testName}
                </p>
              </div>
              <button
                onClick={closeShareModal}
                className="text-[#5F6368] hover:text-[#202124] p-2 rounded-full hover:bg-[#F1F3F4]"
                title="Close"
              >
                <Close />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-[#F8F9FA] border border-[#E0E0E0] rounded-lg p-3">
                <div className="text-xs text-[#5F6368]">Patient</div>
                <div className="text-sm font-medium text-[#202124]">{shareAppointment.patientName}</div>
                <div className="text-xs text-[#5F6368] mt-1">MRN: {shareAppointment.mrn || 'N/A'}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#202124]">Upload PDF Report</label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      setShareFile(e.target.files?.[0] || null);
                      setShareError('');
                    }}
                    className="block w-full text-sm text-[#5F6368] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#E8F0FE] file:text-[#1A73E8] hover:file:bg-[#D2E3FC]"
                  />
                </div>
                {shareFile && (
                  <div className="flex items-center gap-2 text-xs text-[#5F6368] mt-2">
                    <Description className="text-sm" />
                    {shareFile.name}
                  </div>
                )}
                {shareError && (
                  <p className="text-xs text-[#C5221F] mt-2">{shareError}</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E0E0E0] flex items-center justify-end gap-2">
              <button
                onClick={closeShareModal}
                className="px-4 py-2 text-sm text-[#5F6368] hover:bg-[#F1F3F4] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSharePdf}
                disabled={shareLoading || !shareFile}
                className="px-5 py-2 text-sm font-medium text-white bg-[#1A73E8] rounded-lg hover:bg-[#1557B0] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {shareLoading ? 'Sharing...' : 'Share PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lab;
