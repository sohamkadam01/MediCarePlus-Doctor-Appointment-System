const API_BASE_URL = 'http://localhost:8080/api';

const LabEnrollmentService = {
  async submitEnrollment(formData) {
    const response = await fetch(`${API_BASE_URL}/lab-enrollments`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to submit enrollment');
    }

    return response.json();
  },
};

export default LabEnrollmentService;
