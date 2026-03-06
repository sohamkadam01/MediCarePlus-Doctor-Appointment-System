// components/AppointmentList.jsx
import React, { useState } from 'react';
import { Calendar, Clock, Filter, ChevronDown } from 'lucide-react';
import AppointmentCard from './AppointmentCard';

const AppointmentList = ({ appointments, type, onUpdate, onRebook }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-gray-500 font-medium mb-2">No {type} appointments</h3>
        <p className="text-gray-400 text-sm">
          {type === 'upcoming' 
            ? 'Book your first appointment to get started' 
            : 'Your past appointments will appear here'}
        </p>
      </div>
    );
  }

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    }
    return 0;
  });

  const statusCounts = {
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    cancelled: appointments.filter(a => a.status === 'CANCELLED').length
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {statusCounts[status] > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  filter === status
                    ? 'bg-white text-blue-600'
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {statusCounts[status]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
          >
            <option value="date">Date</option>
            <option value="doctor">Doctor</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="space-y-3">
        {sortedAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            type={type}
            onUpdate={onUpdate}
            onRebook={onRebook}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        Showing {filteredAppointments.length} of {appointments.length} appointments
      </div>
    </div>
  );
};

export default AppointmentList;
