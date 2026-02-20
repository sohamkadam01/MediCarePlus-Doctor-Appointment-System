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
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IntroPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect for navbar
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
      desc: "Comprehensive health checkups and diagnosis with expert general practitioners.",
      icon: <Stethoscope className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-50"
    },
    {
      title: "Specialized Care",
      desc: "Access to top-tier specialists in cardiology, neurology, pediatrics, and more.",
      icon: <HeartPulse className="w-8 h-8 text-red-600" />,
      color: "bg-red-50"
    },
    {
      title: "24/7 Monitoring",
      desc: "Real-time health tracking and emergency support available around the clock.",
      icon: <Activity className="w-8 h-8 text-green-600" />,
      color: "bg-green-50"
    }
  ];

  const featuredDoctors = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Pediatrician",
      rating: 4.8,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      name: "Dr. Elena Rodriguez",
      specialty: "Neurologist",
      rating: 5.0,
      reviews: 56,
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200"
    }
  ];

  const testimonials = [
    {
      name: "Robert Thompson",
      role: "Patient",
      content: "The best healthcare platform I've ever used. Easy appointment booking and great doctors!",
      rating: 5,
      image: "https://i.pravatar.cc/100?u=1"
    },
    {
      name: "Maria Garcia",
      role: "Patient",
      content: "Quick response and professional service. Highly recommended for everyone.",
      rating: 5,
      image: "https://i.pravatar.cc/100?u=2"
    },
    {
      name: "David Kim",
      role: "Patient",
      content: "Saved so much time with online consultations. The doctors are very knowledgeable.",
      rating: 5,
      image: "https://i.pravatar.cc/100?u=3"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <PlusIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-blue-900">MediCarePlus</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Home</a>
            <a href="#services" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Services</a>
            <a href="#doctors" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Doctors</a>
            <a href="#about" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">About</a>
            <a href="#contact" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Contact</a>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-3 ml-4">
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-xl">
            <a href="#home" className="block py-2 text-slate-600 font-medium">Home</a>
            <a href="#services" className="block py-2 text-slate-600 font-medium">Services</a>
            <a href="#doctors" className="block py-2 text-slate-600 font-medium">Doctors</a>
            <a href="#about" className="block py-2 text-slate-600 font-medium">About</a>
            <a href="#contact" className="block py-2 text-slate-600 font-medium">Contact</a>
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <button 
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-xl font-semibold"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-blue-50 rounded-bl-[100px] hidden lg:block"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <Shield className="w-4 h-4" />
                Trusted by over 20,000+ patients
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                Your Health is Our <span className="text-blue-600">Top Priority</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                Connect with the world's best doctors and get high-quality healthcare 
                services from the comfort of your home. Easy booking, instant confirmation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 group"
                >
                  Get Started <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-blue-400 hover:text-blue-600 transition-all">
                  How it Works
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-3xl font-bold text-blue-900">500+</div>
                  <div className="text-sm text-slate-500 font-medium">Expert Doctors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-900">15+</div>
                  <div className="text-sm text-slate-500 font-medium">Specializations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-900">4.9/5</div>
                  <div className="text-sm text-slate-500 font-medium">Patient Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
                  alt="Doctor with patient"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Next Available</div>
                  <div className="text-sm font-bold text-slate-900">Today, 4:30 PM</div>
                </div>
              </div>
              <div className="absolute top-1/2 -right-8 z-20 bg-white p-4 rounded-2xl shadow-xl hidden md:flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="avatar" />
                    </div>
                  ))}
                </div>
                <div className="text-xs font-bold text-slate-700">+12k Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="relative -mt-12 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white p-4 md:p-6 rounded-[32px] shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
              <Search className="text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search doctors, clinics..." className="bg-transparent border-none focus:ring-0 w-full font-medium" />
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
              <MapPin className="text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Your Location" className="bg-transparent border-none focus:ring-0 w-full font-medium" />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200">
              Search Now
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm">Our Services</h2>
            <h3 className="text-4xl font-bold text-slate-900">High Quality Healthcare Services</h3>
            <p className="text-slate-600">We offer a wide range of medical services designed to meet your needs and help you live a healthier life.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
                <div className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold mb-4 text-slate-900">{service.title}</h4>
                <p className="text-slate-600 leading-relaxed mb-6">{service.desc}</p>
                <a href="#" className="inline-flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all">
                  Learn More <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section id="doctors" className="py-24 bg-blue-900 text-white rounded-[60px] mx-4 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl space-y-4">
              <h2 className="text-blue-300 font-bold tracking-widest uppercase text-sm">Top Specialists</h2>
              <h3 className="text-4xl font-bold">Consult with Our Professional Doctors</h3>
            </div>
            <button className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors">
              View All Doctors
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredDoctors.map((doc, idx) => (
              <div key={idx} className="bg-blue-800/50 backdrop-blur-sm p-6 rounded-[32px] border border-blue-700/50 hover:bg-blue-800 transition-all">
                <div className="relative mb-6">
                  <img src={doc.image} alt={doc.name} className="w-full h-64 object-cover rounded-2xl" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-blue-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {doc.rating}
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-1">{doc.name}</h4>
                <p className="text-blue-200 text-sm mb-4">{doc.specialty}</p>
                <div className="flex items-center justify-between pt-4 border-t border-blue-700">
                  <span className="text-blue-300 text-xs font-medium">{doc.reviews} Reviews</span>
                  <button className="bg-blue-600 hover:bg-blue-500 p-2 rounded-xl transition-colors">
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm">Testimonials</h2>
            <h3 className="text-4xl font-bold text-slate-900">What Our Patients Say</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-[60px] mx-4 lg:mx-8 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Health Journey?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of satisfied patients who trust us with their health.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl"
            >
              Create Free Account
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 mt-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1 rounded-md">
                  <PlusIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-blue-900">MediCarePlus</span>
              </div>
              <p className="text-slate-500 text-sm">Your trusted partner in healthcare, providing quality medical services since 2020.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><a href="#home" className="hover:text-blue-600">Home</a></li>
                <li><a href="#services" className="hover:text-blue-600">Services</a></li>
                <li><a href="#doctors" className="hover:text-blue-600">Doctors</a></li>
                <li><a href="#about" className="hover:text-blue-600">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">For Patients</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li><button onClick={() => navigate('/login')} className="hover:text-blue-600">Login</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-blue-600">Register</button></li>
                <li><a href="#" className="hover:text-blue-600">Book Appointment</a></li>
                <li><a href="#" className="hover:text-blue-600">Find a Doctor</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li>Phone: +1 234 567 890</li>
                <li>Email: info@medicareplus.com</li>
                <li>Address: 123 Health Street, Medical City</li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-slate-200">
            <p className="text-slate-500 text-sm">(c) 2024 MediCarePlus Healthcare Systems. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

// Simple Plus Icon Component
const PlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default IntroPage;
