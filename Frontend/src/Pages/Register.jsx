// Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Phone, ArrowLeft, Loader } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [userType, setUserType] = useState('PATIENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:8080/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userData = {
        ...formData,
        role: userType
      };
      
      // Determine endpoint based on role
      let endpoint = '/users/register';
      if (userType === 'PATIENT') {
        endpoint = '/users/register/patient';
      } else if (userType === 'DOCTOR') {
        endpoint = '/users/register/doctor';
      } else if (userType === 'ADMIN') {
        endpoint = '/users/register/admin';
      }
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, userData);
      
      console.log('Registration successful');
      
      if (userType === 'PATIENT') {
        // Auto login patient, then redirect to details form
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem('token', loginResponse.data.token);
        localStorage.setItem('user', JSON.stringify(loginResponse.data));
        navigate('/patient/details');
      } else if (userType === 'DOCTOR') {
        // Redirect doctor to professional details form
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/doctor/details');
      } else if (userType === 'ADMIN') {
        // Admin can login after registration
        navigate('/admin/dashboard');
      }
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-2">Join MediCarePlus today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setUserType('PATIENT')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              userType === 'PATIENT' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setUserType('DOCTOR')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              userType === 'DOCTOR' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <User className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                className="bg-transparent border-none focus:ring-0 w-full outline-none"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <Mail className="w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="bg-transparent border-none focus:ring-0 w-full outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <Phone className="w-5 h-5 text-slate-400" />
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                className="bg-transparent border-none focus:ring-0 w-full outline-none"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <Lock className="w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                className="bg-transparent border-none focus:ring-0 w-full outline-none"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          {userType === 'DOCTOR' && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Doctor accounts require admin approval before you can start booking appointments. You'll receive an email once approved.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              `Register as ${userType}`
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
