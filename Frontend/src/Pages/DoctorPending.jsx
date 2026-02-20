// DoctorPending.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Mail, ArrowLeft, User } from 'lucide-react';
import axios from 'axios';

const DoctorPending = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Check if doctor has submitted details
    const checkDoctorDetails = async () => {
      try {
        if (!user?.id) {
          navigate('/register');
          return;
        }
        const response = await axios.get(`http://localhost:8080/api/doctors/details/${user.id}`);
        
        if (!response.data) {
          // No details found, redirect to details form
          navigate('/doctor/details');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // No details found, redirect to details form
          navigate('/doctor/details');
        }
      }
    };

    checkDoctorDetails();
  }, [navigate, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Profile Under Review</h2>
          <p className="text-slate-600">
            Thank you for registering, <span className="font-semibold">Dr. {user.name}</span>!
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            What happens next?
          </h3>
          <ul className="space-y-3 text-sm text-yellow-700">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">1.</span>
              Our admin team will review your credentials and experience
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">2.</span>
              You'll receive an email confirmation once approved
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">3.</span>
              After approval, you can login and start accepting appointments
            </li>
          </ul>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Profile Status
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-indigo-700">
              <span className="font-medium">Name:</span> Dr. {user.name}
            </p>
            <p className="text-indigo-700">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-indigo-700">
              <span className="font-medium">Status:</span>{' '}
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                <Clock size={12} /> PENDING APPROVAL
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPending;

