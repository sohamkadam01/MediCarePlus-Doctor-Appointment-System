// components/citycarelabs/CityCareLabs.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Microscope, Clock, Beaker, Calendar, CheckCircle, 
  ChevronDown, Menu, X, Phone, Mail, MapPin, Activity, Heart, 
  Droplet, Thermometer, Award, Shield, FileText, Star, User, 
  Stethoscope, XCircle, Map, Building, Navigation, Loader,
  AlertCircle, Wifi, WifiOff, Filter, ChevronLeft, ChevronRight,
  Globe, Award as AwardIcon, Clock as ClockIcon, Home, Phone as PhoneIcon,
  Mail as MailIcon, MapPin as MapPinIcon, ChevronUp, Info, BookOpen,
  Syringe, Microscope as MicroscopeIcon, Pill, Scissors, Eye, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/lab-enrollments';
const API_ROOT_URL = 'http://localhost:8080/api';

const CityCareLabs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [selectedTest, setSelectedTest] = useState('');
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showDoctorPopup, setShowDoctorPopup] = useState(false);
  const [showLabResultsPopup, setShowLabResultsPopup] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [verifiedDoctors, setVerifiedDoctors] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorError, setDoctorError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Location state
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [availableLabs, setAvailableLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [showLabDetails, setShowLabDetails] = useState(false);
  
  // Filter state for lab results
  const [filterAccredited, setFilterAccredited] = useState(false);
  const [filterHomeCollection, setFilterHomeCollection] = useState(false);
  const [filterEmergency, setFilterEmergency] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [labsPerPage] = useState(6);
  
  // API state
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [apiError, setApiError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const token = localStorage.getItem('token');
  const doctorAxiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // Booking data to pass to PatientInfoPortal
  const [bookingData, setBookingData] = useState(null);

  // Services data - Lab tests available for booking
  const services = [
    {
      id: 1,
      name: "Complete Blood Count (CBC)",
      category: "Hematology",
      price: "$45",
      prep: "No fasting required",
      time: "Same day results",
      desc: "Measures red blood cells (anemia), white blood cells (infection), and platelets to evaluate overall health.",
      icon: "Droplet",
      popular: true
    },
    {
      id: 2,
      name: "Basic Metabolic Panel (BMP)",
      category: "Metabolic",
      price: "$55",
      prep: "8-12 hours fasting required",
      time: "Same day results",
      desc: "Assesses blood sugar (glucose), calcium, and electrolytes to check kidney function.",
      icon: "Activity",
      popular: false
    },
    {
      id: 3,
      name: "Lipid Profile",
      category: "Cardiology",
      price: "$60",
      prep: "10-12 hours fasting required",
      time: "24 hours",
      desc: "Measures cholesterol (HDL, LDL) and triglycerides to assess cardiovascular risk.",
      icon: "Heart",
      popular: true
    },
    {
      id: 4,
      name: "Liver Panel/Function Test",
      category: "Metabolic",
      price: "$50",
      prep: "8 hours fasting recommended",
      time: "Same day results",
      desc: "Measures enzymes and proteins (ALT, AST, Bilirubin) to evaluate liver health.",
      icon: "Activity",
      popular: false
    },
    {
      id: 5,
      name: "Urinalysis (UA)",
      category: "General",
      price: "$30",
      prep: "Mid-stream collection required",
      time: "Same day results",
      desc: "Checks urine for signs of infection, kidney disease, or diabetes.",
      icon: "Beaker",
      popular: false
    },
    {
      id: 6,
      name: "HbA1c (Diabetes Monitor)",
      category: "Metabolic",
      price: "$35",
      prep: "No fasting required",
      time: "Same day results",
      desc: "Measures average blood sugar levels over the past 3 months.",
      icon: "Activity",
      popular: true
    },
    {
      id: 7,
      name: "Full Body Checkup Package",
      category: "Packages",
      price: "$199",
      prep: "10 hours fasting required",
      time: "24-48 hours",
      desc: "Includes 60+ parameters: CBC, BMP, Liver Panel, Lipid Profile, and Vitamin levels.",
      icon: "Award",
      popular: true
    },
    {
      id: 8,
      name: "Thyroid Profile (T3, T4, TSH)",
      category: "Metabolic",
      price: "$55",
      prep: "Fasting recommended",
      time: "24 hours",
      desc: "Comprehensive evaluation of thyroid gland function and metabolic rate.",
      icon: "Activity",
      popular: false
    }
  ];

  const categories = [
    { id: 'All', label: 'All Tests', icon: 'FileText' },
    { id: 'General', label: 'General Health', icon: 'Heart' },
    { id: 'Hematology', label: 'Hematology', icon: 'Droplet' },
    { id: 'Metabolic', label: 'Metabolic & Kidney', icon: 'Activity' },
    { id: 'Cardiology', label: 'Cardiovascular', icon: 'Heart' },
    { id: 'Packages', label: 'Health Packages', icon: 'Award' }
  ];

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch available cities and states on component mount
  useEffect(() => {
    if (isOnline) {
      fetchLocations();
    }
  }, [isOnline]);

  const fetchLocations = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [citiesRes, statesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/cities`),
        axios.get(`${API_BASE_URL}/states`)
      ]);
      setCities(citiesRes.data || []);
      setStates(statesRes.data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setApiError('Failed to load locations. Please try again.');
      showNotificationMessage('Failed to load locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const searchLabs = async (searchParams) => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (searchParams.city) params.append('city', searchParams.city);
      if (searchParams.state) params.append('state', searchParams.state);
      if (searchParams.pincode) params.append('pincode', searchParams.pincode);
      
      const response = await axios.get(`${API_BASE_URL}/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching labs:', error);
      setApiError('Error searching labs. Please try again.');
      showNotificationMessage('Error searching labs. Please try again.', 'error');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOnline) {
      showNotificationMessage('You are offline. Please check your internet connection.', 'error');
      return;
    }

    const searchParams = { city, state, pincode };
    setLastSearchParams(searchParams);
    const labs = await searchLabs(searchParams);
    
    if (labs.length > 0) {
      setAvailableLabs(labs);
      setShowLocationPopup(false);
      setShowLabResultsPopup(true);
      setCurrentPage(1);
      // Reset filters
      setFilterAccredited(false);
      setFilterHomeCollection(false);
      setFilterEmergency(false);
      setSortBy('name');
      setSortOrder('asc');
    } else {
      setAvailableLabs([]);
      setSelectedLab(null);
      setShowLabResultsPopup(false);
      setShowLabDetails(false);
      setShowDoctorPopup(false);
      setApiError(`No labs found in ${city || 'your area'}. Please change your location.`);
      showNotificationMessage(`No labs found in ${city || 'your area'}. Please change your location.`, 'info');
      setShowLocationPopup(true);
    }
  };

  const handleLabSelect = (lab) => {
    setSelectedLab(lab);
    setShowLabDetails(true);
  };

  const handleBackToResults = () => {
    setShowLabDetails(false);
    setSelectedLab(null);
  };

  const handleBookFromLab = (lab) => {
    setSelectedLab(lab);
    setShowLabResultsPopup(false);
    setShowLabDetails(false);
    // If no test is selected, use a default message
    if (!selectedTest) {
      setSelectedTest('Lab Test');
    }
    setShowDoctorPopup(true);
    showNotificationMessage(`Selected lab: ${lab.name}`, 'success');
  };

  const handleOptionSelect = (option, doctorInfo = null) => {
    setSelectedOption(option);
    setShowDoctorPopup(false);
    
    // Prepare booking data for PatientInfoPortal
    const bookingInfo = {
      testName: selectedTest || 'Lab Test',
      labName: selectedLab?.name || 'Selected Lab',
      labAddress: selectedLab?.address,
      labCity: selectedLab?.city,
      labState: selectedLab?.state,
      labPhone: selectedLab?.phone,
      labEmail: selectedLab?.email,
      referralType: option,
      referralDoctorId: doctorInfo?.id || null,
      referralDoctorName: doctorInfo?.name || '',
      referralDoctorSpecialization: doctorInfo?.specialization || '',
      referralDoctorPhone: doctorInfo?.phone || '',
      referralDoctorEmail: doctorInfo?.email || '',
      testPrice: selectedTest === 'Complete Blood Count (CBC)' ? 45 : 
                 selectedTest === 'Basic Metabolic Panel (BMP)' ? 55 :
                 selectedTest === 'Lipid Profile' ? 60 :
                 selectedTest === 'Liver Panel/Function Test' ? 50 :
                 selectedTest === 'Urinalysis (UA)' ? 30 :
                 selectedTest === 'HbA1c (Diabetes Monitor)' ? 35 :
                 selectedTest === 'Full Body Checkup Package' ? 199 :
                 selectedTest === 'Thyroid Profile (T3, T4, TSH)' ? 55 : 45,
      preparation: selectedLab ? getTestPrep(selectedTest) : 'Follow standard preparation',
      turnaround: selectedLab ? getTestTurnaround(selectedTest) : '24 hours',
      location: selectedLab ? {
        name: selectedLab.name,
        fee: selectedLab.homeCollection ? 25 : 10,
        hours: selectedLab.emergencyServices ? '24/7 Available' : '8 AM - 8 PM',
        address: selectedLab.address,
        phone: selectedLab.phone
      } : null
    };
    
    setBookingData(bookingInfo);
    
    // Navigate to PatientInfoPortal with state
    navigate('/lab/patientInfoPage', { state: { bookingData: bookingInfo } });
    
    showNotificationMessage(
      option === 'doctor' 
        ? `Proceeding with doctor referral for ${selectedTest || 'Lab Test'}`
        : `Proceeding with self-check for ${selectedTest || 'Lab Test'}`,
      'success'
    );
  };

  const handleDoctorReferenceSelect = () => {
    setSelectedOption('doctor');
    setSelectedDoctor(null);
    setDoctorSearch('');
    setDoctorError('');
  };

  const resetDoctorSelection = () => {
    setSelectedOption('');
    setSelectedDoctor(null);
    setDoctorSearch('');
    setDoctorError('');
  };

  const normalizeDoctor = (doctor) => {
    const rawDetails = doctor?.doctorDetails || doctor?.details || {};
    return {
      id: doctor?.id ?? doctor?.userId ?? doctor?.doctorId ?? rawDetails?.userId ?? null,
      name: doctor?.name ?? doctor?.user?.name ?? rawDetails?.name ?? 'Doctor',
      specialization: doctor?.specializationName ?? doctor?.specialization ?? rawDetails?.specialization ?? 'General Medicine',
      experience: doctor?.experienceYear ?? doctor?.experience ?? rawDetails?.experience ?? 0,
      rating: Number(doctor?.averageRating ?? doctor?.rating ?? 0),
      totalReviews: Number(doctor?.totalReviews ?? doctor?.reviewCount ?? 0),
      clinicAddress: doctor?.clinicAddress ?? rawDetails?.clinicAddress ?? '',
      phone: doctor?.phone ?? doctor?.user?.phone ?? '',
      email: doctor?.email ?? doctor?.user?.email ?? '',
      approved: doctor?.approved ?? rawDetails?.approved ?? doctor?.verified ?? false,
      status: doctor?.status ?? rawDetails?.status ?? ''
    };
  };

  const fetchVerifiedDoctors = async () => {
    if (!token) {
      setDoctorError('Please login to view verified doctors.');
      setVerifiedDoctors([]);
      return;
    }
    setDoctorLoading(true);
    setDoctorError('');
    try {
      const res = await axios.get(`${API_ROOT_URL}/users/doctors/details`, doctorAxiosConfig);
      const doctorsRaw = Array.isArray(res?.data) ? res.data : [];
      const normalized = doctorsRaw.map(normalizeDoctor);
      const verifiedOnly = normalized.filter((doc) =>
        (doc.approved === true || doc.status === 'ACTIVE') && doc.id
      );
      setVerifiedDoctors(verifiedOnly);
      if (verifiedOnly.length === 0) {
        setDoctorError('No verified doctors available right now.');
      }
    } catch (error) {
      setDoctorError('Unable to load verified doctors. Please try again.');
      setVerifiedDoctors([]);
    } finally {
      setDoctorLoading(false);
    }
  };

  useEffect(() => {
    if (showDoctorPopup && selectedOption === 'doctor' && verifiedDoctors.length === 0 && !doctorLoading) {
      fetchVerifiedDoctors();
    }
  }, [showDoctorPopup, selectedOption, verifiedDoctors.length, doctorLoading]);

  // Helper functions to get test details
  const getTestPrep = (testName) => {
    const test = services.find(s => s.name === testName);
    return test?.prep || 'No special preparation required';
  };

  const getTestTurnaround = (testName) => {
    const test = services.find(s => s.name === testName);
    return test?.time || '24 hours';
  };

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const closeAllPopups = () => {
    setShowLocationPopup(false);
    setShowDoctorPopup(false);
    setShowLabResultsPopup(false);
    setShowLabDetails(false);
    resetDoctorSelection();
    setCity('');
    setState('');
    setPincode('');
    setSelectedLab(null);
    setApiError(null);
  };

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'Droplet': return <Droplet size={20} className="text-blue-500" />;
      case 'Activity': return <Activity size={20} className="text-purple-500" />;
      case 'Heart': return <Heart size={20} className="text-orange-500" />;
      case 'Beaker': return <Beaker size={20} className="text-emerald-500" />;
      case 'Award': return <Award size={20} className="text-amber-500" />;
      default: return <FileText size={20} className="text-gray-500" />;
    }
  };

  const filteredServices = services.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookTest = (testName) => {
    setSelectedTest(testName);
    setShowLocationPopup(true);
    setCity('');
    setState('');
    setPincode('');
    setApiError(null);
  };

  // Filter cities based on search
  const filteredCities = locationSearch
    ? cities.filter(c => c && c.toLowerCase().includes(locationSearch.toLowerCase()))
    : cities;

  // Apply filters and sorting to labs
  const getFilteredAndSortedLabs = () => {
    let filtered = [...availableLabs];
    
    // Apply filters
    if (filterAccredited) {
      filtered = filtered.filter(lab => lab.accreditations && lab.accreditations.length > 0);
    }
    if (filterHomeCollection) {
      filtered = filtered.filter(lab => lab.homeCollection === true);
    }
    if (filterEmergency) {
      filtered = filtered.filter(lab => lab.emergencyServices === true);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case 'year':
          comparison = (b.yearEstablished || 0) - (a.yearEstablished || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // Pagination
  const filteredLabs = getFilteredAndSortedLabs();
  const indexOfLastLab = currentPage * labsPerPage;
  const indexOfFirstLab = indexOfLastLab - labsPerPage;
  const currentLabs = filteredLabs.slice(indexOfFirstLab, indexOfLastLab);
  const totalPages = Math.ceil(filteredLabs.length / labsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-white">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-yellow-700">
            <WifiOff size={18} />
            <span className="text-sm">You are offline. Some features may be unavailable.</span>
          </div>
        </div>
      )}

      {/* Navigation */}
   

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getIcon(cat.icon)}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((test) => (
              <div
                key={test.id}
                className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                        {test.category}
                      </span>
                      {test.popular && (
                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Star size={12} />
                          Popular
                        </span>
                      )}
                    </div>
                    <span className="text-xl font-bold text-gray-800">
                      {test.price}
                    </span>
                  </div>

                  <h3 className="text-lg font-medium text-gray-800 mb-2">{test.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 flex-grow">{test.desc}</p>

                  <div className="space-y-2 mb-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock size={16} className="text-gray-400" />
                      <span>{test.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Beaker size={16} className="text-gray-400" />
                      <span>{test.prep}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleBookTest(test.name)}
                    disabled={!isOnline}
                    className="w-full py-2.5 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600"
                  >
                    <Calendar size={18} />
                    Book Test
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="bg-white rounded-xl p-12 max-w-md mx-auto border border-gray-200">
                <Search size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No tests found</h3>
                <p className="text-gray-500 text-sm">Try searching for a different keyword or category.</p>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Thermometer className="text-blue-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Home Collection</h3>
            <p className="text-sm text-gray-500">Free sample collection from your doorstep by trained professionals.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="text-purple-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Fast Results</h3>
            <p className="text-sm text-gray-500">Most tests completed within 24 hours with digital reports.</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="bg-pink-100 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="text-pink-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">Certified Labs</h3>
            <p className="text-sm text-gray-500">NABL accredited labs with strict quality control measures.</p>
          </div>
        </div>
      </main>

      {/* Location Input Popup (Small) */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-fade-in">
            {/* Close button */}
            <button 
              onClick={closeAllPopups}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </button>

            {/* Popup header */}
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Find Labs Near You</h3>
              <p className="text-gray-500 text-sm">Enter your location to see available labs</p>
            </div>

            {/* API Error Message */}
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={18} />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleLocationSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <div className="relative">
                    <Building size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setLocationSearch(e.target.value);
                      }}
                      placeholder="e.g., Mumbai, Delhi, Bangalore"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                      list="cities"
                      disabled={loading}
                    />
                    <datalist id="cities">
                      {filteredCities.map((c, index) => (
                        <option key={index} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <div className="relative">
                    <Map size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 appearance-none bg-white"
                      disabled={loading}
                    >
                      <option value="">Select State</option>
                      {states.map((s, index) => (
                        <option key={index} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode (Optional)</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter pincode"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    maxLength="6"
                    pattern="[0-9]*"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || !isOnline}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:bg-blue-400"
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Navigation size={18} />
                      Find Labs
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Skip option */}
            <p className="text-xs text-gray-400 text-center mt-4">
              Can't find labs? Try a different city, state, or pincode.
            </p>
          </div>
        </div>
      )}

      {/* Lab Results Popup (Large) */}
      {showLabResultsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Labs in {city}{state ? `, ${state}` : ''}</h2>
                  <p className="text-gray-500 mt-1">{filteredLabs.length} labs found</p>
                </div>
                <button 
                  onClick={closeAllPopups}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Filters and Sort Bar */}
              <div className="mt-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterAccredited(!filterAccredited)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 transition-all ${
                      filterAccredited 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <AwardIcon size={16} />
                    Accredited Only
                  </button>
                  <button
                    onClick={() => setFilterHomeCollection(!filterHomeCollection)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 transition-all ${
                      filterHomeCollection 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Home size={16} />
                    Home Collection
                  </button>
                  <button
                    onClick={() => setFilterEmergency(!filterEmergency)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 transition-all ${
                      filterEmergency 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <AlertCircle size={16} />
                    24/7 Emergency
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                    <option value="year">Established Year</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Lab Cards Grid */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader className="animate-spin text-blue-600" size={40} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentLabs.map((lab) => (
                      <div
                        key={lab.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">{lab.name}</h3>
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm flex items-center gap-1">
                            <Star size={14} className="fill-current" />
                            {lab.rating || '4.5'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                          <MapPin size={14} />
                          {lab.address}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {lab.accreditations && lab.accreditations.map((acc, idx) => (
                            <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                              {acc}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                          {lab.homeCollection && (
                            <span className="flex items-center gap-1">
                              <Home size={14} className="text-blue-500" />
                              Home Collection
                            </span>
                          )}
                          {lab.emergencyServices && (
                            <span className="flex items-center gap-1">
                              <ClockIcon size={14} className="text-orange-500" />
                              24/7 Available
                            </span>
                          )}
                        </div>

                        {lab.testCategories && lab.testCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {lab.testCategories.slice(0, 4).map((category, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {category}
                              </span>
                            ))}
                            {lab.testCategories.length > 4 && (
                              <span className="text-xs text-gray-500">+{lab.testCategories.length - 4} more</span>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookFromLab(lab);
                            }}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                          >
                            Go Ahead
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${lab.phone}`;
                            }}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Call Lab"
                          >
                            <Phone size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLabSelect(lab);
                            }}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="View Details"
                          >
                            <Info size={18} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={`w-10 h-10 rounded-lg ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
              <button
                onClick={() => {
                  setShowLabResultsPopup(false);
                  setShowLocationPopup(true);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <ChevronLeft size={18} />
                Change Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Details Popup */}
      {showLabDetails && selectedLab && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in">
            {/* Header with Image/Icon */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <button 
                onClick={handleBackToResults}
                className="absolute top-4 right-4 text-white hover:text-blue-200"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-4">
                <div className="bg-white p-4 rounded-full">
                  <Microscope size={40} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedLab.name}</h2>
                  <p className="text-blue-100 mt-1">{selectedLab.labType || 'Diagnostic Lab'}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Rating and Quick Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  <Star size={16} className="fill-current" />
                  <span className="font-medium">{selectedLab.rating || '4.5'}</span>
                  <span className="text-green-600">(120+ reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <ClockIcon size={16} />
                  <span>Est. {selectedLab.yearEstablished || '2010'}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-700">Address</p>
                    <p className="text-gray-600">{selectedLab.address}</p>
                    <p className="text-gray-500 text-sm">{selectedLab.city}, {selectedLab.state} - {selectedLab.pincode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneIcon className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="font-medium text-gray-700">Contact</p>
                    <p className="text-gray-600">{selectedLab.phone}</p>
                    <p className="text-gray-500 text-sm">{selectedLab.email}</p>
                  </div>
                </div>
              </div>

              {/* Accreditations */}
              {selectedLab.accreditations && selectedLab.accreditations.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <AwardIcon size={18} />
                    Accreditations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLab.accreditations.map((acc, idx) => (
                      <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={`p-3 rounded-lg border ${selectedLab.homeCollection ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <Home size={20} className={selectedLab.homeCollection ? 'text-green-600' : 'text-gray-400'} />
                  <p className={`text-sm font-medium mt-1 ${selectedLab.homeCollection ? 'text-green-700' : 'text-gray-500'}`}>
                    Home Collection
                  </p>
                  <p className="text-xs text-gray-500">{selectedLab.homeCollection ? 'Available' : 'Not Available'}</p>
                </div>
                <div className={`p-3 rounded-lg border ${selectedLab.emergencyServices ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <ClockIcon size={20} className={selectedLab.emergencyServices ? 'text-green-600' : 'text-gray-400'} />
                  <p className={`text-sm font-medium mt-1 ${selectedLab.emergencyServices ? 'text-green-700' : 'text-gray-500'}`}>
                    24/7 Emergency
                  </p>
                  <p className="text-xs text-gray-500">{selectedLab.emergencyServices ? 'Available' : 'Not Available'}</p>
                </div>
              </div>

              {/* Test Categories */}
              {selectedLab.testCategories && selectedLab.testCategories.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Beaker size={18} />
                    Available Tests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLab.testCategories.map((category, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Turnaround */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700">Report Turnaround</span>
                  </div>
                  <span className="text-blue-600 font-semibold">{selectedLab.reportTurnaround || '24'} hours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLabDetails(false);
                    setShowLabResultsPopup(false);
                    setShowDoctorPopup(true);
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => window.location.href = `tel:${selectedLab.phone}`}
                  className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all"
                >
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Reference Popup */}
      {showDoctorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-fade-in">
            {/* Close button */}
            <button 
              onClick={closeAllPopups}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <XCircle size={24} />
            </button>

            {/* Popup header */}
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Book {selectedTest || 'Lab Test'}</h3>
              <p className="text-gray-500 text-sm">
                {selectedLab ? `at ${selectedLab.name}` : 'Please select how you would like to proceed'}
              </p>
            </div>

            {selectedOption !== 'doctor' && (
              <>
                {/* Options */}
                <div className="space-y-4">
                  {/* Doctor Reference Option */}
                  <button
                    onClick={handleDoctorReferenceSelect}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200">
                        <User className="text-blue-600" size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-800">Doctor Reference</h4>
                        <p className="text-sm text-gray-500">I was referred by a doctor</p>
                      </div>
                    </div>
                  </button>

                  {/* Self Check Option */}
                  <button
                    onClick={() => handleOptionSelect('self')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200">
                        <Heart className="text-green-600" size={24} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-800">Self Check</h4>
                        <p className="text-sm text-gray-500">I want to check on my own</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Footer note */}
                <p className="text-xs text-gray-400 text-center mt-6">
                  You can add doctor details later if you choose doctor reference
                </p>
              </>
            )}

            {selectedOption === 'doctor' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={resetDoctorSelection}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Back to options
                  </button>
                  <span className="text-xs text-gray-400">
                    {verifiedDoctors.length} verified doctors
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or specialization"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {doctorLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="animate-spin text-blue-600" size={24} />
                    <span className="ml-2 text-sm text-gray-600">Loading doctors...</span>
                  </div>
                ) : doctorError ? (
                  <div className="text-sm text-red-500 text-center py-6">{doctorError}</div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                    {verifiedDoctors
                      .filter((doctor) => {
                        const term = doctorSearch.trim().toLowerCase();
                        if (!term) return true;
                        return [
                          doctor.name,
                          doctor.specialization,
                          doctor.clinicAddress
                        ].some((field) => String(field || '').toLowerCase().includes(term));
                      })
                      .map((doctor) => (
                        <button
                          key={doctor.id}
                          onClick={() => setSelectedDoctor(doctor)}
                          className={`w-full border rounded-lg p-3 text-left transition-all ${
                            selectedDoctor?.id === doctor.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">Dr. {doctor.name}</p>
                              <p className="text-xs text-gray-500">{doctor.specialization}</p>
                              {doctor.clinicAddress && (
                                <p className="text-xs text-gray-400 mt-1">{doctor.clinicAddress}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-emerald-600">Verified</p>
                              {Number.isFinite(doctor.rating) && doctor.rating > 0 && (
                                <p className="text-xs text-gray-500">{doctor.rating.toFixed(1)} ★</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}

                {!doctorLoading && !doctorError && verifiedDoctors.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-6">No verified doctors found.</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetDoctorSelection}
                    className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleOptionSelect('doctor', selectedDoctor)}
                    disabled={!selectedDoctor}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification */}
      {showNotification && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up flex items-center gap-3 ${
          notificationType === 'success' ? 'bg-blue-600' : 
          notificationType === 'error' ? 'bg-red-600' : 'bg-yellow-600'
        } text-white`}>
          {notificationType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notificationMessage}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <Loader className="animate-spin text-blue-600" size={24} />
            <span className="text-gray-700">Loading labs...</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CityCareLabs;
