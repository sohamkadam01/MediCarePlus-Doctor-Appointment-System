// services/PatientVitalService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class PatientVitalService {
    /**
     * Save patient vitals
     * @param {Object} vitalData - The vital signs data
     * @returns {Promise} - Promise with saved vital data
     */
    async saveVitals(vitalData) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/patient-vitals`, vitalData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error saving vitals:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get all vitals for a patient
     * @param {number} patientId - Patient ID
     * @returns {Promise} - Promise with list of vitals
     */
    async getPatientVitals(patientId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/patient-vitals/patient/${patientId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching patient vitals:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get latest vitals for a patient
     * @param {number} patientId - Patient ID
     * @returns {Promise} - Promise with latest vital data
     */
    async getLatestVitals(patientId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/patient-vitals/patient/${patientId}/latest`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching latest vitals:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get vitals within a date range
     * @param {number} patientId - Patient ID
     * @param {string} startDate - Start date (ISO format)
     * @param {string} endDate - End date (ISO format)
     * @returns {Promise} - Promise with vitals in date range
     */
    async getVitalsByDateRange(patientId, startDate, endDate) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/patient-vitals/patient/${patientId}/range`,
                {
                    params: { startDate, endDate },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching vitals by date range:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Delete a vital record
     * @param {number} vitalId - Vital record ID
     * @returns {Promise} - Promise with deletion response
     */
    async deleteVitals(vitalId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_BASE_URL}/patient-vitals/${vitalId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting vitals:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Format vitals for display
     * @param {Object} vitals - Raw vital data
     * @returns {Object} - Formatted vital data
     */
    formatVitalsForDisplay(vitals) {
        if (!vitals) return null;

        return {
            ...vitals,
            formattedDate: vitals.recordedAt ? new Date(vitals.recordedAt).toLocaleString() : 'N/A',
            bpStatus: this.getBloodPressureStatus(vitals.systolicBp, vitals.diastolicBp),
            heartRateStatus: this.getHeartRateStatus(vitals.heartRate),
            spo2Status: this.getSpO2Status(vitals.spo2),
            temperatureStatus: this.getTemperatureStatus(vitals.temperature),
            bmi: this.calculateBMI(vitals.weight, 170) // You'll need height from patient details
        };
    }

    /**
     * Get blood pressure status
     */
    getBloodPressureStatus(systolic, diastolic) {
        if (!systolic || !diastolic) return null;
        
        if (systolic < 120 && diastolic < 80) {
            return { status: 'Normal', color: 'green', category: 'normal' };
        } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
            return { status: 'Elevated', color: 'yellow', category: 'elevated' };
        } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
            return { status: 'High BP Stage 1', color: 'orange', category: 'stage1' };
        } else if (systolic >= 140 || diastolic >= 90) {
            return { status: 'High BP Stage 2', color: 'red', category: 'stage2' };
        } else if (systolic > 180 || diastolic > 120) {
            return { status: 'Hypertensive Crisis', color: 'darkred', category: 'crisis' };
        }
        
        return null;
    }

    /**
     * Get heart rate status
     */
    getHeartRateStatus(heartRate) {
        if (!heartRate) return null;
        
        if (heartRate >= 60 && heartRate <= 100) {
            return { status: 'Normal', color: 'green', category: 'normal' };
        } else if (heartRate < 60) {
            return { status: 'Bradycardia (Low)', color: 'yellow', category: 'low' };
        } else if (heartRate > 100) {
            return { status: 'Tachycardia (High)', color: 'orange', category: 'high' };
        }
        
        return null;
    }

    /**
     * Get SpO2 status
     */
    getSpO2Status(spo2) {
        if (!spo2) return null;
        
        if (spo2 >= 95) {
            return { status: 'Normal', color: 'green', category: 'normal' };
        } else if (spo2 >= 90 && spo2 <= 94) {
            return { status: 'Mild Hypoxemia', color: 'yellow', category: 'mild' };
        } else {
            return { status: 'Severe Hypoxemia', color: 'red', category: 'severe' };
        }
    }

    /**
     * Get temperature status
     */
    getTemperatureStatus(temp) {
        if (!temp) return null;
        
        if (temp >= 36.1 && temp <= 37.2) {
            return { status: 'Normal', color: 'green', category: 'normal' };
        } else if (temp >= 37.3 && temp <= 38.0) {
            return { status: 'Mild Fever', color: 'yellow', category: 'mild' };
        } else if (temp >= 38.1 && temp <= 39.0) {
            return { status: 'Moderate Fever', color: 'orange', category: 'moderate' };
        } else if (temp > 39.0) {
            return { status: 'High Fever', color: 'red', category: 'high' };
        } else if (temp < 36.1) {
            return { status: 'Low Temperature', color: 'blue', category: 'low' };
        }
        
        return null;
    }

    /**
     * Calculate BMI
     */
    calculateBMI(weightKg, heightCm) {
        if (!weightKg || !heightCm) return null;
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        return {
            value: bmi.toFixed(1),
            category: this.getBMICategory(bmi)
        };
    }

    /**
     * Get BMI category
     */
    getBMICategory(bmi) {
        if (bmi < 18.5) return { status: 'Underweight', color: 'blue' };
        if (bmi >= 18.5 && bmi < 25) return { status: 'Normal', color: 'green' };
        if (bmi >= 25 && bmi < 30) return { status: 'Overweight', color: 'yellow' };
        if (bmi >= 30) return { status: 'Obese', color: 'orange' };
        return null;
    }

    /**
     * Handle API errors
     */
    handleError(error) {
        if (error.response) {
            const message = error.response.data?.error || 
                           error.response.data?.message || 
                           `Server error: ${error.response.status}`;
            return new Error(message);
        } else if (error.request) {
            return new Error('No response from server. Please check your connection.');
        } else {
            return new Error(error.message || 'An unexpected error occurred');
        }
    }

    /**
     * Validate vitals before sending
     */
    validateVitals(vitals) {
        const errors = [];

        if (vitals.systolicBp || vitals.diastolicBp) {
            if (!vitals.systolicBp) errors.push('Systolic BP is required with diastolic');
            if (!vitals.diastolicBp) errors.push('Diastolic BP is required with systolic');
            
            if (vitals.systolicBp && (vitals.systolicBp < 70 || vitals.systolicBp > 250)) {
                errors.push('Systolic BP must be between 70-250 mmHg');
            }
            if (vitals.diastolicBp && (vitals.diastolicBp < 40 || vitals.diastolicBp > 150)) {
                errors.push('Diastolic BP must be between 40-150 mmHg');
            }
        }

        if (vitals.heartRate && (vitals.heartRate < 30 || vitals.heartRate > 250)) {
            errors.push('Heart rate must be between 30-250 bpm');
        }

        if (vitals.spo2 && (vitals.spo2 < 50 || vitals.spo2 > 100)) {
            errors.push('SpO2 must be between 50-100%');
        }

        if (vitals.temperature && (vitals.temperature < 30 || vitals.temperature > 45)) {
            errors.push('Temperature must be between 30-45°C');
        }

        if (vitals.weight && (vitals.weight < 1 || vitals.weight > 300)) {
            errors.push('Weight must be between 1-300 kg');
        }

        if (vitals.bloodSugar && (vitals.bloodSugar < 20 || vitals.bloodSugar > 600)) {
            errors.push('Blood sugar must be between 20-600 mg/dL');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

const patientVitalService = new PatientVitalService();
export default patientVitalService;