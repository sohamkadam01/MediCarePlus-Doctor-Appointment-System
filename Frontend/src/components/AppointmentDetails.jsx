import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  FileText, 
  Download,
  X,
  Star,
  Phone,
  Mail,
  DollarSign,
  Award,
  Activity,
  AlertCircle,
  CheckCircle,
  Video,
  MessageCircle,
  Printer,
  Navigation,
  ExternalLink
} from 'lucide-react';
import appointmentService from '../services/AppointmentService';

const AppointmentDetails = ({ appointment, isOpen, onClose, onUpdate }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const handleGetDirections = () => {
    const clinicAddress = appointment.doctor?.clinicAddress || appointment.clinicAddress;
    if (!clinicAddress) {
      alert('Clinic address not available');
      return;
    }

    // Encode the address for URL
    const encodedAddress = encodeURIComponent(clinicAddress);
    
    // Open in Google Maps with driving directions
    // You can also use current location as starting point
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}&travelmode=driving`;
    
    // Alternative: Open in Apple Maps on iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const appleMapsUrl = `http://maps.apple.com/?daddr=${encodedAddress}&dirflg=d`;
      window.open(appleMapsUrl, '_blank');
    } else {
      window.open(mapsUrl, '_blank');
    }
  };

  const handleOpenInGoogleMaps = () => {
    const clinicAddress = appointment.doctor?.clinicAddress || appointment.clinicAddress;
    if (!clinicAddress) {
      alert('Clinic address not available');
      return;
    }

    // Open in Google Maps web or app
    const encodedAddress = encodeURIComponent(clinicAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleCallClinic = () => {
    const phone = appointment.doctor?.phone || appointment.clinicPhone;
    if (!phone) {
      alert('Phone number not available');
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleEmailClinic = () => {
    const email = appointment.doctor?.email || appointment.clinicEmail;
    if (!email) {
      alert('Email not available');
      return;
    }
    window.location.href = `mailto:${email}`;
  };

  const handleDownloadPrescription = () => {
    if (!appointment.prescription) {
      alert('No prescription available');
      return;
    }
    // Create a downloadable text version
    const prescriptionText = `
MEDICARE PLUS - PRESCRIPTION
============================
Appointment ID: ${appointment.id}
Date: ${appointment.appointmentDate}
Doctor: Dr. ${appointment.doctor?.name || appointment.doctorName}
Patient: ${appointment.patientName}

PRESCRIPTION:
${appointment.prescription}

${appointment.diagnosis ? `DIAGNOSIS:\n${appointment.diagnosis}\n` : ''}
${appointment.notes ? `NOTES:\n${appointment.notes}\n` : ''}

Generated on: ${new Date().toLocaleString()}
    `;
    
    const blob = new Blob([prescriptionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${appointment.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || submittingReview) return;
    try {
      setSubmittingReview(true);
      setReviewError('');
      await appointmentService.addFeedback(
        appointment.id,
        reviewRating,
        (reviewText || '').trim()
      );
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewText('');
      onUpdate?.(); // Refresh appointments
    } catch (error) {
      const message = error?.response?.data?.error || error?.response?.data?.message || 'Failed to submit review.';
      setReviewError(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const hasReview = () => {
    return (appointment.rating !== null && appointment.rating !== undefined && Number(appointment.rating) >= 1 && Number(appointment.rating) <= 5) ||
           (appointment.feedback && appointment.feedback.trim().length > 0);
  };

  if (!isOpen) return null;

  const statusColors = {
    CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
    COMPLETED: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  };

  const statusColor = statusColors[appointment.status] || statusColors.PENDING;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-6 rounded-t-xl z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Appointment ID: #{appointment.id}
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
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${statusColor}`}>
                {appointment.status || 'PENDING'}
              </div>
              {appointment.visitType && (
                <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
                  <Activity size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-600 capitalize">
                    {appointment.visitType.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>

            {/* Doctor Information Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-sm font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                <Stethoscope size={16} />
                Doctor Information
              </h3>
              
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200">
                    {(appointment.doctor?.name || appointment.doctorName || 'D').charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Dr. {appointment.doctor?.name || appointment.doctorName}
                  </h4>
                  <p className="text-sm text-indigo-600 font-medium">
                    {appointment.specialization || 'General Medicine'}
                  </p>

                  {/* Doctor Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {appointment.doctor?.experience && (
                      <div className="bg-white/80 rounded-lg p-2 text-center">
                        <Award size={14} className="mx-auto text-indigo-500 mb-1" />
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="text-sm font-semibold text-gray-900">{appointment.doctor.experience}y</p>
                      </div>
                    )}
                    
                    {appointment.doctor?.rating && (
                      <div className="bg-white/80 rounded-lg p-2 text-center">
                        <div className="flex justify-center items-center gap-0.5 mb-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              size={10}
                              className={Number(appointment.doctor.rating || 0) >= value
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">Rating</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {Number(appointment.doctor.rating || 0).toFixed(1)}
                        </p>
                      </div>
                    )}

                    <div className="bg-white/80 rounded-lg p-2 text-center">
                      <DollarSign size={14} className="mx-auto text-emerald-500 mb-1" />
                      <p className="text-xs text-gray-500">Fee</p>
                      <p className="text-sm font-semibold text-emerald-700">
                        ₹{appointment.consultationFee || appointment.fee || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    {(appointment.doctor?.phone || appointment.clinicPhone) && (
                      <button
                        onClick={handleCallClinic}
                        className="p-2 bg-white rounded-lg hover:bg-indigo-100 transition-colors"
                        title="Call clinic"
                      >
                        <Phone size={16} className="text-indigo-600" />
                      </button>
                    )}
                    {(appointment.doctor?.email || appointment.clinicEmail) && (
                      <button
                        onClick={handleEmailClinic}
                        className="p-2 bg-white rounded-lg hover:bg-indigo-100 transition-colors"
                        title="Email clinic"
                      >
                        <Mail size={16} className="text-indigo-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card - Enhanced with Directions Button */}
            {(appointment.doctor?.clinicAddress || appointment.clinicAddress) && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl p-6 border border-emerald-200">
                <h3 className="text-sm font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                  <MapPin size={16} />
                  Clinic Location
                </h3>
                
                <div className="space-y-4">
                  {/* Address with Map Preview */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <MapPin size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Clinic Address</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {appointment.doctor?.clinicAddress || appointment.clinicAddress}
                      </p>
                      
                      {/* Additional location details if available */}
                      {appointment.doctor?.landmark && (
                        <p className="text-xs text-gray-500 mt-1">
                          Landmark: {appointment.doctor.landmark}
                        </p>
                      )}
                      {appointment.doctor?.city && appointment.doctor?.state && (
                        <p className="text-xs text-gray-500">
                          {appointment.doctor.city}, {appointment.doctor.state} - {appointment.doctor.pincode || ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Directions Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={handleGetDirections}
                      className="group relative overflow-hidden px-4 py-3 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Navigation size={16} className="group-hover:animate-pulse" />
                      <span>Get Directions</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                    </button>
                    
                    <button
                      onClick={handleOpenInGoogleMaps}
                      className="px-4 py-3 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium rounded-xl hover:bg-emerald-50 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      <span>Open in Maps</span>
                    </button>
                  </div>

                  {/* Distance/Time Estimate (if available) */}
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
                    <Clock size={12} />
                    Estimated travel time may vary based on traffic
                  </p>
                </div>
              </div>
            )}

            {/* Appointment Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  Date
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Clock size={12} />
                  Time
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {appointment.appointmentTime || 'Not specified'}
                </p>
              </div>

              {appointment.reason && (
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <FileText size={12} />
                    Reason for Visit
                  </p>
                  <p className="text-sm text-gray-900">{appointment.reason}</p>
                </div>
              )}

              {appointment.symptoms && (
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Activity size={12} />
                    Symptoms
                  </p>
                  <p className="text-sm text-gray-900">{appointment.symptoms}</p>
                </div>
              )}

              {appointment.diagnosis && (
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Diagnosis</p>
                  <p className="text-sm text-gray-900">{appointment.diagnosis}</p>
                </div>
              )}

              {appointment.prescription && (
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Prescription</p>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{appointment.prescription}</p>
                </div>
              )}

              {appointment.notes && (
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Additional Notes</p>
                  <p className="text-sm text-gray-900">{appointment.notes}</p>
                </div>
              )}
            </div>

            {/* Review Section (for completed appointments) */}
            {appointment.status === 'COMPLETED' && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="text-sm font-medium text-amber-800 mb-2">Your Feedback</h4>
                {hasReview() ? (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={16}
                          className={Number(appointment.rating || 0) >= value
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-amber-300'
                          }
                        />
                      ))}
                    </div>
                    {appointment.feedback && (
                      <p className="text-sm text-gray-700">{appointment.feedback}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
            <div className="flex items-center justify-end gap-3">
              {appointment.prescription && (
                <button
                  onClick={handleDownloadPrescription}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
                >
                  <Download size={16} />
                  Download Prescription
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Review Dr. {appointment.doctor?.name || appointment.doctorName}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Share your experience from this completed appointment.
            </p>

            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setReviewRating(value)}
                  className="p-1 rounded hover:bg-amber-50"
                >
                  <Star
                    size={24}
                    className={reviewRating >= value ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              placeholder="Write your review (optional)"
            />

            {reviewError && (
              <p className="text-sm text-rose-600 mt-2">{reviewError}</p>
            )}

            <div className="mt-5 flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewError('');
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview || reviewRating === 0}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentDetails;