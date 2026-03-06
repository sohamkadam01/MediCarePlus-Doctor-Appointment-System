// services/AppointmentService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class AppointmentService {
  getAxiosConfig() {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  }

  normalizeAppointment(appointment) {
  return {
    ...appointment,
    appointmentType: appointment.appointmentType || 'DOCTOR',
    doctor: {
      id: appointment.doctorId,
      name: appointment.doctorName,
      clinicAddress: appointment.doctor?.doctorDetails?.clinicAddress, // ADD THIS LINE
      doctorDetails: {
        specialization: appointment.specialization
      }
    },
    patient: {
      id: appointment.patientId,
      name: appointment.patientName
    }
  };
}

  normalizeLabAppointment(appointment) {
    return {
      id: `LAB-${appointment.id}`,
      appointmentType: 'LAB',
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime || 'TBD',
      status: appointment.status || 'PENDING',
      labId: appointment.labId,
      labName: appointment.labName,
      labEmail: appointment.labEmail,
      labPhone: appointment.labPhone,
      labAddress: appointment.labAddress,
      labCity: appointment.labCity,
      labState: appointment.labState,
      labPincode: appointment.labPincode,
      testName: appointment.testName,
      testPrice: appointment.testPrice,
      referralType: appointment.referralType,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      bookingSource: appointment.bookingSource,
      doctorName: appointment.labName,
      specialization: appointment.testName || 'Lab Test',
      clinicAddress: appointment.labAddress || '',
      visitType: 'LAB_TEST',
      consultationFee: appointment.testPrice,
      fee: appointment.testPrice,
      reason: appointment.testName || 'Lab Test'
    };
  }

  normalizeSlots(slots) {
    return (slots || []).map((slot) => String(slot).slice(0, 5));
  }

  // Get all appointments for patient
  async getMyAppointments() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/patient`,
        this.getAxiosConfig()
      );
      return (response.data || []).map((appointment) => this.normalizeAppointment(appointment));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  // Get upcoming appointments
  async getUpcomingAppointments() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/patient/upcoming`,
        this.getAxiosConfig()
      );
      return (response.data || []).map((appointment) => this.normalizeAppointment(appointment));
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }

  // Get past appointments
  async getPastAppointments() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/patient/past`,
        this.getAxiosConfig()
      );
      return (response.data || []).map((appointment) => this.normalizeAppointment(appointment));
    } catch (error) {
      console.error('Error fetching past appointments:', error);
      throw error;
    }
  }

  async getPatientLabAppointments() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/patient/lab`,
        this.getAxiosConfig()
      );
      return (response.data || []).map((appointment) => this.normalizeLabAppointment(appointment));
    } catch (error) {
      console.error('Error fetching lab appointments:', error);
      throw error;
    }
  }

  // Book new appointment
  async bookAppointment(appointmentData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments/book`,
        {
          doctorId: appointmentData.doctorId,
          appointmentDate: appointmentData.appointmentDate,
          appointmentTime: appointmentData.appointmentTime,
          reason: appointmentData.reason,
          symptoms: appointmentData.symptoms,
          notes: appointmentData.notes,
          durationOfSymptoms: appointmentData.durationOfSymptoms,
          severity: appointmentData.severity,
          visitType: appointmentData.visitType,
          bookingSource: appointmentData.bookingSource,
          parentAppointmentId: appointmentData.parentAppointmentId
        },
        this.getAxiosConfig()
      );
      return this.normalizeAppointment(response.data);
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId, reason) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
        { reason },
        this.getAxiosConfig()
      );
      return this.normalizeAppointment(response.data);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  async cancelLabAppointment(appointmentId) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/patient/lab/${appointmentId}/cancel`,
        {},
        this.getAxiosConfig()
      );
      return this.normalizeLabAppointment(response.data);
    } catch (error) {
      console.error('Error cancelling lab appointment:', error);
      throw error;
    }
  }

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, newDate, newTime) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/reschedule`,
        { newDate, newTime },
        this.getAxiosConfig()
      );
      return this.normalizeAppointment(response.data);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  // Get appointment details
  async getAppointmentById(appointmentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/${appointmentId}`,
        this.getAxiosConfig()
      );
      return this.normalizeAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  }

  // Get available slots for doctor
  async getAvailableSlots(doctorId, date) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/available-slots?doctorId=${doctorId}&date=${date}`,
        this.getAxiosConfig()
      );
      return this.normalizeSlots(response.data);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  }

  // Get available dates for doctor (next N days)
  async getAvailableDates(doctorId, fromDate, days = 30) {
    try {
      const start = fromDate || new Date().toISOString().split('T')[0];
      const response = await axios.get(
        `${API_BASE_URL}/appointments/available-dates?doctorId=${doctorId}&fromDate=${start}&days=${days}`,
        this.getAxiosConfig()
      );
      return (response.data || []).map((d) => String(d));
    } catch (error) {
      console.error('Error fetching available dates:', error);
      throw error;
    }
  }

  // Add feedback/rating after appointment
  async addFeedback(appointmentId, rating, feedback) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments/${appointmentId}/feedback`,
        { rating, feedback },
        this.getAxiosConfig()
      );
      return this.normalizeAppointment(response.data);
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  }

  async getDoctorReviews(doctorId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctors/${doctorId}/reviews`,
        this.getAxiosConfig()
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching doctor reviews:', error);
      throw error;
    }
  }

  async getDoctorReviewSummary(doctorId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctors/${doctorId}/reviews/summary`,
        this.getAxiosConfig()
      );
      return response.data || { doctorId, averageRating: 0, totalReviews: 0 };
    } catch (error) {
      console.error('Error fetching doctor review summary:', error);
      throw error;
    }
  }

  // Complete appointment (doctor)
  async completeAppointment(appointmentId) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/complete`,
        {},
        this.getAxiosConfig()
      );
      return this.normalizeAppointment(response.data);
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  }
}

export default new AppointmentService();
