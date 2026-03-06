import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  LogIn,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Shield,
  Phone,
  MapPin,
  ChevronRight
} from 'lucide-react';
import authService from '../services/AuthService';

const LabLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setSubmitError('');
      setEnrollmentStatus(null);
      
      try {
        // Attempt login
        const response = await authService.login({
          email: formData.email,
          password: formData.password
        });

        // Check if user has LAB role
        const role = response?.role || response?.user?.role;
        if (role !== 'LAB' && role !== 'ROLE_LAB') {
          authService.logout();
          setSubmitError('Access denied. This portal is only for laboratory users.');
          setIsLoading(false);
          return;
        }

        // Get user data
        const userData = response.user || response;
        
        // Check lab enrollment status
        const enrollmentResponse = await authService.getLabEnrollmentStatus(userData.id);
        const enrollment = enrollmentResponse;
        
        if (!enrollment) {
          setSubmitError('No lab enrollment found. Please complete enrollment first.');
          authService.logout();
          setIsLoading(false);
          return;
        }

        // Handle different enrollment statuses
        switch(enrollment.status) {
          case 'PENDING':
            setEnrollmentStatus('PENDING');
            setSubmitError('Your lab enrollment is pending approval. Please wait for admin verification.');
            authService.logout();
            setIsLoading(false);
            return;
            
          case 'REJECTED':
            setEnrollmentStatus('REJECTED');
            setSubmitError('Your lab enrollment has been rejected. Please contact admin for more information.');
            authService.logout();
            setIsLoading(false);
            return;
            
          case 'APPROVED':
            // Store lab info in localStorage
            localStorage.setItem('labInfo', JSON.stringify(enrollment));
            
            // Show success message and redirect
            setShowSuccess(true);
            setTimeout(() => {
              navigate('/lab/dashboard');
            }, 1500);
            break;
            
          default:
            setSubmitError('Invalid enrollment status. Please contact support.');
            authService.logout();
            setIsLoading(false);
        }
        
      } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          setSubmitError('Invalid email or password.');
        } else if (error.response?.data?.message) {
          setSubmitError(error.response.data.message);
        } else if (error.message) {
          setSubmitError(error.message);
        } else {
          setSubmitError('Login failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Render pending approval message
  if (enrollmentStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="text-yellow-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your lab enrollment is currently under review. You'll receive an email once approved.
          </p>
          <button
            onClick={() => {
              authService.logout();
              navigate('/lab/login');
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Render rejected message
  if (enrollmentStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enrollment Rejected</h2>
          <p className="text-gray-600 mb-6">
            Your lab enrollment has been rejected. Please contact support for more information.
          </p>
          <button
            onClick={() => {
              authService.logout();
              navigate('/lab/enrollment');
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Re-apply
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 cursor-pointer group"
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
              <span className="block text-xs text-gray-400">Laboratory Portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome Message */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 text-blue-700 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-blue-200/50 mb-6">
                <Building2 size={16} />
                Laboratory Partner Portal
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Welcome back to your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Lab Dashboard
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mt-4 leading-relaxed">
                Access your laboratory management tools, track test requests, 
                manage reports, and collaborate with healthcare providers.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {[
                { icon: CheckCircle, text: 'Manage test requests in real-time', color: 'text-green-500' },
                { icon: Shield, text: 'Secure patient data handling', color: 'text-blue-500' },
                { icon: Phone, text: '24/7 priority support', color: 'text-purple-500' },
                { icon: MapPin, text: 'Multi-location management', color: 'text-amber-500' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-${feature.color.split('-')[1]}-50 flex items-center justify-center`}>
                    <feature.icon size={18} className={feature.color} />
                  </div>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">500+</p>
                <p className="text-xs text-gray-500">Partner Labs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">50k+</p>
                <p className="text-xs text-gray-500">Tests Daily</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
                <p className="text-xs text-gray-500">Uptime</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative">
            {/* Success Message */}
            {showSuccess && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl z-20 flex items-center justify-center animate-fadeIn">
                <div className="text-center p-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Successful!</h3>
                  <p className="text-sm text-gray-600">Redirecting to lab dashboard...</p>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-100/50 overflow-hidden shadow-xl shadow-blue-100/20">
              {/* Form Header */}
              <div className="px-8 py-6 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Lab Partner Login</h2>
                    <p className="text-sm text-gray-600 mt-0.5">Access your laboratory portal</p>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-8">
                {submitError && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {submitError}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.email 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="lab@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          errors.password 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/lab/forgot-password')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn size={18} />
                        Sign in to Dashboard
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    New laboratory?{' '}
                    <button
                      onClick={() => navigate('/lab/enrollment')}
                      className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 group"
                    >
                      Partner with us
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={14} className="text-green-500" />
                <span>256-bit SSL</span>
              </div>
              <div className="w-px h-4 bg-gray-200"></div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle size={14} className="text-blue-500" />
                <span>ISO 27001</span>
              </div>
              <div className="w-px h-4 bg-gray-200"></div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={14} className="text-purple-500" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600 transition-colors">Contact Support</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600 transition-colors">Lab FAQ</a>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            © 2024 MediCarePlus Healthcare Systems. All rights reserved.
          </p>
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
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LabLogin;
