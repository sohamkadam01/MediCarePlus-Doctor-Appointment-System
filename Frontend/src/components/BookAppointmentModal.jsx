// components/BookAppointmentModal.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, X, Loader, Star, CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import appointmentService from '../services/AppointmentService';

const BookAppointmentModal = ({ isOpen, onClose, doctor, onSuccess, initialFormData }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [formData, setFormData] = useState({
    reason: '',
    symptoms: ''
  });
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [datesLoading, setDatesLoading] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    setAvailableDates([]);
    setFormData({
      reason: initialFormData?.reason || '',
      symptoms: initialFormData?.symptoms || ''
    });
  }, [isOpen, doctor, initialFormData]);

  useEffect(() => {
    if (selectedDate && doctor) {
      fetchAvailableSlots();
    }
  }, [selectedDate, doctor]);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      if ((!doctor?.id && !doctor?.userId) || !isOpen) return;
      setDatesLoading(true);
      try {
        const doctorId = doctor.userId ?? doctor.id;
        const dates = await appointmentService.getAvailableDates(doctorId);
        setAvailableDates(dates);
        setSelectedDate((prev) => (dates.includes(prev) ? prev : ''));
        setSelectedTime('');
      } catch (error) {
        setAvailableDates([]);
        setSelectedDate('');
        setSelectedTime('');
      } finally {
        setDatesLoading(false);
      }
    };

    fetchAvailableDates();
  }, [doctor, isOpen]);

  useEffect(() => {
    const fetchReviewSummary = async () => {
      if ((!doctor?.id && !doctor?.userId) || !isOpen) {
        setReviewSummary({ averageRating: 0, totalReviews: 0 });
        return;
      }
      setReviewLoading(true);
      try {
        const doctorId = doctor.userId ?? doctor.id;
        const summary = await appointmentService.getDoctorReviewSummary(doctorId);
        setReviewSummary({
          averageRating: Number(summary?.averageRating || 0),
          totalReviews: Number(summary?.totalReviews || 0)
        });
      } catch (error) {
        setReviewSummary({ averageRating: 0, totalReviews: 0 });
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReviewSummary();
  }, [doctor, isOpen]);

  const fetchAvailableSlots = async () => {
    setSlotsLoading(true);
    try {
      const doctorId = doctor.userId ?? doctor.id;
      const slots = await appointmentService.getAvailableSlots(doctorId, selectedDate);
      setAvailableSlots(slots);
      setSelectedTime((prev) => (slots.includes(prev) ? prev : ''));
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSelectedTime('');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      const appointmentData = {
        doctorId: doctor.userId ?? doctor.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: formData.reason,
        symptoms: formData.symptoms,
        notes: initialFormData?.notes || '',
        durationOfSymptoms: initialFormData?.durationOfSymptoms || '',
        severity: initialFormData?.severity || '',
        visitType: initialFormData?.visitType || '',
        bookingSource: initialFormData?.bookingSource || 'NEW',
        parentAppointmentId: initialFormData?.parentAppointmentId || null
      };
      
      const booked = await appointmentService.bookAppointment(appointmentData);
      onSuccess?.(booked);
      onClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header - Google Analytics Style */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Book Appointment</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">with</span>
                <span className="text-sm font-medium text-gray-900">Dr. {doctor?.name}</span>
              </div>
              
              {/* Rating - Google Reviews Style */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      size={14}
                      className={
                        reviewSummary.averageRating >= value
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {reviewSummary.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                  {reviewLoading && (
                    <Loader size={12} className="text-gray-400 animate-spin ml-1" />
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Progress Steps - Google Analytics Style */}
        <div className="px-6 pt-6 pb-2">
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {[
                { num: 1, label: 'Select Time' },
                { num: 2, label: 'Reason' },
                { num: 3, label: 'Confirm' }
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s.num 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? <CheckCircle size={16} /> : s.num}
                  </div>
                  <span className={`text-xs mt-2 ${
                    step >= s.num ? 'text-gray-700 font-medium' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 1: Select Date & Time - Google Calendar Style */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            {/* Date Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Calendar size={16} className="text-gray-400" />
                Select Date
              </label>
              <div className="relative">
                <select
                  className="w-full p-3 border border-gray-200 rounded-lg appearance-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={datesLoading}
                >
                  <option value="">
                    {datesLoading
                      ? 'Loading available dates...'
                      : availableDates.length === 0
                      ? 'No schedule published by doctor'
                      : 'Choose an available date'}
                  </option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight size={16} className="text-gray-400 transform rotate-90" />
                </div>
              </div>
              {availableDates.length === 0 && !datesLoading && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Doctor hasn't published availability for upcoming dates
                </p>
              )}
            </div>

            {/* Time Slots - Google Calendar Style */}
            {selectedDate && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Clock size={16} className="text-gray-400" />
                  Available Time Slots
                </label>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="relative">
                      <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Clock size={14} className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.length === 0 ? (
                      <div className="col-span-3 py-8 text-center">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <AlertCircle size={20} className="text-amber-500" />
                        </div>
                        <p className="text-sm text-gray-600">No available slots for this date</p>
                        <p className="text-xs text-gray-400 mt-1">Please select another date</p>
                      </div>
                    ) : (
                      availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === time
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-200 transform scale-105'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Reason for Visit - Google Forms Style */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Reason for Appointment
              </label>
              <input
                type="text"
                placeholder="e.g., Regular checkup, Fever, Consultation"
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
              <p className="text-xs text-gray-400 mt-1">
                Briefly describe the purpose of your visit
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                Symptoms (Optional)
              </label>
              <textarea
                placeholder="Describe your symptoms in detail. Include when they started, severity, and any triggers..."
                rows="5"
                className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                value={formData.symptoms}
                onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
              />
              <p className="text-xs text-gray-400 flex justify-between">
                <span>Detailed descriptions help doctors prepare better</span>
                <span>{formData.symptoms.length}/500</span>
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation - Google Summary Style */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            {/* Doctor Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                Doctor Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">Dr. {doctor?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Specialization:</span>
                  <span className="text-gray-900">{doctor?.specialization}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Experience:</span>
                  <span className="text-gray-900">{doctor?.experience || 'N/A'} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={12}
                          className={reviewSummary.averageRating >= value ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      ({reviewSummary.totalReviews})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details Card */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                Appointment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-900">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consultation Fee:</span>
                  <span className="font-semibold text-emerald-700">
                    ₹{doctor?.consultationFee ?? doctor?.fee ?? 'N/A'}
                  </span>
                </div>
                {formData.reason && (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <span className="text-gray-600 text-xs block mb-1">Reason:</span>
                    <span className="text-gray-900 text-sm">{formData.reason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">Important Information</p>
                  <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                    <li>Please arrive 10 minutes before your appointment time</li>
                    <li>You'll receive a confirmation email with details</li>
                    <li>For video consultations, a link will be sent before the appointment</li>
                    <li>Cancellations must be made at least 2 hours in advance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions - Google Style */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!selectedDate || !selectedTime)}
                className="flex items-center gap-1 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleBook}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm shadow-emerald-200"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
