import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Phone, Beaker, ArrowRight, Star, Clock, Award, ChevronRight } from 'lucide-react';
import labService from '../services/LabService';

const LabsList = () => {
  const [labs, setLabs] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadLabs = async () => {
      try {
        setLoading(true);
        const data = await labService.getLabs();
        if (isMounted) setLabs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) setError(err?.message || 'Failed to load labs.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadLabs();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLabs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let filtered = labs;
    
    // Apply search filter
    if (needle) {
      filtered = filtered.filter((lab) => {
        const name = String(lab?.name || '').toLowerCase();
        const address = String(lab?.address || '').toLowerCase();
        const city = String(lab?.city || '').toLowerCase();
        return name.includes(needle) || address.includes(needle) || city.includes(needle);
      });
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(lab => {
        if (filterType === 'pathology') return lab.type === 'pathology';
        if (filterType === 'radiology') return lab.type === 'radiology';
        if (filterType === 'wellness') return lab.tests?.length > 20;
        if (filterType === '24x7') return lab.is247 === true;
        return true;
      });
    }
    
    return filtered;
  }, [labs, query, filterType]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                <Award size={16} />
                <span className="font-medium">NABL Accredited Labs</span>
              </div>
              <h1 className="text-3xl font-medium text-gray-900">
                Find diagnostic labs near you
              </h1>
              <p className="text-gray-500 mt-1">
                Browse {labs.length}+ certified labs and book tests online
              </p>
            </div>

            {/* Search Bar - Google Style */}
            <div className="w-full md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search labs by name or location"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span className="text-sm text-gray-500 mr-2">Quick filters:</span>
            {[
              { key: 'all', label: 'All Labs', icon: Beaker },
              { key: 'pathology', label: 'Pathology', icon: Beaker },
              { key: 'radiology', label: 'Radiology', icon: Beaker },
              { key: 'wellness', label: 'Wellness Packages', icon: Award },
              { key: '24x7', label: '24/7 Available', icon: Clock }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`
                  inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${filterType === filter.key 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <filter.icon size={16} />
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load labs</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{filteredLabs.length}</span> labs
            </p>
            <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option>Sort by: Recommended</option>
              <option>Sort by: Name A-Z</option>
              <option>Sort by: Most Tests</option>
              <option>Sort by: Rating</option>
            </select>
          </div>
        )}

        {/* Labs Grid */}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLabs.map((lab) => (
              <div
                key={lab.id}
                onClick={() => navigate(`/labs/${lab.id}`)}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              >
                {/* Lab Header with Gradient */}
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* Lab Icon/Logo */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <Beaker className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-700">4.5</span>
                    </div>
                  </div>

                  {/* Lab Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {lab.name}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-start gap-2 mt-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{lab.address}</span>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{lab.contact}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        <Beaker className="w-3 h-3" />
                        {lab.tests?.length || 0} Tests
                      </span>
                      {lab.is247 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                          <Clock className="w-3 h-3" />
                          24/7
                        </span>
                      )}
                      {lab.accredited && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                          <Award className="w-3 h-3" />
                          NABL
                        </span>
                      )}
                    </div>

                    {/* View Details Link */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Click to view details</span>
                      <div className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                        View Lab
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredLabs.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Beaker className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No labs found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any labs matching your search criteria. Try adjusting your filters.
            </p>
            <button 
              onClick={() => {
                setQuery('');
                setFilterType('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button - Google Style */}
      <button className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all group">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need help?
        </span>
      </button>
    </div>
  );
};

export default LabsList;