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
  XCircle
} from 'lucide-react';
import axios from 'axios';

const PatientDetailsForm = () => {
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
      // Get user info from token or local storage
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
        // Format date for input field (YYYY-MM-DD)
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
        // No existing data - this is fine for new patients
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
    // Clear any previous messages when user starts typing
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
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.emergencyContactPhone.replace(/[^0-9]/g, ''))) {
      return 'Please enter a valid 10-digit phone number';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
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
        // Update existing data
        response = await axios.put(`${API_BASE_URL}/patient-details/${userId}`, formData, axiosConfig);
        setMessage({ 
          type: 'success', 
          text: 'Patient details updated successfully!' 
        });
      } else {
        // Create new data
        response = await axios.post(`${API_BASE_URL}/patient-details/${userId}`, formData, axiosConfig);
        setMessage({ 
          type: 'success', 
          text: 'Patient details saved successfully!' 
        });
        setHasExistingData(true);
      }
      
      console.log('API Response:', response.data);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error saving patient details:', error);
      
      if (error.response) {
        // Server responded with error
        const errorMsg = error.response.data?.error || 
                        error.response.data?.message || 
                        'Failed to save details. Please try again.';
        setMessage({ type: 'error', text: errorMsg });
      } else if (error.request) {
        // Request made but no response
        setMessage({ 
          type: 'error', 
          text: 'Cannot connect to server. Please check if backend is running.' 
        });
      } else {
        // Something else happened
        setMessage({ type: 'error', text: 'An unexpected error occurred.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block transition-all duration-200 outline-none";
  const labelClass = "block mb-2 text-sm font-semibold text-gray-700 flex items-center gap-2";
  const sectionTitle = "text-lg font-bold text-blue-800 mb-6 pb-2 border-b-2 border-blue-100 flex items-center gap-2";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Medicare+</h1>
                <p className="mt-2 text-blue-100 italic">
                  {hasExistingData ? 'Update your medical profile' : 'Complete your medical profile'}
                </p>
              </div>
              {userInfo && (
                <div className="bg-white/20 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">Welcome,</p>
                  <p className="text-lg font-bold">{userInfo.name}</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
                message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {message.type === 'success' && <CheckCircle size={20} />}
                {message.type === 'error' && <XCircle size={20} />}
                {message.type === 'info' && <AlertCircle size={20} />}
                <p className="font-medium">{message.text}</p>
              </div>
            )}

            {/* Basic Information */}
            <section>
              <h2 className={sectionTitle}>
                <User size={20} /> Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}><Calendar size={16} /> Date of Birth *</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    required 
                    value={formData.dateOfBirth} 
                    onChange={handleChange} 
                    className={inputClass} 
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className={labelClass}>Age</label>
                  <input 
                    type="number" 
                    name="age" 
                    readOnly 
                    value={formData.age} 
                    className={`${inputClass} bg-gray-100 cursor-not-allowed`} 
                    placeholder="Auto-calculated"
                  />
                </div>
                <div>
                  <label className={labelClass}>Gender *</label>
                  <select 
                    name="gender" 
                    required 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className={inputClass}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Blood Group *</label>
                  <select 
                    name="bloodGroup" 
                    required 
                    value={formData.bloodGroup} 
                    onChange={handleChange} 
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Address Details */}
            <section>
              <h2 className={sectionTitle}>
                <MapPin size={20} /> Contact & Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>Full Address *</label>
                  <textarea 
                    name="address" 
                    rows="2" 
                    required 
                    value={formData.address} 
                    onChange={handleChange} 
                    className={inputClass}
                    placeholder="House No, Street, Landmark..."
                  ></textarea>
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input 
                    type="text" 
                    name="city" 
                    required 
                    value={formData.city} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <input 
                    type="text" 
                    name="state" 
                    required 
                    value={formData.state} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div>
                  <label className={labelClass}>Pincode *</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    required 
                    maxLength="6"
                    value={formData.pincode} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="e.g. 400001"
                  />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input 
                    type="text" 
                    name="country" 
                    required 
                    value={formData.country} 
                    onChange={handleChange} 
                    className={inputClass} 
                    readOnly
                  />
                </div>
              </div>
            </section>

            {/* Emergency Contact */}
            <section>
              <h2 className={sectionTitle}>
                <Phone size={20} /> Emergency Contact *
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Contact Person Name</label>
                  <input 
                    type="text" 
                    name="emergencyContactName" 
                    required 
                    value={formData.emergencyContactName} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone Number</label>
                  <input 
                    type="tel" 
                    name="emergencyContactPhone" 
                    required 
                    value={formData.emergencyContactPhone} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </section>

            {/* Medical Info */}
            <section>
              <h2 className={sectionTitle}>
                <Stethoscope size={20} /> Medical History (Optional)
              </h2>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Past Medical History</label>
                  <textarea 
                    name="medicalHistory" 
                    rows="3" 
                    value={formData.medicalHistory} 
                    onChange={handleChange} 
                    className={inputClass}
                    placeholder="List past surgeries, chronic illnesses, etc."
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Allergies</label>
                    <textarea 
                      name="allergies" 
                      rows="2" 
                      value={formData.allergies} 
                      onChange={handleChange} 
                      className={inputClass}
                      placeholder="Food, medicine, or environmental allergies"
                    ></textarea>
                  </div>
                  <div>
                    <label className={labelClass}>Current Medications</label>
                    <textarea 
                      name="currentMedications" 
                      rows="2" 
                      value={formData.currentMedications} 
                      onChange={handleChange} 
                      className={inputClass}
                      placeholder="Names and dosages of current medications"
                    ></textarea>
                  </div>
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="pt-6 flex items-center justify-between border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {hasExistingData ? 'Update Profile' : 'Save Profile'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-6 text-center text-gray-500 text-sm">
          Securely handled for <span className="font-semibold">MedicarePlus</span> Medical Systems.
        </p>
      </div>
    </div>
  );
};

export default PatientDetailsForm;
