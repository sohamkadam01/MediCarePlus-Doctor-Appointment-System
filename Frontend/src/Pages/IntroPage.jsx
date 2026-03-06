import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Shield, 
  MapPin, 
  Star, 
  ChevronRight, 
  Menu, 
  X,
  HeartPulse,
  Stethoscope,
  Activity,
  LogIn,
  UserPlus,
  ArrowRight,
  CheckCircle,
  Clock,
  Award,
  Phone,
  Mail,
  MapPinned,
  Globe2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IntroPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      title: "General Consultation",
      desc: "Connect with top general practitioners for comprehensive health checkups and diagnosis.",
      icon: <Stethoscope className="w-8 h-8" />,
      gradient: "from-emerald-400 to-teal-500",
      lightGradient: "from-emerald-50 to-teal-50",
      stats: "24/7 Available"
    },
    {
      title: "Specialized Care",
      desc: "Expert specialists in cardiology, neurology, pediatrics, and 15+ other fields.",
      icon: <HeartPulse className="w-8 h-8" />,
      gradient: "from-rose-400 to-pink-500",
      lightGradient: "from-rose-50 to-pink-50",
      stats: "50+ Specialists"
    },
    {
      title: "24/7 Monitoring",
      desc: "Round-the-clock health tracking with instant emergency response system.",
      icon: <Activity className="w-8 h-8" />,
      gradient: "from-blue-400 to-indigo-500",
      lightGradient: "from-blue-50 to-indigo-50",
      stats: "Real-time Alerts"
    }
  ];

  const featuredDoctors = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 124,
      experience: "15+ years",
      patients: "2.5k+",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200",
      available: true,
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Pediatrician",
      rating: 4.8,
      reviews: 89,
      experience: "12+ years",
      patients: "1.8k+",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200",
      available: true,
      gradient: "from-emerald-400 to-teal-500"
    },
    {
      name: "Dr. Elena Rodriguez",
      specialty: "Neurologist",
      rating: 5.0,
      reviews: 56,
      experience: "10+ years",
      patients: "1.2k+",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200",
      available: false,
      gradient: "from-purple-400 to-pink-500"
    },
    {
      name: "Dr. James Wilson",
      specialty: "Dermatologist",
      rating: 4.9,
      reviews: 92,
      experience: "14+ years",
      patients: "2.1k+",
      image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200",
      available: true,
      gradient: "from-amber-400 to-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "Robert Thompson",
      role: "Patient since 2023",
      content: "The platform made it incredibly easy to find the right specialist. The video consultation was seamless, and the doctor was very thorough.",
      rating: 5,
      image: "https://i.pravatar.cc/100?u=1",
      condition: "Heart Health",
      gradient: "from-rose-50 to-pink-50"
    },
    {
      name: "Maria Garcia",
      role: "Patient since 2022",
      content: "I love how I can manage all my family's health records in one place. The reminder system ensures we never miss an appointment.",
      rating: 5,
      image: "https://i.pravatar.cc/100?u=2",
      condition: "Family Care",
      gradient: "from-blue-50 to-indigo-50"
    },
    {
      name: "David Kim",
      role: "Patient since 2023",
      content: "The 24/7 chat support is amazing. I got immediate advice for my child's fever late at night. Truly a lifesaver!",
      rating: 5,
      image: "https://i.pravatar.cc/100?u=3",
      condition: "Pediatric Care",
      gradient: "from-emerald-50 to-teal-50"
    }
  ];

  const stats = [
    { icon: <Award className="w-6 h-6" />, value: "500+", label: "Expert Doctors", gradient: "from-blue-50 to-indigo-50", color: "text-blue-600" },
    { icon: <Globe2 className="w-6 h-6" />, value: "15+", label: "Specializations", gradient: "from-emerald-50 to-teal-50", color: "text-emerald-600" },
    { icon: <CheckCircle className="w-6 h-6" />, value: "50k+", label: "Happy Patients", gradient: "from-purple-50 to-pink-50", color: "text-purple-600" },
    { icon: <Clock className="w-6 h-6" />, value: "24/7", label: "Support Available", gradient: "from-amber-50 to-orange-50", color: "text-amber-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-white font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg py-3 border-b border-blue-100/50' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl">
                <PlusIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">MediCare</span>
              <span className="text-gray-700">Plus</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Services', 'Doctors', 'About', 'Contact'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-600 hover:text-blue-600 font-medium transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
            
            <div className="flex items-center gap-3 ml-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 text-blue-600 font-semibold hover:text-blue-700 transition-colors relative group"
              >
                Login
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 hover:shadow-xl hover:shadow-blue-200/50 transition-all">
                  <UserPlus className="w-4 h-4" />
                  Sign Up Free
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-lg transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-60'}`}></div>
            <div className="relative bg-white rounded-xl p-2 shadow-lg">
              {isMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-blue-100 shadow-xl animate-slideDown">
            <div className="p-6 space-y-4">
              {['Home', 'Services', 'Doctors', 'About', 'Contact'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block py-3 text-gray-700 font-medium hover:text-blue-600 transition-colors border-b border-blue-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              
              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 text-blue-600 border-2 border-blue-200 bg-blue-50/50 px-6 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button 
                  onClick={() => { navigate('/register'); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200/50 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up Free
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements with softer colors */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-100/70 via-cyan-100/50 to-transparent rounded-bl-[100px] -z-10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 text-blue-700 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-blue-200/50 shadow-lg shadow-blue-100/30 animate-pulse-slow">
                <Shield className="w-4 h-4" />
                Trusted by 50,000+ patients worldwide
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Your Health,
                </span>
                <br />
                <span className="text-gray-900">Our Priority</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Experience healthcare reimagined. Connect with world-class doctors, 
                get instant consultations, and manage your health journey all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-blue-200/50 transition-all">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
                
                <button className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all group">
                  <PlayIcon className="w-5 h-5" />
                  How It Works
                </button>
              </div>

              {/* Stats Grid with softer colors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center group cursor-pointer">
                    <div className={`inline-flex p-3 bg-gradient-to-br ${stat.gradient} rounded-2xl ${stat.color} mb-2 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Main Image with soft glow */}
              <div className="relative z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-[40px] blur-2xl opacity-50"></div>
                <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white/80">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
                    alt="Medical consultation"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              {/* Floating Cards with softer colors */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-float border border-blue-100">
                <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-3 rounded-xl shadow-lg shadow-emerald-200/50">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase">Next Available</div>
                  <div className="text-sm font-bold text-gray-900">Today, 4:30 PM</div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-2xl hidden md:flex items-center gap-3 animate-float animation-delay-1000 border border-purple-100">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-cyan-400 overflow-hidden shadow-md">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-gray-700">12k+ Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar with softer colors */}
      <section className="relative -mt-12 z-30 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-[32px] shadow-2xl border border-blue-100/50 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100/50 transition-all">
              <Search className="text-blue-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search doctors, specialties..." 
                className="bg-transparent border-none focus:ring-0 w-full font-medium placeholder:text-gray-400"
              />
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-cyan-50/30 rounded-2xl border border-gray-200 focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-100/50 transition-all">
              <MapPin className="text-cyan-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Your location" 
                className="bg-transparent border-none focus:ring-0 w-full font-medium placeholder:text-gray-400"
              />
            </div>
            <button className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-200/50 transition-all">
                Search
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Services Section with softer colors */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 text-blue-600 rounded-full text-sm font-bold mb-4 backdrop-blur-sm border border-blue-200/50">
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare
            </h2>
            <p className="text-gray-600 text-lg">
              From routine checkups to specialized care, we've got you covered with our range of medical services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white p-8 rounded-[32px] border border-gray-200 hover:border-transparent transition-all duration-500 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${service.lightGradient} rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                  {service.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-4">
                  {service.desc}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-gray-500">{service.stats}</span>
                  <button className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section with softer gradient */}
      <section id="doctors" className="py-24 bg-gradient-to-br from-blue-900/95 via-blue-800/95 to-cyan-800/95 text-white rounded-[60px] mx-4 lg:mx-8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-4 border border-white/30">
                Top Specialists
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Consult with Expert Doctors
              </h2>
              <p className="text-blue-100/90 text-lg">
                Choose from our network of experienced specialists across 15+ medical fields.
              </p>
            </div>
            
            {/* Specialty Tabs with softer colors */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Cardiology', 'Pediatrics', 'Neurology', 'Dermatology'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all backdrop-blur-sm ${
                    activeTab === tab.toLowerCase()
                      ? 'bg-white text-blue-900 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white/10 backdrop-blur-sm rounded-[32px] p-6 border border-white/30 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${doc.gradient} rounded-[32px] opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative mb-4">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 
                    {doc.rating}
                  </div>
                  <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                    doc.available 
                      ? 'bg-emerald-500/90 text-white border border-emerald-300' 
                      : 'bg-gray-500/90 text-white border border-gray-400'
                  }`}>
                    {doc.available ? 'Available Today' : 'Next Available Tomorrow'}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-1">{doc.name}</h3>
                <p className="text-blue-200 text-sm mb-3">{doc.specialty}</p>
                
                <div className="flex justify-between text-sm text-blue-200 mb-4">
                  <span>Exp: {doc.experience}</span>
                  <span>{doc.patients} patients</span>
                </div>
                
                <button className="w-full bg-white/20 hover:bg-white text-white hover:text-blue-900 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group backdrop-blur-sm border border-white/30">
                  <Calendar className="w-4 h-4" />
                  Book Consultation
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all group shadow-xl">
              View All Doctors
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section with softer colors */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100/80 to-pink-100/80 text-purple-600 rounded-full text-sm font-bold mb-4 backdrop-blur-sm border border-purple-200/50">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-gray-600 text-lg">
              Real stories from real people who've experienced our care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white p-8 rounded-[32px] border border-gray-200 hover:border-transparent transition-all duration-500 hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-bl-[32px] rounded-tr-[32px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6 text-lg relative z-10">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-100 shadow-lg"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <span className={`inline-block mt-1 text-xs font-medium text-blue-600 bg-gradient-to-r ${testimonial.gradient} px-2 py-1 rounded-full border border-blue-200`}>
                      {testimonial.condition}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with softer gradient */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500">
          <div className="absolute inset-0 bg-grid-white/5 bg-grid-16"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-blue-100 text-xl mb-8">
            Join thousands of satisfied patients who trust us with their health.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="group relative bg-white px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden shadow-xl"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-cyan-700 transition-colors">
                Create Free Account
              </span>
            </button>
            
            <button className="bg-transparent border-2 border-white/80 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
              <Phone className="w-5 h-5" />
              Contact Sales
            </button>
          </div>
          
          <p className="text-blue-200 mt-6 text-sm">
            No credit card required • Free 30-day trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer with softer colors */}
     {/* Footer with softer colors */}
<footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-16 pb-8">
  <div className="max-w-7xl mx-auto px-4">
    <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
      {/* Brand Column */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-3 mb-4 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-xl opacity-60"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-xl">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MediCare</span>
            <span className="text-gray-300">Plus</span>
          </span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-md">
          Revolutionizing healthcare access through technology. Connect with top doctors, manage your health, and live better.
        </p>
        <div className="flex gap-4">
          {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
            <a 
              key={social} 
              href="#" 
              className="w-10 h-10 bg-gray-800/80 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 transition-all group border border-gray-700"
            >
              <SocialIcon social={social} className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </a>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h4 className="font-bold text-lg mb-4 text-gray-200">Quick Links</h4>
        <ul className="space-y-3 text-gray-400">
          <li><a href="#home" className="hover:text-blue-400 transition-colors">Home</a></li>
          <li><a href="#services" className="hover:text-blue-400 transition-colors">Services</a></li>
          <li><a href="#doctors" className="hover:text-blue-400 transition-colors">Doctors</a></li>
          <li><a href="#about" className="hover:text-blue-400 transition-colors">About Us</a></li>
          <li><a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
        </ul>
      </div>

      {/* For Patients */}
      <div>
        <h4 className="font-bold text-lg mb-4 text-gray-200">For Patients</h4>
        <ul className="space-y-3 text-gray-400">
          <li><button onClick={() => navigate('/login')} className="hover:text-blue-400 transition-colors">Login</button></li>
          <li><button onClick={() => navigate('/register')} className="hover:text-blue-400 transition-colors">Register</button></li>
          <li><a href="#" className="hover:text-blue-400 transition-colors">Book Appointment</a></li>
          <li><a href="#" className="hover:text-blue-400 transition-colors">Find a Doctor</a></li>
          <li><a href="#" className="hover:text-blue-400 transition-colors">Health Blog</a></li>
        </ul>
      </div>

      {/* For Laboratories - New Column */}
      <div>
        <h4 className="font-bold text-lg mb-4 text-gray-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 4v2a5 5 0 01-10 0V8l-1-4h8z" />
          </svg>
          For Laboratories
        </h4>
        <ul className="space-y-3 text-gray-400">
          <li>
            <button 
              onClick={() => navigate('/lab/registration')} 
              className="hover:text-blue-400 transition-colors flex items-center gap-2 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Partner with us
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('/lab/login')} 
              className="hover:text-blue-400 transition-colors flex items-center gap-2 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Lab Login
            </button>
          </li>
          <li>
            <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Integration Guide
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Partner Benefits
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              Success Stories
            </a>
          </li>
          <li className="pt-2">
            <button 
              onClick={() => navigate('/lab/enrollment')}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Enroll Your Lab
            </button>
          </li>
        </ul>
      </div>

      {/* Contact Info */}
      <div>
        <h4 className="font-bold text-lg mb-4 text-gray-200">Contact Us</h4>
        <ul className="space-y-3 text-gray-400">
          <li className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-blue-400" />
            <span>+1 (888) 123-4567</span>
          </li>
          <li className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-400" />
            <span>care@medicareplus.com</span>
          </li>
          <li className="flex items-center gap-3">
            <MapPinned className="w-5 h-5 text-blue-400" />
            <span>123 Health Ave, Medical District, NY 10001</span>
          </li>
          <li className="pt-3">
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>partners@medicareplus.com</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    {/* Laboratory Partnership Banner */}
    <div className="mb-8 p-4 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl border border-blue-800/50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 4v2a5 5 0 01-10 0V8l-1-4h8z" />
            </svg>
          </div>
          <div>
            <h5 className="text-white font-medium">Are you a laboratory?</h5>
            <p className="text-xs text-gray-400">Join our network of trusted diagnostic partners</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/lab/learn-more')}
            className="px-4 py-2 text-sm text-white border border-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            Learn More
          </button>
          <button 
            onClick={() => navigate('/lab/enrollment')}
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Enroll Now
          </button>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="pt-8 border-t border-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 text-sm">
          © 2024 MediCarePlus Healthcare Systems. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Partner Terms</a>
        </div>
      </div>
    </div>
  </div>
</footer>
      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .bg-grid-white {
          background-image: linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
        }
        
        .bg-grid-16 {
          background-size: 40px 40px;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

// Helper Components
const PlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const PlayIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const SocialIcon = ({ social, className }) => {
  const icons = {
    facebook: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
    twitter: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
      </svg>
    ),
    linkedin: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    instagram: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    )
  };
  
  return icons[social] || null;
};

export default IntroPage;
