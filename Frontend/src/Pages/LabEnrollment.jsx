import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Beaker,
  Award,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  User,
  Shield,
  X
} from 'lucide-react';
import labEnrollmentService from '../services/LabEnrollmentService';

const LabEnrollment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    labName: '',
    registrationNumber: '',
    yearEstablished: '',
    labType: '',
    website: '',
    
    // Contact Information
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Accreditations
    accreditations: [],
    nablAccredited: false,
    isoCertified: false,
    capAccredited: false,
    otherAccreditations: '',
    
    // Services
    testCategories: [],
    homeCollection: false,
    emergencyServices: false,
    reportTurnaround: '24',
    
    // Documents
    licenseDoc: null,
    accreditationDocs: [],
    logo: null,
    
    // Contact Person
    contactPersonName: '',
    contactPersonDesignation: '',
    contactPersonEmail: '',
    contactPersonPhone: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const testCategories = [
    'Pathology',
    'Radiology',
    'Cardiology',
    'Neurology',
    'Hematology',
    'Microbiology',
    'Biochemistry',
    'Immunology',
    'Molecular Diagnostics',
    'Genetic Testing'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  const handleMultiFileUpload = (e, fieldName) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      [fieldName]: files
    }));
  };

  const handleTestCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      testCategories: prev.testCategories.includes(category)
        ? prev.testCategories.filter(c => c !== category)
        : [...prev.testCategories, category]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.labName) newErrors.labName = 'Lab name is required';
      if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }
    
    if (step === 2) {
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    }
    
    if (step === 3) {
      if (formData.testCategories.length === 0) {
        newErrors.testCategories = 'Select at least one test category';
      }
    }
    
    // Contact person fields are optional (no dedicated step in the current UI).
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4)); // Changed from 5 to 4
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      setSubmitError('');
      try {
        const payload = new FormData();
        
        // Basic Information
        payload.append('labName', formData.labName);
        payload.append('registrationNumber', formData.registrationNumber);
        if (formData.yearEstablished) payload.append('yearEstablished', formData.yearEstablished);
        if (formData.labType) payload.append('labType', formData.labType);
        if (formData.website) payload.append('website', formData.website);
        
        // Contact Information
        payload.append('email', formData.email);
        payload.append('phone', formData.phone);
        if (formData.alternatePhone) payload.append('alternatePhone', formData.alternatePhone);
        if (formData.address) payload.append('address', formData.address);
        if (formData.city) payload.append('city', formData.city);
        if (formData.state) payload.append('state', formData.state);
        if (formData.pincode) payload.append('pincode', formData.pincode);

        // Accreditations
        payload.append('nablAccredited', String(formData.nablAccredited));
        payload.append('isoCertified', String(formData.isoCertified));
        payload.append('capAccredited', String(formData.capAccredited));
        if (formData.otherAccreditations) payload.append('otherAccreditations', formData.otherAccreditations);

        // Services
        formData.testCategories.forEach((category) => {
          payload.append('testCategories', category);
        });
        payload.append('homeCollection', String(formData.homeCollection));
        payload.append('emergencyServices', String(formData.emergencyServices));
        if (formData.reportTurnaround) payload.append('reportTurnaround', formData.reportTurnaround);

        // Documents
        if (formData.licenseDoc) payload.append('licenseDoc', formData.licenseDoc);
        if (formData.accreditationDocs.length) {
          formData.accreditationDocs.forEach((file) => payload.append('accreditationDocs', file));
        }
        if (formData.logo) payload.append('logo', formData.logo);

        // Contact Person
        if (formData.contactPersonName) payload.append('contactPersonName', formData.contactPersonName);
        if (formData.contactPersonDesignation) payload.append('contactPersonDesignation', formData.contactPersonDesignation);
        if (formData.contactPersonEmail) payload.append('contactPersonEmail', formData.contactPersonEmail);
        if (formData.contactPersonPhone) payload.append('contactPersonPhone', formData.contactPersonPhone);

        await labEnrollmentService.submitEnrollment(payload);
        setShowSuccess(true);
      } catch (error) {
        setSubmitError(error?.message || 'Failed to submit enrollment.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Updated steps without Contact section
  const steps = [
    { number: 1, title: 'Basic Info', icon: Building2 },
    { number: 2, title: 'Location', icon: MapPin },
    { number: 3, title: 'Services', icon: Beaker },
    { number: 4, title: 'Documents', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-blue-100/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+</span>
                </div>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">MediCare</span>
                <span className="text-gray-700">Plus</span>
              </span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-5xl mx-auto px-4 py-12">
        {/* Decorative elements */}
        <div className="absolute top-20 left-0 w-64 h-64 bg-gradient-to-r from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 right-0 w-64 h-64 bg-gradient-to-r from-purple-100/30 to-pink-100/30 rounded-full blur-3xl -z-10"></div>

        {/* Progress Steps with enhanced styling */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center group">
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all transform group-hover:scale-110 ${
                    currentStep > step.number
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-200'
                      : currentStep === step.number
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle size={22} />
                    ) : (
                      <step.icon size={20} />
                    )}
                    {/* Pulse effect on current step */}
                    {currentStep === step.number && (
                      <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full ${
                    currentStep > step.number + 1 
                      ? 'bg-gradient-to-r from-green-400 to-green-500' 
                      : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Success Message with enhanced styling */}
        {showSuccess && (
          <div className="mb-8 p-8 bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-200 rounded-2xl text-center animate-fadeIn">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Application Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Thank you for partnering with us. Our team will review your application and contact you within 2-3 business days.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-200"
              >
                Go to Homepage
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                View Application
              </button>
            </div>
          </div>
        )}

        {/* Form Card with enhanced styling */}
        {!showSuccess && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-100/50 overflow-hidden shadow-xl shadow-blue-100/20">
            {/* Form Header with gradient */}
            <div className="px-8 py-6 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">Partner with MediCarePlus</h1>
              </div>
              <p className="text-sm text-gray-600 ml-13">
                Join our network of trusted diagnostic laboratories and reach thousands of patients
              </p>
            </div>

            {/* Form Body */}
            <div className="p-8">
              {submitError && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Laboratory Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="labName"
                      value={formData.labName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.labName 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="e.g., City Diagnostic Centre"
                    />
                    {errors.labName && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.labName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.registrationNumber 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="e.g., DL-12345-2024"
                      />
                      {errors.registrationNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.registrationNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year Established
                      </label>
                      <input
                        type="number"
                        name="yearEstablished"
                        value={formData.yearEstablished}
                        onChange={handleInputChange}
                        min="1900"
                        max="2024"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="e.g., 2010"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Laboratory Type
                    </label>
                    <select
                      name="labType"
                      value={formData.labType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Select type</option>
                      <option value="pathology">Pathology Lab</option>
                      <option value="radiology">Radiology Centre</option>
                      <option value="multispecialty">Multi-specialty Lab</option>
                      <option value="chain">Laboratory Chain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 ${
                            errors.email 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                          }`}
                          placeholder="lab@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 ${
                            errors.phone 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                          }`}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <MapPin size={18} />
                      <span>Please provide your laboratory's physical address</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 ${
                        errors.address 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                      placeholder="Street address, building, area"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.city 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="Mumbai"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                      )}
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.state 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="Maharashtra"
                      />
                      {errors.state && (
                        <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                      )}
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 ${
                          errors.pincode 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                        placeholder="400001"
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="+91 98765 43211"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Services */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Test Categories <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {testCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleTestCategoryToggle(category)}
                          className={`p-4 rounded-xl border-2 text-left transition-all transform hover:scale-105 ${
                            formData.testCategories.includes(category)
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50/50 text-blue-700 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600 hover:shadow-sm'
                          }`}
                        >
                          <span className="text-sm font-medium">{category}</span>
                          {formData.testCategories.includes(category) && (
                            <CheckCircle className="float-right text-blue-500" size={18} />
                          )}
                        </button>
                      ))}
                    </div>
                    {errors.testCategories && (
                      <p className="mt-2 text-xs text-red-600">{errors.testCategories}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                        <input
                          type="checkbox"
                          name="homeCollection"
                          checked={formData.homeCollection}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Home Sample Collection</span>
                          <p className="text-xs text-gray-500 mt-1">We offer doorstep sample pickup</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                        <input
                          type="checkbox"
                          name="emergencyServices"
                          checked={formData.emergencyServices}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">24/7 Emergency Services</span>
                          <p className="text-xs text-gray-500 mt-1">Available for urgent tests</p>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Average Report Turnaround
                      </label>
                      <select
                        name="reportTurnaround"
                        value={formData.reportTurnaround}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="6">Within 6 hours</option>
                        <option value="12">Within 12 hours</option>
                        <option value="24">Within 24 hours</option>
                        <option value="48">Within 48 hours</option>
                        <option value="72">Within 72 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <Upload size={18} />
                      <span>Please upload clear, legible copies of the following documents</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Laboratory License / Registration Certificate
                    </label>
                    <div className="relative border-3 border-dashed border-blue-200 rounded-xl p-8 text-center hover:border-blue-400 transition-all bg-gradient-to-b from-blue-50/30 to-transparent group">
                      <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-20 transition-opacity rounded-xl"></div>
                      <Upload className="mx-auto h-14 w-14 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag and drop or <span className="text-blue-600 font-medium cursor-pointer">browse</span>
                      </p>
                      <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'licenseDoc')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {formData.licenseDoc && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle size={18} />
                        <span className="font-medium">{formData.licenseDoc.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Accreditation Certificates (Optional)
                    </label>
                    <div className="relative border-3 border-dashed border-purple-200 rounded-xl p-8 text-center hover:border-purple-400 transition-all bg-gradient-to-b from-purple-50/30 to-transparent group">
                      <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-20 transition-opacity rounded-xl"></div>
                      <Upload className="mx-auto h-14 w-14 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-sm text-gray-600 mb-1">
                        Upload multiple files
                      </p>
                      <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB each</p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleMultiFileUpload(e, 'accreditationDocs')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {formData.accreditationDocs.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.accreditationDocs.map((file, index) => (
                          <div key={index} className="p-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-sm text-purple-700">
                            <CheckCircle size={16} />
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Laboratory Logo
                    </label>
                    <div className="relative border-3 border-dashed border-amber-200 rounded-xl p-6 text-center hover:border-amber-400 transition-all bg-gradient-to-b from-amber-50/30 to-transparent group">
                      <Upload className="mx-auto h-10 w-10 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs text-gray-600">
                        Upload your logo (recommended size: 200x200px)
                      </p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.svg"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="text-amber-600" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800 mb-1">
                          Important Information
                        </p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          By submitting this application, you agree that all information provided is accurate and complete. 
                          Our team may contact you for verification purposes. False information may lead to rejection of your application.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    currentStep === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                >
                  ← Previous
                </button>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                    Step {currentStep} of 4
                  </span>
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 group"
                    >
                      Next Step
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <CheckCircle size={18} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trust Badges with enhanced styling */}
        <div className="mt-10 flex items-center justify-center gap-8 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100/50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="text-green-500" size={20} />
            <span>256-bit SSL Secure</span>
          </div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="text-blue-500" size={20} />
            <span>24hr Review Time</span>
          </div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="text-amber-500" size={20} />
            <span>Verified Partners</span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LabEnrollment;
