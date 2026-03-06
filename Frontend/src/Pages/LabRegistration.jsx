import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Phone,
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const LabRegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [step, setStep] = useState('REGISTER'); // REGISTER, VERIFY_OTP, SUCCESS
  const [showSuccess, setShowSuccess] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const API_BASE_URL = 'http://localhost:8080/api';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Lab name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm() && agreeTerms) {
      setIsLoading(true);
      setGlobalError('');
      setGlobalSuccess('');
      try {
        const payload = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        };
        const response = await axios.post(`${API_BASE_URL}/users/register/lab`, payload);
        setRegisteredEmail(response.data?.email || formData.email);
        setGlobalSuccess('Registration successful! Please check your email for OTP.');
        setStep('VERIFY_OTP');
        startCountdown();
      } catch (err) {
        if (err.response) {
          setGlobalError(err.response.data?.message || err.response.data?.error || 'Registration failed');
        } else {
          setGlobalError('Network error. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else if (!agreeTerms) {
      setErrors(prev => ({ ...prev, terms: 'You must agree to the terms and conditions' }));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setGlobalError('');
    const otpString = otp.join('');

    try {
      await axios.post(`${API_BASE_URL}/users/verify-otp`, {
        email: registeredEmail,
        otp: otpString
      });
      setGlobalSuccess('Email verified successfully!');
      setStep('SUCCESS');
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/lab/enrollment');
      }, 1500);
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setGlobalError('');
    try {
      await axios.post(`${API_BASE_URL}/users/resend-otp?email=${registeredEmail}`);
      setGlobalSuccess('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
      startCountdown();
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`lab-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`lab-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const digits = pasted.split('');
      const newOtp = [...otp];
      digits.forEach((digit, idx) => {
        if (idx < 6) newOtp[idx] = digit;
      });
      setOtp(newOtp);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md border-b border-blue-100/50 sticky top-0">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">+</span>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">MediCare</span>
                  <span className="text-gray-700">Plus</span>
                </span>
                <span className="block text-xs text-gray-400">Lab Registration</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-md mx-auto px-4 py-12">
        {step === 'SUCCESS' && showSuccess && (
          <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-200 rounded-2xl text-center animate-fadeIn">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-4">
              Your lab account is verified. Redirecting to lab enrollment...
            </p>
          </div>
        )}

        {step !== 'SUCCESS' && (
          <>
            {/* Form Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-100/50 overflow-hidden shadow-xl shadow-blue-100/20">
              {/* Form Header */}
              <div className="px-6 py-5 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Create Lab Account</h2>
                    <p className="text-xs text-gray-600 mt-0.5">Register to access the lab portal</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6">
                {globalError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {globalError}
                  </div>
                )}
                {globalSuccess && (
                  <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-600">
                    {globalSuccess}
                  </div>
                )}

                {step === 'VERIFY_OTP' ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="text-sm text-gray-600">
                      Enter the 6-digit OTP sent to <span className="font-semibold">{registeredEmail}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`lab-otp-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          maxLength={1}
                          className="w-12 h-12 text-center text-lg font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{canResend ? 'Didn’t receive OTP?' : `Resend available in ${countdown}s`}</span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={!canResend || isLoading}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
                      >
                        <RefreshCw size={12} />
                        Resend OTP
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.join('').length !== 6}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify OTP
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Lab Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                        errors.name
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="e.g., City Diagnostics"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                          errors.phone
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                          errors.email 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="lab@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-10 py-2.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                          errors.password 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    {!errors.password && formData.password && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[10px] text-gray-500">Password strength:</p>
                        <div className="flex gap-1 h-1">
                          <div className={`flex-1 h-full rounded-full ${
                            formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                          <div className={`flex-1 h-full rounded-full ${
                            /[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                          <div className={`flex-1 h-full rounded-full ${
                            /[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                          <div className={`flex-1 h-full rounded-full ${
                            /\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-9 pr-10 py-2.5 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                          errors.confirmPassword 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-3 border border-gray-200 mt-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 text-blue-600 mt-0.5 rounded"
                      />
                      <div>
                        <span className="text-xs font-medium text-gray-700">
                          I agree to the Terms and Conditions
                        </span>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          By registering, you agree to our{' '}
                          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                          {' '}and{' '}
                          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                        </p>
                      </div>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors.terms}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Lab Account
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
                )}
              </div>
            </div>

            {step === 'REGISTER' && (
              <>
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-600">
                    Already have a lab account?{' '}
                    <button
                      onClick={() => navigate('/lab/login')}
                      className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 group"
                    >
                      Sign in
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5">
                  <Shield size={12} className="text-green-500" />
                  <span className="text-[10px] text-gray-400">256-bit SSL Secure</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LabRegistration;
