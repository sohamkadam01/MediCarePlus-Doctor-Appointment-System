// components/PatientVitalsModal.jsx
import React, { useState } from 'react';
import {
  Heart,
  Thermometer,
  Droplet,
  Activity,
  Scale,
  Coffee,
  AlertCircle,
  X,
  CheckCircle,
  Loader
} from 'lucide-react';
import patientVitalService from '../services/PatientVitalService';

const PatientVitalsModal = ({ isOpen, onClose, appointment, patientId, onSuccess, onSkip, axiosConfig }) => {
  const [vitals, setVitals] = useState({
    systolicBp: '',
    diastolicBp: '',
    heartRate: '',
    spo2: '',
    temperature: '',
    weight: '',
    bloodSugar: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateVitals = () => {
    const validation = patientVitalService.validateVitals({
      systolicBp: vitals.systolicBp ? Number(vitals.systolicBp) : null,
      diastolicBp: vitals.diastolicBp ? Number(vitals.diastolicBp) : null,
      heartRate: vitals.heartRate ? Number(vitals.heartRate) : null,
      spo2: vitals.spo2 ? Number(vitals.spo2) : null,
      temperature: vitals.temperature ? Number(vitals.temperature) : null,
      weight: vitals.weight ? Number(vitals.weight) : null,
      bloodSugar: vitals.bloodSugar ? Number(vitals.bloodSugar) : null
    });

    if (!validation.isValid) {
      const errorMap = {};
      validation.errors.forEach(err => {
        if (err.includes('Systolic')) errorMap.systolicBp = err;
        else if (err.includes('Diastolic')) errorMap.diastolicBp = err;
        else if (err.includes('Heart')) errorMap.heartRate = err;
        else if (err.includes('SpO2')) errorMap.spo2 = err;
        else if (err.includes('Temperature')) errorMap.temperature = err;
        else if (err.includes('Weight')) errorMap.weight = err;
        else if (err.includes('Blood sugar')) errorMap.bloodSugar = err;
      });
      setErrors(errorMap);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setVitals(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateVitals()) return;

    setSubmitting(true);
    try {
      const vitalsData = {
        patientId: patientId,
        recordedAt: new Date().toISOString(),
        systolicBp: vitals.systolicBp ? Number(vitals.systolicBp) : null,
        diastolicBp: vitals.diastolicBp ? Number(vitals.diastolicBp) : null,
        heartRate: vitals.heartRate ? Number(vitals.heartRate) : null,
        spo2: vitals.spo2 ? Number(vitals.spo2) : null,
        temperature: vitals.temperature ? Number(vitals.temperature) : null,
        weight: vitals.weight ? Number(vitals.weight) : null,
        bloodSugar: vitals.bloodSugar ? Number(vitals.bloodSugar) : null,
        notes: vitals.notes || null
      };

      await patientVitalService.saveVitals(vitalsData);
      onSuccess(appointment.id);
      onClose();
    } catch (error) {
      console.error('Error saving vitals:', error);
      setErrors({ 
        submit: error.message || 'Failed to save vitals. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip vitals? You can add them later from the patient records.')) {
      onSkip(appointment.id);
    }
  };

  const getFieldStatus = (value, type) => {
    if (!value) return null;
    
    const numValue = Number(value);
    
    switch(type) {
      case 'bp':
        if (numValue >= 140 || numValue <= 90) return 'border-amber-300 bg-amber-50';
        if (numValue >= 120 || numValue <= 80) return 'border-green-300 bg-green-50';
        return null;
      case 'heartRate':
        if (numValue > 100 || numValue < 60) return 'border-amber-300 bg-amber-50';
        return 'border-green-300 bg-green-50';
      case 'spo2':
        if (numValue < 95) return 'border-amber-300 bg-amber-50';
        return 'border-green-300 bg-green-50';
      case 'temperature':
        if (numValue > 37.5 || numValue < 36) return 'border-amber-300 bg-amber-50';
        return 'border-green-300 bg-green-50';
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-200 p-6 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Record Patient Vitals</h2>
              <p className="text-sm text-gray-500 mt-1">
                {appointment?.patientName} • {new Date(appointment?.appointmentDate).toLocaleDateString()} at {appointment?.appointmentTime}
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
          {/* Info Banner */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Record vital signs before completing appointment</p>
                <p className="text-xs text-blue-600 mt-1">
                  Enter the patient's current vital signs. All fields are optional but recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Vitals Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Blood Pressure */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-rose-50 to-rose-100/30 rounded-xl border border-rose-200">
              <div className="flex items-center gap-2 text-rose-700">
                <Activity size={18} />
                <h3 className="font-medium">Blood Pressure</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Systolic (mmHg)</label>
                  <input
                    type="text"
                    name="systolicBp"
                    value={vitals.systolicBp}
                    onChange={handleChange}
                    placeholder="120"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.systolicBp ? 'border-rose-500' : 
                      getFieldStatus(vitals.systolicBp, 'bp') || 'border-gray-200'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors`}
                  />
                  {errors.systolicBp && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />
                      {errors.systolicBp}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Diastolic (mmHg)</label>
                  <input
                    type="text"
                    name="diastolicBp"
                    value={vitals.diastolicBp}
                    onChange={handleChange}
                    placeholder="80"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.diastolicBp ? 'border-rose-500' : 
                      getFieldStatus(vitals.diastolicBp, 'bp') || 'border-gray-200'
                    } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors`}
                  />
                  {errors.diastolicBp && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} />
                      {errors.diastolicBp}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-red-50 to-red-100/30 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <Heart size={18} />
                <h3 className="font-medium">Heart Rate</h3>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">BPM</label>
                <input
                  type="text"
                  name="heartRate"
                  value={vitals.heartRate}
                  onChange={handleChange}
                  placeholder="72"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.heartRate ? 'border-rose-500' : 
                    getFieldStatus(vitals.heartRate, 'heartRate') || 'border-gray-200'
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors`}
                />
                {errors.heartRate && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} />
                    {errors.heartRate}
                  </p>
                )}
              </div>
            </div>

            {/* SpO2 */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <Droplet size={18} />
                <h3 className="font-medium">Oxygen Saturation</h3>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">SpO2 (%)</label>
                <input
                  type="text"
                  name="spo2"
                  value={vitals.spo2}
                  onChange={handleChange}
                  placeholder="98"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.spo2 ? 'border-rose-500' : 
                    getFieldStatus(vitals.spo2, 'spo2') || 'border-gray-200'
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors`}
                />
                {errors.spo2 && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} />
                    {errors.spo2}
                  </p>
                )}
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 text-amber-700">
                <Thermometer size={18} />
                <h3 className="font-medium">Temperature</h3>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">°Celsius</label>
                <input
                  type="text"
                  name="temperature"
                  value={vitals.temperature}
                  onChange={handleChange}
                  placeholder="36.5"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.temperature ? 'border-rose-500' : 
                    getFieldStatus(vitals.temperature, 'temperature') || 'border-gray-200'
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors`}
                />
                {errors.temperature && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} />
                    {errors.temperature}
                  </p>
                )}
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700">
                <Scale size={18} />
                <h3 className="font-medium">Weight</h3>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Kilograms (kg)</label>
                <input
                  type="text"
                  name="weight"
                  value={vitals.weight}
                  onChange={handleChange}
                  placeholder="70.5"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.weight ? 'border-rose-500' : 'border-gray-200'
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors`}
                />
                {errors.weight && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} />
                    {errors.weight}
                  </p>
                )}
              </div>
            </div>

            {/* Blood Sugar */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 text-purple-700">
                <Coffee size={18} />
                <h3 className="font-medium">Blood Sugar</h3>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">mg/dL</label>
                <input
                  type="text"
                  name="bloodSugar"
                  value={vitals.bloodSugar}
                  onChange={handleChange}
                  placeholder="100"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.bloodSugar ? 'border-rose-500' : 'border-gray-200'
                  } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors`}
                />
                {errors.bloodSugar && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} />
                    {errors.bloodSugar}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              name="notes"
              value={vitals.notes}
              onChange={(e) => setVitals(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Any observations or notes about the patient's condition..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
            />
          </div>

          {errors.submit && (
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              <p className="text-sm text-rose-600">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleSkip}
              disabled={submitting}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              Skip for Now
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm shadow-indigo-200"
            >
              {submitting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Save & Complete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientVitalsModal;