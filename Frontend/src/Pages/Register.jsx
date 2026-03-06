// Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, User, Mail, Lock, Phone, Shield, CheckCircle, Heart, 
  Users, Stethoscope, Calendar, Award, ArrowLeft, ArrowRight, 
  MailCheck, KeyRound, RefreshCw, Clock, AlertCircle 
} from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [step, setStep] = useState('REGISTER'); // REGISTER, VERIFY_OTP, SUCCESS
  const [userType, setUserType] = useState('PATIENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredUserId, setRegisteredUserId] = useState(null);
  
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:8080/api';

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone
      };
      
      let endpoint = '/users/register';
      if (userType === 'PATIENT') {
        endpoint = '/users/register/patient';
      } else if (userType === 'DOCTOR') {
        endpoint = '/users/register/doctor';
      } else if (userType === 'ADMIN') {
        endpoint = '/users/register/admin';
      }
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, userData);
      
      setRegisteredEmail(formData.email);
      setRegisteredUserId(response.data.userId);
      setSuccess('Registration successful! Please check your email for OTP.');
      setStep('VERIFY_OTP');
      startCountdown();
      
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || err.response.data?.error || 'Registration failed');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const otpString = otp.join('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/users/verify-otp`, {
        email: registeredEmail,
        otp: otpString
      });
      
      setSuccess('Email verified successfully!');
      
      // Now login the user
      await loginUser();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Login after successful verification
  const loginUser = async () => {
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: registeredEmail,
        password: formData.password
      });

      localStorage.setItem('token', loginResponse.data.token);
      localStorage.setItem('user', JSON.stringify(loginResponse.data));
      
      setStep('SUCCESS');
      
      setTimeout(() => {
        if (userType === 'PATIENT') {
          navigate('/patient/details');
        } else if (userType === 'DOCTOR') {
          navigate('/doctor/pending');
        } else if (userType === 'ADMIN') {
          navigate('/admin/dashboard');
        }
      }, 1500);
      
    } catch (err) {
      setError('Auto-login failed. Please login manually.');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/users/resend-otp?email=${registeredEmail}`);
      
      setSuccess('New OTP sent to your email!');
      setOtp(['', '', '', '', '', '']);
      startCountdown();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Start countdown for resend button
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

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const stats = [
    { value: "50k+", label: "Happy Patients" },
    { value: "500+", label: "Expert Doctors" },
    { value: "24/7", label: "Support" }
  ];

  // Render registration form - Google Style
  const renderRegisterForm = () => (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-normal text-gray-600 mb-1">Create your</h2>
        <h1 className="text-3xl font-bold text-gray-900">MediCare Plus account</h1>
        <p className="text-sm text-gray-500 mt-2">Join thousands of patients and doctors</p>
      </div>

      {/* User Type Tabs - Google Style */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setUserType('PATIENT')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              userType === 'PATIENT'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <User size={16} />
              Patient
            </div>
          </button>
          <button
            type="button"
            onClick={() => setUserType('DOCTOR')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              userType === 'DOCTOR'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Stethoscope size={16} />
              Doctor
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Email field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Phone field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Phone number</label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Create a password (min. 6 characters)"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
        </div>

        {/* Doctor verification notice */}
        {userType === 'DOCTOR' && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800">Doctor Account Verification</p>
                <p className="text-[10px] text-blue-600 mt-0.5">
                  Your account will require admin approval after email verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Terms checkbox */}
        <div className="flex items-start gap-2">
          <input 
            type="checkbox" 
            id="terms" 
            className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label htmlFor="terms" className="text-xs text-gray-500">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">Privacy Policy</a>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <UserPlus size={16} />
              <span>Create {userType === 'PATIENT' ? 'Patient' : 'Doctor'} account</span>
            </>
          )}
        </button>
      </form>

      {/* Sign in link */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );

  // Render OTP verification form - Google Style
  const renderOtpForm = () => (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-normal text-gray-600 mb-1">Verify your email</h2>
        <h1 className="text-3xl font-bold text-gray-900">Enter verification code</h1>
        <p className="text-sm text-gray-500 mt-2">
          We've sent a 6-digit code to <span className="font-medium text-gray-700">{registeredEmail}</span>
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2">
          <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleVerifyOtp} className="space-y-6">
        {/* OTP Input Boxes - Google Style */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-gray-600 block">Verification code</label>
          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-10 h-12 text-center text-lg font-medium border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                required
              />
            ))}
          </div>
        </div>

        {/* Resend OTP Section */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || loading}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {canResend ? 'Resend code' : `Resend in ${countdown}s`}
          </button>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            <span>Expires in 10 min</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep('REGISTER')}
            className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          
          <button
            type="submit"
            disabled={loading || otp.some(d => !d)}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Verify</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Render success screen - Google Style
  const renderSuccess = () => (
    <div className="w-full max-w-md mx-auto text-center py-8">
      <div className="mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Email verified!</h2>
      <p className="text-sm text-gray-500 mb-6">
        Your email has been successfully verified.<br />
        Redirecting you to your dashboard...
      </p>
      
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Google Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-white to-indigo-50 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        </div>

        <div className="relative max-w-md text-center">
          {/* Google-style logo */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-1 mb-6">

            </div>
            <h2 className="text-3xl font-light text-gray-600 mb-2">Join our community</h2>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Start your health journey
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-3 text-left bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Easy Booking</p>
                <p className="text-xs text-gray-500">Schedule appointments in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Heart size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Quality Care</p>
                <p className="text-xs text-gray-500">Access to verified specialists</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Award size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Best Doctors</p>
                <p className="text-xs text-gray-500">Top-rated medical professionals</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              "Joining MediCarePlus was the best decision for my family's health. The platform is intuitive and the doctors are exceptional."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                SJ
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Sarah Johnson</p>
                <p className="text-[10px] text-gray-500">Patient since 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button 
            onClick={() => {
              if (step === 'VERIFY_OTP') {
                setStep('REGISTER');
                setError('');
                setSuccess('');
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>{step === 'VERIFY_OTP' ? 'Back to registration' : 'Back to home'}</span>
          </button>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Step-based rendering */}
          {step === 'REGISTER' && renderRegisterForm()}
          {step === 'VERIFY_OTP' && renderOtpForm()}
          {step === 'SUCCESS' && renderSuccess()}

          {/* Security badge */}
          {step === 'REGISTER' && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Shield size={12} />
                <span>Your data is encrypted and secure</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default Register;