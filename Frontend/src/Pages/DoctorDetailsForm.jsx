// DoctorDetailsForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  MapPin, 
  Stethoscope, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Briefcase,
  Save,
  Loader,
  XCircle,
  Building2,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Shield,
  ChevronRight,
  ArrowLeft,
  HeartPulse,
  Users,
  Star,
  Info
} from 'lucide-react';
import axios from 'axios';
import apiClient from '../services/axiosConfig';

const DEFAULT_SPECIALIZATIONS = [
  { id: 1, name: 'Cardiology' },
  { id: 2, name: 'Dermatology' },
  { id: 3, name: 'Pediatrics' },
  { id: 4, name: 'Neurology' },
  { id: 5, name: 'General Medicine' },
  { id: 6, name: 'Orthopedics' },
  { id: 7, name: 'Ophthalmology' },
  { id: 8, name: 'Psychiatry' }
];

const DoctorDetailsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    specialization_id: '',
    experience_year: '',
    clinic_address: '',
    qualification: '',
    bio: '',
    consultation_fee: '',
    // availability_start_time: '',
    // availability_end_time: '',
    licenseCertificateUrl: '',
    city: '',          
    state: '' 
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [specializations, setSpecializations] = useState([]);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('credentials');

  const API_BASE_URL = 'http://localhost:8080/api';

  const getAxiosConfig = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return { headers };
  };

  // Fetch specializations on component mount
  useEffect(() => {
    fetchSpecializations();
    getUserInfo();
    checkExistingDoctorDetails();
  }, []);

  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setUserInfo(parsed);
        if (parsed?.id != null) {
          setUserId(Number(parsed.id));
        }
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/specializations`);
      const apiSpecializations = Array.isArray(response.data) ? response.data : [];

      if (apiSpecializations.length > 0) {
        setSpecializations(apiSpecializations);
      } else {
        setSpecializations(DEFAULT_SPECIALIZATIONS);
      }
    } catch (error) {
      console.error('Error fetching specializations:', error);
      setSpecializations(DEFAULT_SPECIALIZATIONS);
    }
  };

  const checkExistingDoctorDetails = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus({ type: 'error', message: 'Session expired. Please login again.' });
        navigate('/login');
        return;
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setFetchLoading(false);
        return;
      }
      const parsed = JSON.parse(userStr);
      const currentUserId = Number(parsed?.id);
      if (!currentUserId) {
        setFetchLoading(false);
        return;
      }
      setUserId(currentUserId);

      const response = await apiClient.get(`${API_BASE_URL}/doctors/details/${currentUserId}`);
      if (response.data && typeof response.data === 'object' && response.data.id) {
        setFormData({
          specialization_id: response.data.specializationId?.toString() || '',
          experience_year: response.data.experienceYear?.toString() || '',
          clinic_address: response.data.clinicAddress || '',
          qualification: response.data.qualification || '',
          bio: response.data.bio || '',
          city: response.data.city || '',
          state: response.data.state || '',
          consultation_fee: response.data.consultationFee?.toString() || '',
          // availability_start_time: response.data.availabilityStartTime || response.data.availability_start_time || '',
          // availability_end_time: response.data.availabilityEndTime || response.data.availability_end_time || '',
          licenseCertificateUrl: response.data.licenseCertificateUrl || ''
        });
        setHasExistingData(true);
        setStatus({ 
          type: 'info', 
          message: 'Loaded your existing professional profile. You can update it below.' 
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setStatus({ type: 'error', message: 'Session expired. Please login again.' });
      } else if (error.response?.status !== 404) {
        console.error('Error checking doctor details:', error);
      }
      setHasExistingData(false);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (status.message) {
      setStatus({ type: '', message: '' });
    }
  };

  const validateForm = () => {
    const experienceYears = Number(formData.experience_year);
    const consultationFee = Number(formData.consultation_fee);

    if (!formData.specialization_id) return 'Please select your specialization';
    if (!formData.experience_year) return 'Years of experience is required';
    if (Number.isNaN(experienceYears)) return 'Years of experience must be a valid number';
    if (experienceYears < 0) return 'Experience years cannot be negative';
    if (!formData.clinic_address?.trim()) return 'Clinic address is required';
    if (!formData.qualification?.trim()) return 'Qualification is required';
    if (!formData.consultation_fee) return 'Consultation fee is required';
    if (Number.isNaN(consultationFee)) return 'Consultation fee must be a valid number';
    if (consultationFee <= 0) return 'Consultation fee must be greater than 0';
    // if (!formData.availability_start_time) return 'Availability start time is required';
    // if (!formData.availability_end_time) return 'Availability end time is required';
    // if (formData.availability_start_time >= formData.availability_end_time) {
    //   return 'Availability start time must be before end time';
    // }
    if (!formData.city?.trim()) return 'City is required';
    if (!formData.state?.trim()) return 'State is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus({ type: 'error', message: 'Session expired. Please login again.' });
        navigate('/login');
        return;
      }

      if (!userId) {
        throw new Error('User not found. Please register/login again.');
      }

      const requestData = {
        specialization_id: parseInt(formData.specialization_id),
        experience_year: parseInt(formData.experience_year),
        clinic_address: formData.clinic_address.trim(),
        qualification: formData.qualification.trim(),
        bio: formData.bio?.trim() || '',
        city: formData.city.trim(),        // ADD THIS
        state: formData.state.trim(),
        consultation_fee: parseFloat(formData.consultation_fee),
        // availability_start_time: formData.availability_start_time,
        // availability_end_time: formData.availability_end_time,
        licenseCertificateUrl: formData.licenseCertificateUrl?.trim() || ''
      };

      const response = hasExistingData
        ? await apiClient.put(`${API_BASE_URL}/doctors/details/${userId}`, requestData)
        : await apiClient.post(`${API_BASE_URL}/doctors/details/${userId}`, requestData);

      setStatus({
        type: 'success',
        message: hasExistingData
          ? 'Professional profile updated successfully! It will be reviewed by admin.'
          : 'Professional profile submitted successfully! It is pending admin approval.'
      });
      setHasExistingData(true);

      console.log('Doctor details saved:', response.data);

      setTimeout(() => {
        navigate('/doctor/pending');
      }, 2000);

    } catch (error) {
      console.error('Error saving doctor details:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setStatus({ type: 'error', message: 'Session expired. Please login again.' });
          return;
        }

        const responseData = error.response.data;
        const validationErrors = Array.isArray(responseData?.errors)
          ? responseData.errors.join(', ')
          : null;

        const errorMsg = typeof responseData === 'string'
          ? responseData
          : validationErrors ||
            responseData?.detail ||
            responseData?.error ||
            responseData?.message ||
            `Failed to save profile: ${error.response.status}`;
        setStatus({ type: 'error', message: errorMsg });
      } else if (error.request) {
        setStatus({ 
          type: 'error', 
          message: 'Cannot connect to server. Please check if backend is running.' 
        });
      } else {
        setStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'credentials', label: 'Credentials', icon: <Award className="w-4 h-4" /> },
    { id: 'practice', label: 'Practice', icon: <Building2 className="w-4 h-4" /> },
    { id: 'bio', label: 'Bio', icon: <Briefcase className="w-4 h-4" /> }
  ];

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative text-center bg-white/80 backdrop-blur-xl p-12 rounded-[48px] shadow-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <Loader className="relative w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          </div>
          <p className="text-gray-600 font-medium">Loading your professional profile...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we fetch your details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-all bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ArrowLeft className="relative w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-[48px] shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 p-8 lg:p-12 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid-white/10 bg-grid-16"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-transparent"></div>
            
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">Doctor Profile</h1>
                    <p className="text-blue-100 text-lg">
                      {hasExistingData ? 'Update your professional information' : 'Complete your professional credentials'}
                    </p>
                  </div>
                </div>
                
                {/* Progress Steps */}
                <div className="flex gap-2 mt-4">
                  {tabs.map((tab, index) => (
                    <div key={tab.id} className="flex items-center">
                      {index > 0 && <ChevronRight className="w-4 h-4 text-blue-300 mx-1" />}
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? 'bg-white text-blue-600'
                            : 'text-white hover:bg-white/20'
                        }`}
                      >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {userInfo && (
                <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/30">
                  <p className="text-sm text-blue-100">Dr.</p>
                  <p className="text-xl font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {userInfo.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
            {/* Status Message */}
            {status.message && (
              <div className={`relative overflow-hidden rounded-2xl ${
                status.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500' : 
                status.type === 'error' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500' :
                'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500'
              }`}>
                <div className="p-4 flex items-center gap-3">
                  {status.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {status.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                  {status.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                  <p className="font-medium text-slate-700">{status.message}</p>
                </div>
                <div className={`absolute bottom-0 left-0 h-1 w-full ${
                  status.type === 'success' ? 'bg-green-500' : 
                  status.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                } animate-shrink`}></div>
              </div>
            )}

            {/* Credentials Tab */}
            {activeTab === 'credentials' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-2xl">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Professional Credentials</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-blue-500" />
                      Specialization *
                    </label>
                    <select 
                      name="specialization_id" 
                      required
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none appearance-none"
                      value={formData.specialization_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(spec => (
                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Years of Experience *</label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                      <input 
                        type="number" 
                        name="experience_year" 
                        required
                        min="0"
                        max="70"
                        placeholder="e.g. 10"
                        className="relative w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                        value={formData.experience_year}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      Educational Qualification *
                    </label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        name="qualification" 
                        required
                        placeholder="MBBS, MD, MS, DM, FRCP..."
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                        value={formData.qualification}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Practice Tab */}
            {activeTab === 'practice' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-2xl">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Practice Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Clinic/Hospital Address *
                    </label>
                    <textarea 
                      name="clinic_address" 
                      rows="3"
                      required
                      placeholder="Full address of your primary consultation clinic"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      value={formData.clinic_address}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    City *
  </label>
  <input
    type="text"
    name="city"
    required
    placeholder="Enter city"
    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
    value={formData.city}
    onChange={handleChange}
  />
</div>

<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    State *
  </label>
  <input
    type="text"
    name="state"
    required
    placeholder="Enter state"
    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
    value={formData.state}
    onChange={handleChange}
  />
</div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      Consultation Fee *
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01"
                        min="0.01"
                        name="consultation_fee" 
                        required
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                        value={formData.consultation_fee}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Availability Start Time *
                    </label>
                    <input
                      type="time"
                      name="availability_start_time"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      value={formData.availability_start_time}
                      onChange={handleChange}
                    />
                  </div> */}

                  {/* <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Availability End Time *
                    </label>
                    <input
                      type="time"
                      name="availability_end_time"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      value={formData.availability_end_time}
                      onChange={handleChange}
                    />
                  </div> */}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      License Certificate URL (Optional)
                    </label>
                    <input 
                      type="url" 
                      name="licenseCertificateUrl" 
                      placeholder="https://drive.google.com/your-license-file"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      value={formData.licenseCertificateUrl}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bio Tab */}
            {activeTab === 'bio' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-2xl">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Professional Bio</h2>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">About You</label>
                  <textarea 
                    name="bio" 
                    rows="6"
                    placeholder="Tell patients about your expertise, approach, achievements, and years of experience..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                  <p className="mt-2 text-sm text-slate-500 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    This bio will be visible to patients when they browse for doctors.
                  </p>
                </div>

                {/* Preview Card */}
                {formData.bio && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
                      <h3 className="font-semibold text-blue-800">Profile Preview</h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{formData.bio}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
              <div className="flex gap-3">
                {activeTab !== 'credentials' && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(t => t.id === activeTab);
                      setActiveTab(tabs[currentIndex - 1].id);
                    }}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Previous
                  </button>
                )}
                {activeTab !== 'bio' && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(t => t.id === activeTab);
                      setActiveTab(tabs[currentIndex + 1].id);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Verification Notice */}
            <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-30"></div>
              <div className="relative flex items-start gap-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 mb-1">Verification Pending</h3>
                  <p className="text-amber-700 text-sm">
                    Your profile will be marked as "Pending Approval" until our administration team verifies your medical license and credentials. You'll receive an email once approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[250px] justify-center">
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {hasExistingData ? 'Update Professional Profile' : 'Submit Professional Profile'}
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Verified & Secure</span> • Your credentials are encrypted
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-shrink {
          animation: shrink 3s linear forwards;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .bg-grid-white {
          background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
        }
        
        .bg-grid-16 {
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
};

export default DoctorDetailsForm;
