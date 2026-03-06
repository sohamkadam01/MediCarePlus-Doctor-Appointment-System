import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntroPage from './Pages/IntroPage';
import Login from './Pages/Login';
import PatientInfoPortal from './components/PatientInfoPortal';
import Register from './Pages/Register';
import PatientDetailsForm from './Pages/PatientDetailsForm';
import DoctorDetailsForm from './Pages/DoctorDetailsForm';
import LabRegistration from './Pages/LabRegistration';
import CityCareLabs from './components/CityCareLabs';
import Lab from './Pages/Lab';
import DoctorPending from './Pages/DoctorPending';
import AdminDashboard from './Pages/AdminDashboard';
import PatientDashboard from './Pages/PatientDashboard';
import DoctorDashboard from './Pages/DoctorDashboard';
import DoctorSearchPage from './components/DoctorSearchPage';
import LabsList from './Pages/LabsList';
import LabDetail from './Pages/LabDetail';
import LabEnrollment from './Pages/LabEnrollment';
import LabLogin from './Pages/LabLogin';
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
        <Route path="/patient/details" element={<PatientDetailsForm />} />
        <Route path="/doctor/details" element={<DoctorDetailsForm />} />
        <Route path="/doctor/pending" element={<DoctorPending />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/book" element={<PatientDashboard />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/search" element={<DoctorSearchPage />} />
        <Route path="/lab/dashboard" element={<Lab />} />
        <Route path="/labs/:id" element={<LabDetail />} />
        <Route path="/lab/enrollment" element={<LabEnrollment />} />
        <Route path="/lab/login" element={<LabLogin />} />
        <Route path="/lab/registration" element={<LabRegistration />} />
        <Route path="/lab/page" element={<CityCareLabs />} />
        <Route path="/lab/patientInfoPage" element={<PatientInfoPortal />} />
      </Routes>
    </Router>
  );
}


export default App;
