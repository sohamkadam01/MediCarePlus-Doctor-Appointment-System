// import React, { useState, useEffect } from 'react';
// import {
//   Search,
//   MapPin,
//   Stethoscope,
//   Star,
//   DollarSign,
//   Award,
//   Clock,
//   Filter,
//   X,
//   Loader,
//   ChevronRight,
//   Calendar,
//   User,
//   AlertCircle,
//   Heart,
//   Activity,
//   Shield,
//   Mail,
//   Phone,
//   Globe,
//   Navigation,
//   ThumbsUp,
//   Users,
//   Briefcase,
//   GraduationCap,
//   CheckCircle,
//   Info
// } from 'lucide-react';
// import NewAppointmentModal from './NewAppointmentModal';

// const DoctorSearchPage = () => {
//   const [loading, setLoading] = useState(false);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [doctors, setDoctors] = useState([]);
//   const [filteredDoctors, setFilteredDoctors] = useState([]);
//   const [selectedDoctor, setSelectedDoctor] = useState(null);
//   const [showAppointmentModal, setShowAppointmentModal] = useState(false);
//   const [searchParams, setSearchParams] = useState({
//     city: '',
//     state: ''
//   });
//   const [filters, setFilters] = useState({
//     specialization: '',
//     experience: '',
//     rating: '',
//     feeRange: '',
//     availability: ''
//   });
//   const [specializations, setSpecializations] = useState([]);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const [searchHistory, setSearchHistory] = useState([]);
//   const [doctorReviews, setDoctorReviews] = useState({});

//   // Mock patient data (replace with actual data from your context/auth)
//   const patient = {
//     id: 1,
//     name: 'John Doe',
//     email: 'john@example.com'
//   };

//   const patientDetails = {
//     age: 30,
//     gender: 'Male',
//     bloodGroup: 'O+',
//     allergies: 'None'
//   };

//   // Load recent searches from localStorage
//   useEffect(() => {
//     const saved = localStorage.getItem('recentDoctorSearches');
//     if (saved) {
//       setRecentSearches(JSON.parse(saved));
//     }
//   }, []);

//   // Extract unique specializations from doctors
//   useEffect(() => {
//     if (doctors.length > 0) {
//       const uniqueSpecializations = [...new Set(doctors.map(d => d.specialization))];
//       setSpecializations(uniqueSpecializations);
//     }
//   }, [doctors]);

//   // Apply filters whenever doctors or filters change
// useEffect(() => {
//   if (!doctors.length) return setFilteredDoctors([]);

//   let filtered = [...doctors];

//   // Specialization
//   if (filters.specialization)
//     filtered = filtered.filter(d =>
//       d.specialization?.toLowerCase().includes(filters.specialization.toLowerCase())
//     );

//   // Experience
//   if (filters.experience) {
//     const [min, max] = filters.experience.split('-').map(Number);
//     filtered = filtered.filter(d => {
//       const exp = parseInt(d.experience) || 0;
//       return max ? exp >= min && exp <= max : exp >= min;
//     });
//   }

//   // Rating
//   if (filters.rating) {
//     const minRating = parseFloat(filters.rating);
//     filtered = filtered.filter(d => (d.reviews?.averageRating || 0) >= minRating);
//   }

//   // Fee
//   if (filters.feeRange) {
//     const [min, max] = filters.feeRange.split('-').map(Number);
//     filtered = filtered.filter(d => {
//       const fee = d.fee || d.consultationFee || 0;
//       return max ? fee >= min && fee <= max : fee >= min;
//     });
//   }

//   // Availability
//   if (filters.availability && filters.availability !== '') {
//     const today = new Date();
//     filtered = filtered.filter(d => {
//       if (!d.availability?.length) return false;
//       return d.availability.some(slot => {
//         const slotDate = new Date(slot);
//         if (filters.availability === 'Today') return slotDate.toDateString() === today.toDateString();
//         if (filters.availability === 'Tomorrow') {
//           const tomorrow = new Date(today);
//           tomorrow.setDate(today.getDate() + 1);
//           return slotDate.toDateString() === tomorrow.toDateString();
//         }
//         if (filters.availability === 'This Week') {
//           const weekEnd = new Date(today);
//           weekEnd.setDate(today.getDate() + 7);
//           return slotDate >= today && slotDate <= weekEnd;
//         }
//       });
//     });
//   }

//   setFilteredDoctors(filtered);
// }, [doctors, filters]);

// const handleSearch = async (e) => {
//   e?.preventDefault();

//   if (!searchParams.city || !searchParams.state) {
//     alert("Please enter city and state");
//     return;
//   }

//   setSearchLoading(true);

//   try {
//     const response = await fetch(
//       `/api/doctors/search?city=${searchParams.city}&state=${searchParams.state}`
//     );

//     const data = await response.json();

//     setDoctors(data);
//     setFilteredDoctors(data); // for filters later
//   } catch (error) {
//     console.error("Error searching doctors:", error);
//   } finally {
//     setSearchLoading(false);
//   }
// };


//   const fetchDoctorReview = async (doctorId) => {
//     try {
//       // You'll need to implement this in your appointment service
//       const response = await fetch(`/api/reviews/doctor/${doctorId}/summary`);
//       const data = await response.json();
//       setDoctorReviews(prev => ({
//         ...prev,
//         [doctorId]: {
//           averageRating: data.averageRating || 0,
//           totalReviews: data.totalReviews || 0
//         }
//       }));
//     } catch (error) {
//       console.error('Error fetching doctor review:', error);
//     }
//   };

//   const handleQuickBook = (doctor) => {
//     setSelectedDoctor(doctor);
//     setShowAppointmentModal(true);
//   };

//   const clearFilters = () => {
//     setFilters({
//       specialization: '',
//       experience: '',
//       rating: '',
//       feeRange: '',
//       availability: ''
//     });
//   };

//   const handleAppointmentSuccess = (appointment, receipt) => {
//     // Handle successful booking
//     console.log('Appointment booked:', appointment);
//     // You might want to show a success notification here
//   };

//   const DoctorCard = ({ doctor }) => {
//     const review = doctorReviews[doctor.id] || { averageRating: 0, totalReviews: 0 };
    
//     return (
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
//         {/* Doctor Header */}
//         <div className="p-6 border-b border-gray-100">
//           <div className="flex items-start gap-4">
//             {/* Avatar */}
//             <div className="relative">
//               <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
//                 {doctor.name?.charAt(0)}
//               </div>
//               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
//             </div>

//             {/* Basic Info */}
//             <div className="flex-1">
//               <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
//                 Dr. {doctor.name}
//               </h3>
//               <p className="text-sm text-indigo-600 font-medium flex items-center gap-1 mt-1">
//                 <Stethoscope size={14} />
//                 {doctor.specialization}
//               </p>
              
//               {/* Rating */}
//               <div className="flex items-center gap-2 mt-2">
//                 <div className="flex items-center">
//                   {[1, 2, 3, 4, 5].map((value) => (
//                     <Star
//                       key={value}
//                       size={14}
//                       className={
//                         review.averageRating >= value
//                           ? 'text-amber-500 fill-amber-500'
//                           : 'text-gray-300'
//                       }
//                     />
//                   ))}
//                 </div>
//                 <span className="text-xs text-gray-600">
//                   {review.averageRating.toFixed(1)} ({review.totalReviews} reviews)
//                 </span>
//               </div>
//             </div>

//             {/* Fee */}
//             <div className="text-right">
//               <div className="px-3 py-1 bg-emerald-50 rounded-lg">
//                 <span className="text-xs text-emerald-600">Consultation Fee</span>
//                 <p className="text-lg font-bold text-emerald-700">
//                   ₹{doctor.fee ?? doctor.consultationFee ?? 'N/A'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Doctor Details Grid */}
//         <div className="p-6 grid grid-cols-2 gap-4">
//           {/* Experience */}
//           <div className="flex items-center gap-2 text-sm">
//             <Award size={16} className="text-indigo-500" />
//             <span className="text-gray-600">Experience:</span>
//             <span className="font-medium text-gray-900">{doctor.experience || 'N/A'} years</span>
//           </div>

//           {/* Location */}
//           {doctor.clinicAddress && (
//             <div className="flex items-center gap-2 text-sm">
//               <MapPin size={16} className="text-rose-500" />
//               <span className="text-gray-600">Location:</span>
//               <span className="font-medium text-gray-900 truncate">{doctor.clinicAddress}</span>
//             </div>
//           )}

//           {/* Qualification */}
//           {doctor.qualification && (
//             <div className="flex items-center gap-2 text-sm">
//               <GraduationCap size={16} className="text-purple-500" />
//               <span className="text-gray-600">Qualification:</span>
//               <span className="font-medium text-gray-900">{doctor.qualification}</span>
//             </div>
//           )}

//           {/* Languages */}
//           {doctor.languages && (
//             <div className="flex items-center gap-2 text-sm">
//               <Globe size={16} className="text-blue-500" />
//               <span className="text-gray-600">Languages:</span>
//               <span className="font-medium text-gray-900">{doctor.languages}</span>
//             </div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         <div className="p-6 pt-0 flex gap-3">
//           <button
//             onClick={() => handleQuickBook(doctor)}
//             className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
//           >
//             <Calendar size={16} />
//             Book Appointment
//           </button>
//           <button
//             onClick={() => {/* View profile */}}
//             className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2"
//           >
//             <User size={16} />
//             Profile
//           </button>
//         </div>
//       </div>
//     );
//   };

//   const FilterSection = () => (
//     <div className="bg-white rounded-xl border border-gray-200 p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="font-semibold text-gray-900 flex items-center gap-2">
//           <Filter size={18} className="text-indigo-500" />
//           Filters
//         </h3>
//         <button
//           onClick={clearFilters}
//           className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
//         >
//           Clear all
//         </button>
//       </div>

//       {/* Specialization Filter */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Specialization
//         </label>
//         <select
//           value={filters.specialization}
//           onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
//           className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//         >
//           <option value="">All Specializations</option>
//           {specializations.map(spec => (
//             <option key={spec} value={spec}>{spec}</option>
//           ))}
//         </select>
//       </div>

//       {/* Experience Filter */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Experience
//         </label>
//         <select
//           value={filters.experience}
//           onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
//           className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//         >
//           <option value="">Any Experience</option>
//           <option value="0-5">0-5 years</option>
//           <option value="5-10">5-10 years</option>
//           <option value="10-15">10-15 years</option>
//           <option value="15+">15+ years</option>
//         </select>
//       </div>

//       {/* Rating Filter */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Minimum Rating
//         </label>
//         <select
//           value={filters.rating}
//           onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
//           className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//         >
//           <option value="">Any Rating</option>
//           <option value="4.5">4.5+ ★</option>
//           <option value="4">4+ ★</option>
//           <option value="3.5">3.5+ ★</option>
//           <option value="3">3+ ★</option>
//         </select>
//       </div>

//       {/* Fee Range Filter */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Consultation Fee
//         </label>
//         <select
//           value={filters.feeRange}
//           onChange={(e) => setFilters(prev => ({ ...prev, feeRange: e.target.value }))}
//           className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//         >
//           <option value="">Any Fee</option>
//           <option value="0-500">Under ₹500</option>
//           <option value="500-1000">₹500 - ₹1000</option>
//           <option value="1000-2000">₹1000 - ₹2000</option>
//           <option value="2000+">₹2000+</option>
//         </select>
//       </div>

//       {/* Availability Filter */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Availability
//         </label>
//         <div className="space-y-2">
//           {['Today', 'Tomorrow', 'This Week'].map(option => (
//             <label key={option} className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="availability"
//                 value={option}
//                 checked={filters.availability === option}
//                 onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
//                 className="text-indigo-600 focus:ring-indigo-500"
//               />
//               <span className="text-sm text-gray-700">{option}</span>
//             </label>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex items-center justify-between">
//             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//               <Heart className="text-indigo-600" size={28} />
//               Find a Doctor
//             </h1>
//             <div className="flex items-center gap-4">
//               <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
//                 <Bell size={20} className="text-gray-600" />
//                 <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
//               </button>
//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
//                   <User size={16} className="text-indigo-600" />
//                 </div>
//                 <span className="text-sm font-medium text-gray-700">{patient.name}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Search Section */}
//         <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
//           <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 relative">
//               <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 placeholder="Enter city"
//                 value={searchParams.city}
//                 onChange={(e) => setSearchParams(prev => ({ ...prev, city: e.target.value }))}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//               />
//             </div>
//             <div className="flex-1 relative">
//               <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 placeholder="Enter state"
//                 value={searchParams.state}
//                 onChange={(e) => setSearchParams(prev => ({ ...prev, state: e.target.value }))}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={searchLoading || !searchParams.city || !searchParams.state}
//               className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
//             >
//               {searchLoading ? (
//                 <>
//                   <Loader size={18} className="animate-spin" />
//                   Searching...
//                 </>
//               ) : (
//                 <>
//                   <Search size={18} />
//                   Search Doctors
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Recent Searches */}
//           {recentSearches.length > 0 && (
//             <div className="mt-4 flex items-center gap-3">
//               <span className="text-xs text-gray-500">Recent searches:</span>
//               <div className="flex gap-2">
//                 {recentSearches.map((search, index) => (
//                   <button
//                     key={index}
//                     onClick={() => {
//                       setSearchParams({ city: search.city, state: search.state });
//                       handleSearch();
//                     }}
//                     className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
//                   >
//                     {search.city}, {search.state}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Results Section */}
//         {doctors.length > 0 && (
//           <div className="flex flex-col lg:flex-row gap-8">
//             {/* Filters Sidebar */}
//             <div className="lg:w-80">
//               <FilterSection />
//             </div>

//             {/* Doctor Listings */}
//             <div className="flex-1">
//               {/* Results Header */}
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900">
//                     {filteredDoctors.length} Doctors Found
//                   </h2>
//                   <p className="text-sm text-gray-500">
//                     in {searchParams.city}, {searchParams.state}
//                   </p>
//                 </div>
//                 <select
//                   className="p-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
//                   onChange={(e) => {
//                     const sorted = [...filteredDoctors];
//                     switch(e.target.value) {
//                       case 'rating':
//                         sorted.sort((a, b) => 
//                           (doctorReviews[b.id]?.averageRating || 0) - 
//                           (doctorReviews[a.id]?.averageRating || 0)
//                         );
//                         break;
//                       case 'fee_low':
//                         sorted.sort((a, b) => 
//                           (a.fee || a.consultationFee || 0) - 
//                           (b.fee || b.consultationFee || 0)
//                         );
//                         break;
//                       case 'fee_high':
//                         sorted.sort((a, b) => 
//                           (b.fee || b.consultationFee || 0) - 
//                           (a.fee || a.consultationFee || 0)
//                         );
//                         break;
//                       case 'experience':
//                         sorted.sort((a, b) => 
//                           (b.experience || 0) - (a.experience || 0)
//                         );
//                         break;
//                     }
//                     setFilteredDoctors(sorted);
//                   }}
//                 >
//                   <option value="">Sort by: Relevance</option>
//                   <option value="rating">Highest Rated</option>
//                   <option value="fee_low">Fee: Low to High</option>
//                   <option value="fee_high">Fee: High to Low</option>
//                   <option value="experience">Most Experienced</option>
//                 </select>
//               </div>

//               {/* Doctor Cards */}
//               <div className="space-y-4">
//                 {filteredDoctors.map(doctor => (
//                   <DoctorCard key={doctor.id} doctor={doctor} />
//                 ))}
//               </div>

//               {/* No Results */}
//               {filteredDoctors.length === 0 && (
//                 <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <AlertCircle size={24} className="text-gray-400" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
//                   <p className="text-sm text-gray-500 mb-4">
//                     Try adjusting your filters or search criteria
//                   </p>
//                   <button
//                     onClick={clearFilters}
//                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {!searchLoading && doctors.length === 0 && (
//           <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Search size={32} className="text-indigo-500" />
//             </div>
//             <h2 className="text-2xl font-semibold text-gray-900 mb-3">
//               Find the Right Doctor for You
//             </h2>
//             <p className="text-gray-500 max-w-md mx-auto mb-8">
//               Search by city and state to find experienced doctors near you. Book appointments instantly.
//             </p>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <MapPin size={20} className="text-indigo-600" />
//                 </div>
//                 <h3 className="font-medium text-gray-900 mb-1">Search Location</h3>
//                 <p className="text-xs text-gray-500">Enter your city and state to find nearby doctors</p>
//               </div>
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <Filter size={20} className="text-indigo-600" />
//                 </div>
//                 <h3 className="font-medium text-gray-900 mb-1">Filter Results</h3>
//                 <p className="text-xs text-gray-500">Filter by specialization, experience, and fees</p>
//               </div>
//               <div className="text-center">
//                 <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
//                   <Calendar size={20} className="text-indigo-600" />
//                 </div>
//                 <h3 className="font-medium text-gray-900 mb-1">Book Instantly</h3>
//                 <p className="text-xs text-gray-500">Select available slots and confirm your appointment</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Appointment Modal */}
//       {showAppointmentModal && selectedDoctor && (
//         <NewAppointmentModal
//           isOpen={showAppointmentModal}
//           onClose={() => {
//             setShowAppointmentModal(false);
//             setSelectedDoctor(null);
//           }}
//           onSuccess={handleAppointmentSuccess}
//           doctors={[selectedDoctor]}
//           patient={patient}
//           patientDetails={patientDetails}
//         />
//       )}
//     </div>
//   );
// };

// export default DoctorSearchPage;



import { useState } from "react";

const DoctorSearchPage = () => {
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
    e.preventDefault();

    if (!city || !stateName) {
      alert("Please enter city and state");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:8080/api/doctors/search?city=${city}&state=${stateName}`
      );

      const data = await response.json();

      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

    return (
    <div>
      <h2>Search Doctors</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter State"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>

            {loading && <p>Loading...</p>}

      {doctors.length === 0 && !loading && <p>No doctors found</p>}

      {doctors.map((doctor) => (
        <div key={doctor.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
          <h3>{doctor.specializationName}</h3>
          <p>Experience: {doctor.experienceYear} years</p>
          <p>Fee: ₹{doctor.consultationFee}</p>
          <p>Clinic: {doctor.clinicAddress}</p>
          <p>Timing: {doctor.availabilityStartTime} - {doctor.availabilityEndTime}</p>
        </div>
      ))}
    </div>
  );
};

export default DoctorSearchPage;