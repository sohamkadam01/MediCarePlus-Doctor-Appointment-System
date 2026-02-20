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
  GraduationCap
} from 'lucide-react';
import axios from 'axios';

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
    licenseCertificateUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [specializations, setSpecializations] = useState([]);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userId, setUserId] = useState(null);

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

      const response = await axios.get(`${API_BASE_URL}/doctors/details/${currentUserId}`, getAxiosConfig());
      if (response.data && typeof response.data === 'object' && response.data.id) {
        // Map backend response (camelCase) to form fields (snake_case)
        setFormData({
          specialization_id: response.data.specializationId?.toString() || '',
          experience_year: response.data.experienceYear?.toString() || '',
          clinic_address: response.data.clinicAddress || '',
          qualification: response.data.qualification || '',
          bio: response.data.bio || '',
          consultation_fee: response.data.consultationFee?.toString() || '',
          licenseCertificateUrl: response.data.licenseCertificateUrl || ''
        });
        setHasExistingData(true);
        setStatus({ 
          type: 'info', 
          message: 'Loaded your existing professional profile. You can update it below.' 
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
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
    // Clear status when user starts typing
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
      if (!userId) {
        throw new Error('User not found. Please register/login again.');
      }

      // Keep payload keys aligned with DoctorDetailsRequestDTO @JsonProperty names
      const requestData = {
        specialization_id: parseInt(formData.specialization_id),
        experience_year: parseInt(formData.experience_year),
        clinic_address: formData.clinic_address.trim(),
        qualification: formData.qualification.trim(),
        bio: formData.bio?.trim() || '',
        consultation_fee: parseFloat(formData.consultation_fee),
        licenseCertificateUrl: formData.licenseCertificateUrl?.trim() || ''
      };

      const response = await axios.post(
        `${API_BASE_URL}/doctors/details/${userId}`,
        requestData,
        getAxiosConfig()
      );

      setStatus({
        type: 'success',
        message: hasExistingData
          ? 'Professional profile updated successfully! It will be reviewed by admin.'
          : 'Professional profile submitted successfully! It is pending admin approval.'
      });
      setHasExistingData(true);

      console.log('Doctor details saved:', response.data);

      // Redirect to pending page after 2 seconds
      setTimeout(() => {
        navigate('/doctor/pending');
      }, 2000);

    } catch (error) {
      console.error('Error saving doctor details:', error);
      
      if (error.response) {
        // Server responded with error
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
        // Request made but no response
        setStatus({ 
          type: 'error', 
          message: 'Cannot connect to server. Please check if backend is running.' 
        });
      } else {
        // Something else happened
        setStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionHeaderClass = "flex items-center gap-2 text-lg font-semibold text-indigo-700 border-b pb-2 mb-4 mt-6";

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Doctor Professional Profile</h1>
              <p className="mt-2 text-indigo-100 italic">
                {hasExistingData ? 'Update your professional information' : 'Complete your credentials to join our healthcare network'}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              {userInfo && (
                <div className="bg-indigo-500/30 px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">Dr.</p>
                  <p className="text-lg font-bold">{userInfo.name}</p>
                </div>
              )}
              <div className="bg-indigo-500 p-4 rounded-full border-2 border-indigo-400">
                <Stethoscope size={48} />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Status Message */}
          {status.message && (
            <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-300 ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
              status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {status.type === 'success' && <CheckCircle size={20} />}
              {status.type === 'error' && <XCircle size={20} />}
              {status.type === 'info' && <AlertCircle size={20} />}
              <span className="font-medium">{status.message}</span>
            </div>
          )}

          {/* Professional Credentials */}
          <div className={sectionHeaderClass}>
            <Award size={20} />
            <span>Professional Credentials</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Specialization *</label>
              <select 
                name="specialization_id" 
                required
                className={inputClass}
                value={formData.specialization_id}
                onChange={handleChange}
              >
                <option value="">Select Specialization</option>
                {specializations.map(spec => (
                  <option key={spec.id} value={spec.id}>{spec.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                This links your profile to the specialization table
              </p>
            </div>
            <div>
              <label className={labelClass}>Years of Experience *</label>
              <div className="relative">
                <input 
                  type="number" 
                  name="experience_year" 
                  required
                  min="0"
                  max="70"
                  placeholder="e.g. 10"
                  className={inputClass}
                  value={formData.experience_year}
                  onChange={handleChange}
                />
                <span className="absolute right-3 top-2 text-gray-400 text-sm">Years</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Educational Qualification *</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="qualification" 
                  required
                  placeholder="MBBS, MD, MS, DM, FRCP..."
                  className={`${inputClass} pl-10`}
                  value={formData.qualification}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Practice Details */}
          <div className={sectionHeaderClass}>
            <Building2 size={20} />
            <span>Practice & Fees</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Clinic/Hospital Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <textarea 
                  name="clinic_address" 
                  rows="2"
                  required
                  placeholder="Full address of your primary consultation clinic"
                  className={`${inputClass} pl-10`}
                  value={formData.clinic_address}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Consultation Fee *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  name="consultation_fee" 
                  required
                  placeholder="0.00"
                  className={`${inputClass} pl-10`}
                  value={formData.consultation_fee}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>License Certificate URL</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="url" 
                  name="licenseCertificateUrl" 
                  placeholder="Link to digital license or cloud storage"
                  className={`${inputClass} pl-10`}
                  value={formData.licenseCertificateUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* About the Doctor */}
          <div className={sectionHeaderClass}>
            <Briefcase size={20} />
            <span>Professional Bio</span>
          </div>

          <div>
            <label className={labelClass}>About You</label>
            <textarea 
              name="bio" 
              rows="4"
              placeholder="Tell patients about your expertise, approach, achievements, and years of experience..."
              className={inputClass}
              value={formData.bio}
              onChange={handleChange}
            />
            <p className="mt-2 text-xs text-gray-500">
              This bio will be visible to patients when they browse for doctors.
            </p>
          </div>

          {/* Footer Info / Status Note */}
          <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
            <Clock className="text-amber-600 flex-shrink-0" size={20} />
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Your profile will be marked as "Pending Approval" until our administration team verifies your medical license and credentials. You'll receive an email once approved.
            </p>
          </div>

          {/* Submit Button */}
          <div className="mt-10">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={24} />
                  {hasExistingData ? 'Update Professional Profile' : 'Submit Professional Profile'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorDetailsForm;



