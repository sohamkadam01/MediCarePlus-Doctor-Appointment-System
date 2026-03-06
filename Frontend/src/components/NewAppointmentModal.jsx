// NewAppointmentModal.jsx (Updated)
import React, { useEffect, useMemo, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Loader, 
  User, 
  X, 
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Printer,
  Download,
  Heart,
  Activity,
  Thermometer,
  Pill,
  AlertTriangle,
  Info,
  Shield,
  Mail,
  Phone,
  Droplet,
  Award,
  Star,
  UserRound,
  Stethoscope,
  MapPin,
  DollarSign,
  TrendingUp,
  Search,
  Navigation
} from 'lucide-react';
import appointmentService from '../services/AppointmentService';
// import doctorService from '../services/DoctorService'; // You'll need to create this

const NewAppointmentModal = ({ isOpen, onClose, onSuccess, doctors = [], patient, patientDetails }) => {
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [datesLoading, setDatesLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [selectedDoctorReviewSummary, setSelectedDoctorReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0
  });
  const [selectedDoctorReviewLoading, setSelectedDoctorReviewLoading] = useState(false);
  
  // Location search state
  const [locationSearch, setLocationSearch] = useState({
    city: '',
    state: ''
  });
  const [showLocationSearch, setShowLocationSearch] = useState(true);

  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    symptoms: '',
    severity: '',
    durationOfSymptoms: '',
    notes: ''
  });

  const selectedDoctor = useMemo(
    () =>
      availableDoctors.find(
        (d) => String(d.userId ?? d.id) === String(formData.doctorId)
      ),
    [availableDoctors, formData.doctorId]
  );

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) return;
    setReceipt(null);
    setAvailableSlots([]);
    setAvailableDates([]);
    setAvailableDoctors([]);
    setCurrentStep(1);
    setShowLocationSearch(true);
    setErrors({});
    setLocationSearch({ city: '', state: '' });
    setFormData({
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      symptoms: '',
      severity: '',
      durationOfSymptoms: '',
      notes: ''
    });
  }, [isOpen]);

  useEffect(() => {
    const fetchSelectedDoctorReviews = async () => {
      if (!isOpen || !selectedDoctor?.id) {
        setSelectedDoctorReviewSummary({ averageRating: 0, totalReviews: 0 });
        return;
      }

      setSelectedDoctorReviewLoading(true);
      try {
        const doctorId = selectedDoctor.userId ?? selectedDoctor.id;
        const summary = await appointmentService.getDoctorReviewSummary(doctorId);
        setSelectedDoctorReviewSummary({
          averageRating: Number(summary?.averageRating || 0),
          totalReviews: Number(summary?.totalReviews || 0)
        });
      } catch (error) {
        console.error('Error fetching doctor review:', error);
        setSelectedDoctorReviewSummary({ averageRating: 0, totalReviews: 0 });
      } finally {
        setSelectedDoctorReviewLoading(false);
      }
    };

    fetchSelectedDoctorReviews();
  }, [isOpen, selectedDoctor]);

  // Fetch available dates when doctor is selected
  useEffect(() => {
    const fetchDates = async () => {
      if (!formData.doctorId) {
        setAvailableDates([]);
        setFormData((prev) => ({ ...prev, appointmentDate: '', appointmentTime: '' }));
        return;
      }

      setDatesLoading(true);
      try {
        const dates = await appointmentService.getAvailableDates(
          formData.doctorId, 
          null,
          30
        );
        setAvailableDates(dates);
        setFormData((prev) => ({
          ...prev,
          appointmentDate: dates.includes(prev.appointmentDate) ? prev.appointmentDate : '',
          appointmentTime: ''
        }));
      } catch (error) {
        console.error('Error fetching dates:', error);
        setAvailableDates([]);
      } finally {
        setDatesLoading(false);
      }
    };

    fetchDates();
  }, [formData.doctorId]);

  // Fetch available slots when date is selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.doctorId || !formData.appointmentDate) return;
      setSlotsLoading(true);
      try {
        const slots = await appointmentService.getAvailableSlots(formData.doctorId, formData.appointmentDate);
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error fetching slots:', error);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [formData.doctorId, formData.appointmentDate]);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationSearch(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSearchDoctors = async (e) => {
    e.preventDefault();
    
    // Validate location
    const newErrors = {};
    if (!locationSearch.city.trim()) newErrors.city = 'Please enter city';
    if (!locationSearch.state.trim()) newErrors.state = 'Please enter state';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setDoctorsLoading(true);
    try {
      // Call your API to search doctors by location
      const response = await fetch(
        `http://localhost:8080/api/doctors/search?city=${encodeURIComponent(locationSearch.city)}&state=${encodeURIComponent(locationSearch.state)}`
      );
      const data = await response.json();
      setAvailableDoctors(data);
      setShowLocationSearch(false);
    } catch (error) {
      console.error('Error searching doctors:', error);
      setErrors({ search: 'Failed to search doctors. Please try again.' });
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'appointmentDate' ? { appointmentTime: '' } : {}),
      ...(name === 'doctorId' ? { appointmentDate: '', appointmentTime: '' } : {})
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBackToLocation = () => {
    setShowLocationSearch(true);
    setFormData(prev => ({ ...prev, doctorId: '' }));
    setCurrentStep(1);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
    } else if (step === 2) {
      if (!formData.appointmentDate) newErrors.appointmentDate = 'Please select a date';
      if (!formData.appointmentTime) newErrors.appointmentTime = 'Please select a time slot';
    } else if (step === 3) {
      if (!formData.reason.trim()) newErrors.reason = 'Please provide a reason for visit';
      if (!formData.symptoms.trim()) newErrors.symptoms = 'Please describe your symptoms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1 && !showLocationSearch) {
      setShowLocationSearch(true);
      setFormData(prev => ({ ...prev, doctorId: '' }));
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBook = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    try {
      const bookingPayload = {
        doctorId: Number(formData.doctorId),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        symptoms: formData.symptoms,
        severity: formData.severity || '',
        durationOfSymptoms: formData.durationOfSymptoms || '',
        notes: formData.notes || '',
        visitType: 'NEW',
        bookingSource: 'NEW'
      };

      const booked = await appointmentService.bookAppointment(bookingPayload);
      const receiptData = {
        receiptNo: `MCP-${booked.id}-${Date.now().toString().slice(-5)}`,
        generatedAt: new Date().toLocaleString(),
        appointmentId: booked.id,
        patientName: patient?.name || booked.patientName,
        patientEmail: patient?.email || '-',
        patientAge: patientDetails?.age ?? '-',
        patientGender: patientDetails?.gender ?? '-',
        patientBloodGroup: patientDetails?.bloodGroup ?? '-',
        patientAllergies: patientDetails?.allergies || 'None',
        doctorName: booked.doctorName,
        specialization: booked.specialization,
        appointmentDate: booked.appointmentDate,
        appointmentTime: booked.appointmentTime,
        reason: booked.reason,
        symptoms: booked.symptoms,
        fee: booked.consultationFee
      };
      setReceipt(receiptData);
      onSuccess?.(booked, receiptData);
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptText = `
MEDICARE PLUS - APPOINTMENT RECEIPT
====================================
Receipt No: ${receipt.receiptNo}
Generated: ${receipt.generatedAt}
Appointment ID: ${receipt.appointmentId}

PATIENT DETAILS
--------------
Name: ${receipt.patientName}
Email: ${receipt.patientEmail}
Age/Gender: ${receipt.patientAge} / ${receipt.patientGender}
Blood Group: ${receipt.patientBloodGroup}
Allergies: ${receipt.patientAllergies}

DOCTOR DETAILS
-------------
Doctor: Dr. ${receipt.doctorName}
Specialization: ${receipt.specialization}

APPOINTMENT DETAILS
------------------
Date: ${receipt.appointmentDate}
Time: ${receipt.appointmentTime}
Reason: ${receipt.reason}
Symptoms: ${receipt.symptoms}
Consultation Fee: INR ${receipt.fee ?? 'N/A'}

Thank you for choosing Medicare Plus!
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.receiptNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

 const renderLocationSearch = () => (
  <div className="space-y-6 animate-fadeIn">
    {/* Header - Google Maps Style */}
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-3">
        <MapPin size={12} className="text-blue-600" />
        <span className="text-[10px] font-medium text-blue-700">Location search</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Find doctors near you</h3>
      <p className="text-xs text-gray-500">Enter your location to find available doctors</p>
    </div>

    <form onSubmit={handleSearchDoctors} className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
      {/* City Input */}
      <div>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="city"
            value={locationSearch.city}
            onChange={handleLocationChange}
            placeholder="City"
            className={`w-full pl-9 pr-4 py-3 text-sm border ${errors.city ? 'border-rose-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white`}
          />
        </div>
        {errors.city && (
          <p className="text-[10px] text-rose-600 mt-1 ml-2">{errors.city}</p>
        )}
      </div>

      {/* State Input */}
      <div>
        <div className="relative">
          <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="state"
            value={locationSearch.state}
            onChange={handleLocationChange}
            placeholder="State"
            className={`w-full pl-9 pr-4 py-3 text-sm border ${errors.state ? 'border-rose-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-white`}
          />
        </div>
        {errors.state && (
          <p className="text-[10px] text-rose-600 mt-1 ml-2">{errors.state}</p>
        )}
      </div>

      {errors.search && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
          <p className="text-xs text-rose-600 flex items-center gap-2">
            <AlertCircle size={14} />
            {errors.search}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={doctorsLoading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {doctorsLoading ? (
          <>
            <Loader size={14} className="animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search size={14} />
            Search
          </>
        )}
      </button>
    </form>
  </div>
);
  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Location Info Bar */}
      <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-indigo-600" />
          <span className="text-indigo-700">
            Showing doctors in <span className="font-semibold">{locationSearch.city}, {locationSearch.state}</span>
          </span>
        </div>
        <button
          onClick={handleBackToLocation}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Change Location
        </button>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Select Doctor</h3>
        <p className="text-sm text-gray-500">Choose a specialist near you</p>
      </div>

      {/* Doctor Selection */}
      <div className="space-y-4">
        <div className="relative">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <UserRound size={16} className="text-indigo-500" />
            Choose Doctor <span className="text-rose-500">*</span>
          </label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className={`w-full p-4 border ${errors.doctorId ? 'border-rose-500' : 'border-gray-200'} rounded-xl bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none`}
          >
            <option value="">
              {availableDoctors.length === 0 ? 'No doctors found in your area' : 'Select a doctor'}
            </option>
            {availableDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.userId ?? doctor.id}>
                Dr. {doctor.name} - {doctor.specializationName} ({doctor.experienceYear} years)
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-12 pointer-events-none">
            <ChevronRight size={16} className="text-gray-400 transform rotate-90" />
          </div>
          {errors.doctorId && (
            <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.doctorId}
            </p>
          )}
        </div>

        {/* Selected Doctor Preview */}
        {selectedDoctor && (
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/30 rounded-xl border border-indigo-200 animate-slideDown">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200">
                  {selectedDoctor.name?.charAt(0)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>

              {/* Doctor Info */}
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">Dr. {selectedDoctor.name}</h4>
                <p className="text-sm text-indigo-600 font-medium">{selectedDoctor.specializationName}</p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="bg-white/80 rounded-lg p-2 text-center">
                    <Award size={14} className="mx-auto text-indigo-500 mb-1" />
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedDoctor.experienceYear || 'N/A'}y</p>
                  </div>
                  
                  <div className="bg-white/80 rounded-lg p-2 text-center">
                    <div className="flex justify-center items-center gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={10}
                          className={
                            Number(selectedDoctorReviewSummary.averageRating || 0) >= value
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedDoctorReviewLoading
                        ? '...'
                        : `${Number(selectedDoctorReviewSummary.averageRating || 0).toFixed(1)}`}
                      <span className="text-xs text-gray-400 ml-1">
                        ({selectedDoctorReviewSummary.totalReviews})
                      </span>
                    </p>
                  </div>

                  <div className="bg-white/80 rounded-lg p-2 text-center">
                    <DollarSign size={14} className="mx-auto text-emerald-500 mb-1" />
                    <p className="text-xs text-gray-500">Fee</p>
                    <p className="text-sm font-semibold text-emerald-700">
                      ₹{selectedDoctor.consultationFee ?? 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {selectedDoctor.clinicAddress && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-gray-600 bg-white/50 rounded-lg p-2">
                    <MapPin size={12} className="text-gray-400 mt-0.5" />
                    <span>{selectedDoctor.clinicAddress}</span>
                  </div>
                )}

                {/* Availability */}
                {selectedDoctor.availabilityStartTime && selectedDoctor.availabilityEndTime && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <Clock size={12} className="text-gray-400" />
                    <span>Available: {selectedDoctor.availabilityStartTime} - {selectedDoctor.availabilityEndTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {availableDoctors.length === 0 && !doctorsLoading && (
          <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">No doctors found in {locationSearch.city}</p>
                <p className="text-xs text-amber-700 mt-1">
                  Try searching in a different location or adjust your search criteria.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Location Info Bar (compact) */}
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-xs">
          <MapPin size={12} className="text-gray-500" />
          <span className="text-gray-600">
            {locationSearch.city}, {locationSearch.state}
          </span>
        </div>
        <button
          onClick={handleBackToLocation}
          className="text-xs text-indigo-600 hover:text-indigo-800"
        >
          Change
        </button>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Select Date & Time</h3>
        <p className="text-sm text-gray-500">Choose your preferred appointment slot</p>
      </div>

      {/* Date Selection */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <Calendar size={16} className="text-indigo-500" />
          Available Dates <span className="text-rose-500">*</span>
        </label>
        {datesLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-indigo-600">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar size={14} className="text-indigo-600" />
              </div>
            </div>
            <span className="text-sm">Loading available dates...</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {availableDates.map((date) => {
              const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, appointmentDate: date }))}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    formData.appointmentDate === date
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <span className="text-xs block opacity-80">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-base font-semibold">
                    {new Date(date).getDate()}
                  </span>
                  <span className="text-xs block opacity-80">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {errors.appointmentDate && (
          <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.appointmentDate}
          </p>
        )}
        {!datesLoading && formData.doctorId && availableDates.length === 0 && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mt-3">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-amber-600" />
              <p className="text-sm text-amber-700">
                No available dates for this doctor
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Time Slots */}
      {formData.appointmentDate && (
        <div className="mt-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Clock size={16} className="text-indigo-500" />
            Available Time Slots <span className="text-rose-500">*</span>
          </label>
          {slotsLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-indigo-600">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock size={14} className="text-indigo-600" />
                </div>
              </div>
              <span className="text-sm">Loading slots...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, appointmentTime: slot }))}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      formData.appointmentTime === slot
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <Clock size={16} className="mx-auto mb-1" />
                    <span className="text-sm font-medium">{slot}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-full p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle size={20} className="text-amber-500" />
                  </div>
                  <p className="text-sm text-gray-600">No available slots for this date</p>
                  <p className="text-xs text-gray-400 mt-1">Please select another date</p>
                </div>
              )}
            </div>
          )}
          {errors.appointmentTime && (
            <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.appointmentTime}
            </p>
          )}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
        <p className="text-sm text-gray-500">Tell us about your health concern</p>
      </div>

      {/* Location Info Bar (compact) */}
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-xs">
          <MapPin size={12} className="text-gray-500" />
          <span className="text-gray-600">
            {locationSearch.city}, {locationSearch.state}
          </span>
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
          Reason for Visit <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="e.g., Fever, Headache, Check-up"
          className={`w-full p-4 border ${errors.reason ? 'border-rose-500' : 'border-gray-200'} rounded-xl bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all`}
        />
        {errors.reason && (
          <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.reason}
          </p>
        )}
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
          Symptoms <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="symptoms"
          value={formData.symptoms}
          onChange={handleChange}
          rows={4}
          placeholder="Describe your symptoms in detail. Include when they started, severity, and any triggers..."
          className={`w-full p-4 border ${errors.symptoms ? 'border-rose-500' : 'border-gray-200'} rounded-xl bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none`}
        />
        {errors.symptoms && (
          <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.symptoms}
          </p>
        )}
        <p className="text-xs text-gray-400 text-right">
          {formData.symptoms.length}/500 characters
        </p>
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Activity size={14} className="text-gray-400" />
            Severity
          </label>
          <div className="relative">
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none"
            >
              <option value="">Select severity</option>
              <option value="MILD">Mild</option>
              <option value="MODERATE">Moderate</option>
              <option value="SEVERE">Severe</option>
            </select>
            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transform rotate-90" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock size={14} className="text-gray-400" />
            Duration
          </label>
          <input
            type="text"
            name="durationOfSymptoms"
            value={formData.durationOfSymptoms}
            onChange={handleChange}
            placeholder="e.g., 3 days, 2 weeks"
            className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FileText size={14} className="text-gray-400" />
          Additional Notes
        </label>
        <input
          type="text"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any other information for the doctor (optional)"
          className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>

      {/* Summary Preview */}
      {selectedDoctor && formData.appointmentDate && formData.appointmentTime && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Info size={12} />
            Appointment Summary
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Doctor:</span>
              <span className="ml-2 font-medium text-gray-900">Dr. {selectedDoctor.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(formData.appointmentDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Time:</span>
              <span className="ml-2 font-medium text-gray-900">{formData.appointmentTime}</span>
            </div>
            <div>
              <span className="text-gray-500">Fee:</span>
              <span className="ml-2 font-medium text-emerald-700">
                ₹{selectedDoctor.consultationFee ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReceipt = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Success Message */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-6 border border-emerald-200">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <span className="text-[10px] text-emerald-600 font-bold">✓</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-emerald-800">Appointment Request Submitted</h3>
            <p className="text-sm text-emerald-700 mt-1">
              Your appointment is pending doctor approval. You'll be notified once confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* Receipt Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">Medicare Plus</span>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full">Appointment Receipt</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-indigo-100 text-xs">Receipt No</p>
              <p className="font-semibold">{receipt.receiptNo}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs">Generated</p>
              <p className="font-semibold">{receipt.generatedAt}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs">Appointment ID</p>
              <p className="font-semibold">{receipt.appointmentId}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs">Status</p>
              <p className="font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                Pending Approval
              </p>
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={16} className="text-indigo-500" />
            Patient Details
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-medium text-gray-900">{receipt.patientName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{receipt.patientEmail}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Age/Gender</p>
              <p className="text-sm font-medium text-gray-900">{receipt.patientAge} / {receipt.patientGender}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Blood Group</p>
              <p className="text-sm font-medium text-gray-900">{receipt.patientBloodGroup}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Allergies</p>
              <p className="text-sm font-medium text-gray-900">{receipt.patientAllergies}</p>
            </div>
          </div>
        </div>

        {/* Doctor Details */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope size={16} className="text-indigo-500" />
            Doctor Details
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-medium text-gray-900">Dr. {receipt.doctorName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Specialization</p>
              <p className="text-sm font-medium text-gray-900">{receipt.specialization}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Consultation Fee</p>
              <p className="text-sm font-bold text-emerald-700">₹{receipt.fee ?? 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-indigo-500" />
            Appointment Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-900">{receipt.appointmentDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-sm font-medium text-gray-900">{receipt.appointmentTime}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Reason</p>
              <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">{receipt.reason}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Symptoms</p>
              <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded-lg">{receipt.symptoms}</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Info size={12} />
            This is a system-generated receipt. No signature required.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
        >
          <Printer size={16} />
          Print
        </button>
        <button
          onClick={handleDownload}
          className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
        >
          <Download size={16} />
          Download
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          Done
          <CheckCircle size={16} />
        </button>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="relative mb-8">
      {/* Progress Bar */}
      <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full">
        <div 
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>
      
      {/* Step Indicators */}
      <div className="relative flex justify-between">
        {[
          { num: 1, label: 'Select Doctor', icon: UserRound },
          { num: 2, label: 'Date & Time', icon: Calendar },
          { num: 3, label: 'Details', icon: FileText }
        ].map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                currentStep >= step.num 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.num ? <CheckCircle size={16} /> : step.num}
              </div>
              <span className={`text-xs mt-2 ${
                currentStep >= step.num ? 'text-gray-700 font-medium' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {receipt ? 'Appointment Receipt' : 'Book New Appointment'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {receipt
                  ? 'Status: Pending doctor approval'
                  : 'Find and book an appointment with a doctor near you'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!receipt ? (
            <>
              {showLocationSearch ? (
                renderLocationSearch()
              ) : (
                <>
                  {/* Step Indicator */}
                  {renderStepIndicator()}

                  {/* Step Content */}
                  <div className="mt-6">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleBack}
                      className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      Back
                    </button>
                    
                    {currentStep < 3 ? (
                      <button
                        onClick={handleNext}
                        disabled={currentStep === 1 && !formData.doctorId}
                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
                      >
                        Continue
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={handleBook}
                        disabled={
                          loading ||
                          !formData.doctorId ||
                          !formData.appointmentDate ||
                          !formData.appointmentTime ||
                          !formData.reason.trim() ||
                          !formData.symptoms.trim()
                        }
                        className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-200"
                      >
                        {loading ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Booking...
                          </>
                        ) : (
                          <>
                            Confirm Booking
                            <CheckCircle size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            renderReceipt()
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
