import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Stethoscope, 
  Save, 
  AlertCircle,
  Activity,
  ChevronRight,
  Loader,
  CheckCircle,
  XCircle,
  Heart,
  Droplets,
  Home,
  PhoneCall,
  FileText,
  Pill,
  Shield,
  ArrowLeft,
  Info
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientDetailsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalHistory: '',
    allergies: '',
    currentMedications: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasExistingData, setHasExistingData] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Get token from localStorage
  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:8080/api';

  // Configure axios with auth header
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Fetch existing patient details on component mount
  useEffect(() => {
    fetchPatientDetails();
    getUserInfo();
  }, []);

  // Calculate age automatically when DOB changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({ ...prev, age: age >= 0 ? age : 0 }));
    }
  }, [formData.dateOfBirth]);

  const getUserInfo = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        setUserInfo(parsedUser);
        setUserId(parsedUser.id);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  const fetchPatientDetails = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setIsLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userStr);
      const currentUserId = parsedUser.id;
      setUserId(currentUserId);

      const response = await axios.get(`${API_BASE_URL}/patient-details/user/${currentUserId}`, axiosConfig);
      if (response.data) {
        const formattedData = {
          ...response.data,
          dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : ''
        };
        setFormData(formattedData);
        setHasExistingData(true);
        setMessage({ type: 'info', text: 'Loaded your existing profile data.' });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('No existing patient details found');
      } else {
        console.error('Error fetching patient details:', error);
        setMessage({ 
          type: 'error', 
          text: 'Failed to load your profile. Please refresh the page.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    if (!formData.dateOfBirth) return 'Date of birth is required';
    if (!formData.gender) return 'Gender is required';
    if (!formData.bloodGroup) return 'Blood group is required';
    if (!formData.address) return 'Address is required';
    if (!formData.city) return 'City is required';
    if (!formData.state) return 'State is required';
    if (!formData.pincode) return 'Pincode is required';
    if (!formData.emergencyContactName) return 'Emergency contact name is required';
    if (!formData.emergencyContactPhone) return 'Emergency contact phone is required';
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.emergencyContactPhone.replace(/[^0-9]/g, ''))) {
      return 'Please enter a valid 10-digit phone number';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      if (!userId) {
        throw new Error('User not found. Please login again.');
      }

      let response;
      if (hasExistingData) {
        response = await axios.put(`${API_BASE_URL}/patient-details/${userId}`, formData, axiosConfig);
        setMessage({ 
          type: 'success', 
          text: 'Patient details updated successfully!' 
        });
      } else {
        response = await axios.post(`${API_BASE_URL}/patient-details/${userId}`, formData, axiosConfig);
        setMessage({ 
          type: 'success', 
          text: 'Patient details saved successfully!' 
        });
        setHasExistingData(true);
      }
      
      console.log('API Response:', response.data);
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error saving patient details:', error);
      
      if (error.response) {
        const errorMsg = error.response.data?.error || 
                        error.response.data?.message || 
                        'Failed to save details. Please try again.';
        setMessage({ type: 'error', text: errorMsg });
      } else if (error.request) {
        setMessage({ 
          type: 'error', 
          text: 'Cannot connect to server. Please check if backend is running.' 
        });
      } else {
        setMessage({ type: 'error', text: 'An unexpected error occurred.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <User className="w-4 h-4" /> },
    { id: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency', icon: <Phone className="w-4 h-4" /> },
    { id: 'medical', label: 'Medical', icon: <Stethoscope className="w-4 h-4" /> }
  ];

  if (isLoading) {
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
          <p className="text-gray-600 font-medium">Loading your medical profile...</p>
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
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">Medical Profile</h1>
                    <p className="text-blue-100 text-lg">
                      {hasExistingData ? 'Update your health information' : 'Complete your health profile'}
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
                  <p className="text-sm text-blue-100">Welcome back,</p>
                  <p className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {userInfo.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
            {/* Message Display */}
            {message.text && (
              <div className={`relative overflow-hidden rounded-2xl ${
                message.type === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500' : 
                message.type === 'error' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500' :
                'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500'
              }`}>
                <div className="p-4 flex items-center gap-3">
                  {message.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {message.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                  {message.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                  <p className="font-medium text-slate-700">{message.text}</p>
                </div>
                <div className={`absolute bottom-0 left-0 h-1 w-full ${
                  message.type === 'success' ? 'bg-green-500' : 
                  message.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                } animate-shrink`}></div>
              </div>
            )}

            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-2xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Basic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      Date of Birth *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                      <input 
                        type="date" 
                        name="dateOfBirth" 
                        required 
                        value={formData.dateOfBirth} 
                        onChange={handleChange} 
                        className="relative w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      Age
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        name="age" 
                        readOnly 
                        value={formData.age} 
                        className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                        placeholder="Auto-calculated"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Gender *
                    </label>
                    <div className="relative">
                      <select 
                        name="gender" 
                        required 
                        value={formData.gender} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none appearance-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="group md:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Blood Group *
                    </label>
                    <div className="relative">
                      <select 
                        name="bloodGroup" 
                        required 
                        value={formData.bloodGroup} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none appearance-none"
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-2xl">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Address Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-500" />
                      Full Address *
                    </label>
                    <textarea 
                      name="address" 
                      rows="3" 
                      required 
                      value={formData.address} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      placeholder="House No, Street, Landmark..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">City *</label>
                    <input 
                      type="text" 
                      name="city" 
                      required 
                      value={formData.city} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      placeholder="e.g. Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">State *</label>
                    <input 
                      type="text" 
                      name="state" 
                      required 
                      value={formData.state} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      placeholder="e.g. Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pincode *</label>
                    <input 
                      type="text" 
                      name="pincode" 
                      required 
                      maxLength="6"
                      value={formData.pincode} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      placeholder="e.g. 400001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
                    <input 
                      type="text" 
                      name="country" 
                      required 
                      value={formData.country} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact Tab */}
            {activeTab === 'emergency' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-2xl">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Emergency Contact</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Contact Person Name *
                    </label>
                    <input 
                      type="text" 
                      name="emergencyContactName" 
                      required 
                      value={formData.emergencyContactName} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-blue-500" />
                      Contact Phone Number *
                    </label>
                    <input 
                      type="tel" 
                      name="emergencyContactPhone" 
                      required 
                      value={formData.emergencyContactPhone} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">Emergency Contact Information</p>
                      <p className="text-xs text-blue-600">
                        This contact will be notified in case of emergency. Please ensure the phone number is correct and reachable 24/7.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Medical History Tab */}
            {activeTab === 'medical' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 rounded-2xl">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Medical History</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Past Medical History
                    </label>
                    <textarea 
                      name="medicalHistory" 
                      rows="3" 
                      value={formData.medicalHistory} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                      placeholder="List past surgeries, chronic illnesses, etc."
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-500" />
                        Allergies
                      </label>
                      <textarea 
                        name="allergies" 
                        rows="3" 
                        value={formData.allergies} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                        placeholder="Food, medicine, or environmental allergies"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-blue-500" />
                        Current Medications
                      </label>
                      <textarea 
                        name="currentMedications" 
                        rows="3" 
                        value={formData.currentMedications} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:bg-white transition-all outline-none"
                        placeholder="Names and dosages of current medications"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
              <div className="flex gap-3">
                {activeTab !== 'basic' && (
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
                {activeTab !== 'medical' && (
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

              <div className="flex items-center gap-4">
                <p className="text-xs text-slate-500">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] justify-center">
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {hasExistingData ? 'Update Profile' : 'Save Profile'}
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Securely handled</span> for MediCarePlus Medical Systems
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

export default PatientDetailsForm;