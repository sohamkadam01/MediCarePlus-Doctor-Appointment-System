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
      doctor: {
        id: appointment.doctorId,
        name: appointment.doctorName,
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
          symptoms: appointmentData.symptoms
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
}

export default new AppointmentService();
