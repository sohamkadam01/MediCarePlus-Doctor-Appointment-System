// components/patient/PatientInfoPortal.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Microscope, MapPin, User, Home, Clock, Calendar, 
  CheckCircle, XCircle, ChevronRight, Phone, Mail,
  Award, Heart, Droplet, Activity, FileText, Star,
  Shield, AlertCircle, Navigation, Building, Stethoscope,
  ArrowLeft, Printer, Download, Loader, Info, UserCheck,
  MailCheck, AlertTriangle, CreditCard, Lock, HelpCircle
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const PatientInfoPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [requestStatusOpen, setRequestStatusOpen] = useState(false);
  const [requestStatusDetails, setRequestStatusDetails] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const [patientDetails, setPatientDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    age: '',
    gender: ''
  });

  // Get booking data from navigation state
  useEffect(() => {
    if (location.state?.bookingData) {
      setBookingData(location.state.bookingData);
      console.log('Received booking data:', location.state.bookingData);
      
      // Pre-fill email if available from booking data
      if (location.state.bookingData.patientEmail) {
        setPatientDetails(prev => ({
          ...prev,
          email: location.state.bookingData.patientEmail
        }));
      }
    } else {
      // If no data, redirect back to lab selection
      navigate('/labs');
    }
  }, [location, navigate]);

  // Auto-fill if user is verified
  useEffect(() => {
    if (verifiedUser) {
      setPatientDetails(prev => ({
        ...prev,
        fullName: verifiedUser.name || prev.fullName,
        email: verifiedUser.email || prev.email,
        phone: verifiedUser.phone || prev.phone
      }));
    }
  }, [verifiedUser]);

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg">Loading your booking information...</p>
        </div>
      </div>
    );
  }

  // Calculate total price
  const calculateTotal = () => {
    let total = bookingData.testPrice || 0;
    // Add service fee based on lab type
    const serviceFee = bookingData.homeCollection ? 25 : 10;
    total += serviceFee;
    
    if (bookingData.referralType === 'doctor') {
      total -= 5; // Doctor referral discount
    }
    return total.toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const verifyPatient = async () => {
    if (!patientDetails.email) {
      alert('Please enter your email for verification');
      return;
    }

    setVerifying(true);
    setVerificationStatus(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/verify-patient`, {
        email: patientDetails.email
      });

      if (response.data.exists) {
        setVerifiedUser(response.data.patientInfo);
        setVerificationStatus({
          type: 'success',
          message: response.data.message
        });
        setShowRegistration(false);
      } else {
        setVerificationStatus({
          type: 'error',
          message: response.data.message
        });
        // Show registration option for new users
        if (response.data.message.includes('not found')) {
          setShowRegistration(true);
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus({
        type: 'error',
        message: 'Error verifying user. Please try again.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmBooking = async () => {
    // Validate patient details
    if (!patientDetails.fullName || !patientDetails.phone || !patientDetails.email) {
      alert('Please fill in all required patient details');
      return;
    }

    setSubmitting(true);

    // Prepare final booking data for backend
    const finalBookingData = {
      // Test information
      testName: bookingData.testName,
      testPrice: bookingData.testPrice,
      preparation: bookingData.preparation,
      turnaround: bookingData.turnaround,
      
      // Lab information
      labId: bookingData.labId,
      labName: bookingData.labName,
      labAddress: bookingData.labAddress,
      labCity: bookingData.labCity,
      labState: bookingData.labState,
      labPincode: bookingData.labPincode,
      labPhone: bookingData.labPhone,
      labEmail: bookingData.labEmail,
      homeCollection: bookingData.homeCollection || false,
      emergencyServices: bookingData.emergencyServices || false,
      
      // Referral information
      referralType: bookingData.referralType,
      
      // Patient information
      patientId: verifiedUser?.id || null,
      patientName: patientDetails.fullName,
      patientPhone: patientDetails.phone,
      patientEmail: patientDetails.email,
      patientAge: patientDetails.age ? parseInt(patientDetails.age) : null,
      patientGender: patientDetails.gender || null,
      
      // Price details
      testFee: bookingData.testPrice,
      serviceFee: bookingData.homeCollection ? 25 : 10,
      discount: bookingData.referralType === 'doctor' ? 5 : 0,
      totalAmount: parseFloat(calculateTotal()),
      
      // Metadata
      bookingSource: 'PATIENT_PORTAL',
      bookingStatus: 'PENDING'
    };

    try {
      // Send booking to backend
      const response = await axios.post(`${API_BASE_URL}/appointments/book-lab-appointment`, finalBookingData);
      
      if (response.data) {
        const bookingId = response.data.bookingId || 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const bookingPayload = {
          ...finalBookingData,
          bookingId,
          bookingDate: new Date().toISOString(),
          confirmationNumber: response.data.confirmationNumber
        };

        setRequestStatusDetails({
          status: 'PENDING',
          message: 'Request sent to lab. Awaiting confirmation.',
          bookingId,
          confirmationNumber: response.data.confirmationNumber
        });
        setPendingNavigation({
          path: '/patient/dashboard',
          state: { bookingData: bookingPayload }
        });
        setRequestStatusOpen(true);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/labs');
  };

  const handleRequestStatusContinue = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation.path, { state: pendingNavigation.state });
    }
    setRequestStatusOpen(false);
    setPendingNavigation(null);
  };

  const serviceFee = bookingData.homeCollection ? 25 : 10;

  return (
    <div className="min-h-screen bg-white">
      {/* Google-style minimal header */}


      {/* Main content - Google-style centered layout */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress indicator - Google style */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-blue-600 font-medium">1. Select Test</span>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-blue-600 font-medium">2. Choose Lab</span>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">3. Patient Details</span>
          </div>
          <div className="mt-4 h-1 bg-gray-200 rounded-full max-w-md mx-auto">
            <div className="h-1 bg-blue-600 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* Main card - Google Material Design */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header section */}
          <div className="border-b border-gray-200 bg-gray-50/50 px-8 py-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                Booking Summary
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                bookingData.referralType === 'doctor' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {bookingData.referralType === 'doctor' ? 'Doctor Referral' : 'Self Check'}
              </span>
              {bookingData.homeCollection && (
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                  Home Collection
                </span>
              )}
            </div>
            <h1 className="text-2xl font-medium text-gray-900">Complete your booking</h1>
            <p className="text-gray-500 text-sm mt-1">Please verify your details to continue</p>
          </div>

          {/* Content section */}
          <div className="p-8">
            {/* Selected Test - Google-style card */}
            <div className="flex items-start justify-between pb-6 border-b border-gray-200">
              <div className="flex gap-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Droplet className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{bookingData.testName}</h2>
                  <p className="text-sm text-gray-500 mt-1">{bookingData.description || 'Diagnostic test'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      Reports: {bookingData.turnaround || '24 hours'}
                    </span>
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Award size={12} />
                      NABL Accredited
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Test Price</p>
                <p className="text-2xl font-medium text-gray-900">₹{bookingData.testPrice}</p>
              </div>
            </div>

            {/* Selected Lab */}
            <div className="flex items-start justify-between py-6 border-b border-gray-200">
              <div className="flex gap-4">
                <div className="bg-purple-50 p-3 rounded-xl">
                  <Microscope className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{bookingData.labName}</h2>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    {bookingData.labAddress}, {bookingData.labCity}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone size={12} />
                      {bookingData.labPhone}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Mail size={12} />
                      {bookingData.labEmail}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleGoBack}
                className="text-blue-600 text-sm hover:bg-blue-50 px-3 py-1 rounded-md transition-colors"
              >
                Change
              </button>
            </div>

            {bookingData.referralType === 'doctor' && bookingData.referralDoctorName && (
              <div className="flex items-start justify-between py-6 border-b border-gray-200">
                <div className="flex gap-4">
                  <div className="bg-emerald-50 p-3 rounded-xl">
                    <Stethoscope className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Referring Doctor</h2>
                    <p className="text-sm text-gray-500 mt-1">Dr. {bookingData.referralDoctorName}</p>
                    {bookingData.referralDoctorSpecialization && (
                      <p className="text-xs text-gray-500 mt-1">{bookingData.referralDoctorSpecialization}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Patient Verification - Google style */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck size={18} className="text-blue-600" />
                Patient Verification
              </h2>
              
              {!verifiedUser ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Enter your email to verify your account
                  </p>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="email"
                        name="email"
                        value={patientDetails.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        disabled={verifying}
                      />
                    </div>
                    <button
                      onClick={verifyPatient}
                      disabled={verifying || !patientDetails.email}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 text-sm font-medium flex items-center gap-2"
                    >
                      {verifying ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <MailCheck size={16} />
                          Verify
                        </>
                      )}
                    </button>
                  </div>

                  {verificationStatus && (
                    <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                      verificationStatus.type === 'success' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {verificationStatus.type === 'success' ? (
                        <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                      )}
                      <span>{verificationStatus.message}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Verified Patient</p>
                    <p className="text-sm text-green-600">Welcome back, {verifiedUser.name}!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Patient Details Form - Google style */}
            <div className="py-6">
              <h2 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Patient Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={patientDetails.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                    readOnly={!!verifiedUser?.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={patientDetails.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={patientDetails.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
                    readOnly={!!verifiedUser}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={patientDetails.age}
                    onChange={handleInputChange}
                    placeholder="30"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={patientDetails.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preparation Instructions - Google style alert */}
            {bookingData.preparation && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex gap-3">
                  <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800 text-sm">Preparation Required</h3>
                    <p className="text-sm text-amber-700 mt-1">{bookingData.preparation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with price and confirm button - Google style */}
          <div className="border-t border-gray-200 bg-gray-50/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total amount</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light text-gray-900">₹</span>
                  <span className="text-3xl font-medium text-gray-900">{calculateTotal()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes and fees</p>
              </div>
              <div className="text-right">
                <button
                  onClick={handleConfirmBooking}
                  disabled={!verifiedUser || submitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 font-medium flex items-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-end gap-1 mt-2">
                  <Lock size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-400">Secure checkout</p>
                </div>
              </div>
            </div>

            {/* Price breakdown - Google style */}
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-xs text-gray-500">
              <div>
                <span>Test Fee</span>
                <span className="float-right font-medium">₹{bookingData.testPrice?.toFixed(2)}</span>
              </div>
              <div>
                <span>Service Fee</span>
                <span className="float-right font-medium">₹{serviceFee.toFixed(2)}</span>
              </div>
              {bookingData.referralType === 'doctor' && (
                <div>
                  <span className="text-green-600">Discount</span>
                  <span className="float-right font-medium text-green-600">-₹5.00</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Status Modal */}
        {requestStatusOpen && requestStatusDetails && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Booking Request Sent</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                  {requestStatusDetails.status}
                </span>
              </div>
              <div className="px-6 py-5 space-y-3">
                <p className="text-sm text-gray-600">{requestStatusDetails.message}</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                  <div>Booking ID: <span className="font-medium">{requestStatusDetails.bookingId}</span></div>
                  {requestStatusDetails.confirmationNumber && (
                    <div className="mt-1">Confirmation: <span className="font-medium">{requestStatusDetails.confirmationNumber}</span></div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  onClick={handleRequestStatusContinue}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer links - Google style */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600">Terms</a>
          <a href="#" className="hover:text-gray-600">Privacy</a>
          <a href="#" className="hover:text-gray-600">Security</a>
          <a href="#" className="hover:text-gray-600">Help</a>
        </div>
      </main>
    </div>
  );
};

export default PatientInfoPortal;
