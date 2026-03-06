import axiosInstance from './axiosConfig';

class ChatService {
  async askPatientAssistant(message) {
    const response = await axiosInstance.post('/chat/patient/assistant', { message });
    return response.data;
  }

  async askDoctorAssistant(message) {
    const response = await axiosInstance.post('/chat/doctor/assistant', { message });
    return response.data;
  }
}

export default new ChatService();
