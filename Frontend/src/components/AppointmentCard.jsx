// components/AppointmentCard.jsx
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  FileText, 
  Star,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock as PendingIcon,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import appointmentService from '../services/AppointmentService';

const AppointmentCard = ({ appointment, type, onUpdate, onRebook }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusBadge = () => {
    switch(appointment.status) {
      case 'CONFIRMED':
        return <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
          <CheckCircle size={12} /> Confirmed
        </span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
          <PendingIcon size={12} /> Not Accepted
        </span>;
      case 'COMPLETED':
        return <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
          <CheckCircle size={12} /> Completed
        </span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
          <XCircle size={12} /> Cancelled
        </span>;
      default:
        return null;
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await appointmentService.cancelAppointment(appointment.id, cancelReason);
      onUpdate();
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    setLoading(true);
    try {
      await appointmentService.rescheduleAppointment(appointment.id, newDate, newTime);
      onUpdate();
      setShowRescheduleModal(false);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async () => {
    setLoading(true);
    try {
      await appointmentService.addFeedback(appointment.id, rating, feedback);
      onUpdate();
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error adding feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {appointment.doctor?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Dr. {appointment.doctor?.name}</h3>
                <p className="text-sm text-blue-600">{appointment.doctor?.doctorDetails?.specialization}</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Appointment Details */}
          <div className="space-y-2 mb-3">
            {appointment.status === 'CONFIRMED' && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                <CheckCircle size={14} />
                <span>Your appointment is accepted by doctor.</span>
              </div>
            )}
            {appointment.status === 'PENDING' && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                <PendingIcon size={14} />
                <span>Your appointment is not accepted yet. Waiting for doctor approval.</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} className="text-gray-400" />
              <span>{formatDate(appointment.appointmentDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-gray-400" />
              <span>{formatTime(appointment.appointmentTime)} - {formatTime(appointment.endTime)}</span>
            </div>
            {appointment.reason && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <AlertCircle size={16} className="text-gray-400 mt-0.5" />
                <span>{appointment.reason}</span>
              </div>
            )}
            {appointment.consultationFee && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign size={16} className="text-gray-400" />
                <span>₹{appointment.consultationFee}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {type === 'upcoming' && appointment.status !== 'CANCELLED' && (
              <>
                {appointment.videoLink && (
                  <a
                    href={appointment.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors"
                  >
                    <Video size={16} />
                    Join
                  </a>
                )}
                <button
                  onClick={() => setShowRescheduleModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                >
                  <Clock size={16} />
                  Reschedule
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              </>
            )}
            
            {type === 'past' && appointment.status === 'COMPLETED' && !appointment.feedback && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm hover:bg-purple-100 transition-colors"
              >
                <Star size={16} />
                Rate & Review
              </button>
            )}

            {type === 'past' && typeof onRebook === 'function' && (
              <button
                onClick={() => onRebook(appointment)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
              >
                <Clock size={16} />
                Book Again
              </button>
            )}

            {appointment.prescription && (
              <button
                onClick={() => window.open(`/prescription/${appointment.id}`, '_blank')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors ml-auto"
              >
                <FileText size={16} />
                Prescription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your appointment with Dr. {appointment.doctor?.name}?
            </p>
            <textarea
              placeholder="Reason for cancellation (optional)"
              className="w-full p-3 border border-gray-200 rounded-lg mb-4"
              rows="3"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200"
              >
                No, Keep it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Reschedule Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                <input
                  type="time"
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReschedule}
                  disabled={loading || !newDate || !newTime}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Reschedule'}
                </button>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Rate Your Experience</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg transition-colors ${
                        rating >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                <textarea
                  placeholder="Share your experience with Dr. {appointment.doctor?.name}"
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  rows="4"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleFeedback}
                  disabled={loading || rating === 0}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentCard;
