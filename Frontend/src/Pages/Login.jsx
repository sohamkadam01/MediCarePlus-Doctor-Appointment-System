import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowLeft, Shield, CheckCircle, Heart, Users, User, Stethoscope, AlertCircle } from 'lucide-react';
import authService from '../services/AuthService';

const Login = () => {
  const [userType, setUserType] = useState('PATIENT');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const credentials = {
        email: formData.email,
        password: formData.password
      };

      const response = await authService.login(credentials);
      
      if (response.role === 'ADMIN') {
        navigate('/admin/dashboard');
        return;
      }

      if (response.role === 'DOCTOR' && userType !== 'DOCTOR') {
        setError('Please sign in from the Doctor section.');
        return;
      }

      if (response.role === 'PATIENT' && userType !== 'PATIENT') {
        setError('Please sign in from the Patient section.');
        return;
      }

      if (response.role === 'DOCTOR') {
        if (response.status === 'PENDING_APPROVAL') {
          navigate('/doctor/pending');
        } else {
          navigate('/doctor/dashboard');
        }
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Google-inspired logo */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-1 mb-6">
              {/* <span className="text-5xl font-bold text-blue-600">M</span>
              <span className="text-5xl font-bold text-red-500">e</span>
              <span className="text-5xl font-bold text-yellow-500">d</span>
              <span className="text-5xl font-bold text-blue-600">i</span>
              <span className="text-5xl font-bold text-green-500">C</span>
              <span className="text-5xl font-bold text-red-500">a</span>
              <span className="text-5xl font-bold text-yellow-500">r</span>
              <span className="text-5xl font-bold text-blue-600">e</span> */}
            </div>
            <h2 className="text-3xl font-light text-gray-600 mb-2">Welcome back to</h2>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Your Health Dashboard
            </h1>
          </div>

          {/* Feature list - Google style */}
          <div className="space-y-4 text-left bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Secure & Private</p>
                <p className="text-xs text-gray-500">Your health data is encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Verified Doctors</p>
                <p className="text-xs text-gray-500">All professionals are certified</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">50k+ Patients</p>
                <p className="text-xs text-gray-500">Trusted by thousands</p>
              </div>
            </div>
          </div>

          {/* Testimonial - Google style */}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              "This platform has transformed how I manage my healthcare. The doctors are professional and the service is exceptional."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                JD
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">John Doe</p>
                <p className="text-[10px] text-gray-500">Patient since 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form - Google Style */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to home</span>
          </button>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-normal text-gray-600 mb-1">Sign in to</h2>
            <h1 className="text-3xl font-bold text-gray-900">MediCare Plus</h1>
            <p className="text-sm text-gray-500 mt-2">Use your account to access your health dashboard</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* User Type Toggle - Google style */}
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

          {/* Form - Google style */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-xs text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit button - Google style */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign in</span>
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>

          {/* Security badge */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Shield size={12} />
              <span>Protected by enterprise-grade security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;