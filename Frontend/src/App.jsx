import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntroPage from './Pages/IntroPage';
import Login from './Pages/Login';
import Register from './Pages/Register';
import PatientDetailsForm from './Pages/PatientDetailsForm';
import DoctorDetailsForm from './Pages/DoctorDetailsForm';
import DoctorPending from './Pages/DoctorPending';
import AdminDashboard from './Pages/AdminDashboard';
import PatientDashboard from './Pages/PatientDashboard';

const DashboardPlaceholder = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-600">Dashboard page is not implemented yet.</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/doctor/dashboard" element={<DashboardPlaceholder title="Doctor Dashboard" />} />
        <Route path="/patient/details" element={<PatientDetailsForm />} />
        <Route path="/doctor/details" element={<DoctorDetailsForm />} />
        <Route path="/doctor/pending" element={<DoctorPending />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
