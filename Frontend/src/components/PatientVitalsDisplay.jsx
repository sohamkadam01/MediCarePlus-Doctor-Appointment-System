// components/PatientVitalsDisplay.jsx
import React from 'react';
import {
  Heart,
  Thermometer,
  Droplet,
  Activity,
  Scale,
  Coffee,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertCircle
} from 'lucide-react';

const PatientVitalsDisplay = ({ vitals, onViewHistory, detailed = false }) => {
  if (!vitals || vitals.length === 0) return null;

  const latestVitals = vitals[0];
  const previousVitals = vitals.length > 1 ? vitals[1] : null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrendIcon = (current, previous) => {
    if (!previous || !current) return <Minus size={14} className="text-gray-400" />;
    if (current > previous) return <TrendingUp size={14} className="text-rose-500" />;
    if (current < previous) return <TrendingDown size={14} className="text-emerald-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const getStatusColor = (value, type) => {
    if (!value) return 'text-gray-500';
    
    switch(type) {
      case 'bp':
        if (value.systolic >= 140 || value.diastolic >= 90) return 'text-rose-600';
        if (value.systolic >= 120 || value.diastolic >= 80) return 'text-amber-600';
        return 'text-emerald-600';
      case 'heartRate':
        if (value > 100) return 'text-rose-600';
        if (value < 60) return 'text-amber-600';
        return 'text-emerald-600';
      case 'spo2':
        if (value < 95) return 'text-rose-600';
        return 'text-emerald-600';
      case 'temperature':
        if (value > 37.5) return 'text-rose-600';
        if (value < 36) return 'text-amber-600';
        return 'text-emerald-600';
      default:
        return 'text-gray-900';
    }
  };

  const getStatusBadge = (value, type) => {
    if (!value) return null;
    
    switch(type) {
      case 'bp':
        if (latestVitals.systolicBp && latestVitals.diastolicBp) {
          if (latestVitals.systolicBp >= 140 || latestVitals.diastolicBp >= 90) {
            return <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">High</span>;
          }
          if (latestVitals.systolicBp >= 120 || latestVitals.diastolicBp >= 80) {
            return <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Elevated</span>;
          }
          return <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Normal</span>;
        }
        return null;
      case 'heartRate':
        if (latestVitals.heartRate) {
          if (latestVitals.heartRate > 100) {
            return <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">High</span>;
          }
          if (latestVitals.heartRate < 60) {
            return <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Low</span>;
          }
          return <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Normal</span>;
        }
        return null;
      default:
        return null;
    }
  };

  if (detailed) {
    return (
      <div className="space-y-4">
        {latestVitals.recordedAt && (
          <div className="flex items-center gap-2 text-xs text-gray-400 pb-2 border-b border-gray-100">
            <Clock size={12} />
            <span>Recorded: {formatDate(latestVitals.recordedAt)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {(latestVitals.systolicBp || latestVitals.diastolicBp) && (
            <div className="bg-gradient-to-br from-rose-50 to-rose-100/30 rounded-xl p-4 border border-rose-200">
              <div className="flex items-center justify-between mb-2">
                <Heart size={18} className="text-rose-600" />
                {getStatusBadge(latestVitals, 'bp')}
              </div>
              <p className="text-xs text-gray-500">Blood Pressure</p>
              <p className={`text-xl font-bold ${getStatusColor(latestVitals, 'bp')}`}>
                {latestVitals.systolicBp}/{latestVitals.diastolicBp}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">mmHg</p>
            </div>
          )}

          {latestVitals.heartRate && (
            <div className="bg-gradient-to-br from-red-50 to-red-100/30 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <Activity size={18} className="text-red-600" />
                {getStatusBadge(latestVitals, 'heartRate')}
              </div>
              <p className="text-xs text-gray-500">Heart Rate</p>
              <p className={`text-xl font-bold ${getStatusColor(latestVitals.heartRate, 'heartRate')}`}>
                {latestVitals.heartRate}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">bpm</p>
            </div>
          )}

          {latestVitals.spo2 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Droplet size={18} className="text-blue-600" />
              </div>
              <p className="text-xs text-gray-500">Oxygen Saturation</p>
              <p className={`text-xl font-bold ${getStatusColor(latestVitals.spo2, 'spo2')}`}>
                {latestVitals.spo2}%
              </p>
              <p className="text-[10px] text-gray-400 mt-1">SpO2</p>
            </div>
          )}

          {latestVitals.temperature && (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <Thermometer size={18} className="text-amber-600" />
              </div>
              <p className="text-xs text-gray-500">Temperature</p>
              <p className={`text-xl font-bold ${getStatusColor(latestVitals.temperature, 'temperature')}`}>
                {latestVitals.temperature}°
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Celsius</p>
            </div>
          )}

          {latestVitals.weight && (
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <Scale size={18} className="text-emerald-600" />
              </div>
              <p className="text-xs text-gray-500">Weight</p>
              <p className="text-xl font-bold text-gray-900">{latestVitals.weight}</p>
              <p className="text-[10px] text-gray-400 mt-1">kg</p>
            </div>
          )}

          {latestVitals.bloodSugar && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Coffee size={18} className="text-purple-600" />
              </div>
              <p className="text-xs text-gray-500">Blood Sugar</p>
              <p className="text-xl font-bold text-gray-900">{latestVitals.bloodSugar}</p>
              <p className="text-[10px] text-gray-400 mt-1">mg/dL</p>
            </div>
          )}
        </div>

        {latestVitals.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-1">Notes:</p>
            <p className="text-sm text-gray-700">{latestVitals.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {latestVitals.systolicBp && latestVitals.diastolicBp && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart size={14} className="text-rose-500" />
              {previousVitals && getTrendIcon(
                latestVitals.systolicBp,
                previousVitals.systolicBp
              )}
            </div>
            <p className="text-sm font-bold text-gray-900">
              {latestVitals.systolicBp}/{latestVitals.diastolicBp}
            </p>
            <p className="text-[10px] text-gray-400">BP</p>
          </div>
        )}

        {latestVitals.heartRate && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity size={14} className="text-red-500" />
              {previousVitals && getTrendIcon(
                latestVitals.heartRate,
                previousVitals.heartRate
              )}
            </div>
            <p className="text-sm font-bold text-gray-900">{latestVitals.heartRate}</p>
            <p className="text-[10px] text-gray-400">HR</p>
          </div>
        )}

        {latestVitals.spo2 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Droplet size={14} className="text-blue-500" />
              {previousVitals && getTrendIcon(
                latestVitals.spo2,
                previousVitals.spo2
              )}
            </div>
            <p className="text-sm font-bold text-gray-900">{latestVitals.spo2}%</p>
            <p className="text-[10px] text-gray-400">SpO2</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {latestVitals.temperature && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
            <Thermometer size={14} className="text-amber-600" />
            <div>
              <p className="text-xs font-medium text-gray-900">{latestVitals.temperature}°C</p>
              <p className="text-[10px] text-gray-400">Temperature</p>
            </div>
          </div>
        )}

        {latestVitals.weight && (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
            <Scale size={14} className="text-emerald-600" />
            <div>
              <p className="text-xs font-medium text-gray-900">{latestVitals.weight} kg</p>
              <p className="text-[10px] text-gray-400">Weight</p>
            </div>
          </div>
        )}
      </div>

      {latestVitals.bloodSugar && (
        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
          <Coffee size={14} className="text-purple-600" />
          <div>
            <p className="text-xs font-medium text-gray-900">{latestVitals.bloodSugar} mg/dL</p>
            <p className="text-[10px] text-gray-400">Blood Sugar</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Calendar size={10} />
          <span>{formatDate(latestVitals.recordedAt)}</span>
        </div>
        
        {vitals.length > 1 && onViewHistory && (
          <button
            onClick={() => onViewHistory(latestVitals)}
            className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <span>View History</span>
            <span className="text-[8px]">({vitals.length})</span>
          </button>
        )}
      </div>

      {latestVitals.spo2 && latestVitals.spo2 < 95 && (
        <div className="flex items-center gap-1 p-2 bg-amber-50 rounded-lg text-[10px] text-amber-700">
          <AlertCircle size={12} />
          <span>Low oxygen level detected</span>
        </div>
      )}
    </div>
  );
};

export default PatientVitalsDisplay;