import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/images/Logo.jpeg';

const Feature = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('access_token'));
  useEffect(() => {
    const onStorage = () => setIsAuth(!!localStorage.getItem('access_token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const [templateDropdownVisible, setTemplateDropdownVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.fade-in-up');
    animateElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      observer.observe(el);
    });
  }, []);

  useEffect(() => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 100);
  }, []);

  let hideTimeout;
  const handleMouseEnter = () => {
    clearTimeout(hideTimeout);
    setTemplateDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeout = setTimeout(() => {
      setTemplateDropdownVisible(false);
    }, 200);
  };

  return (
    <>
      <style>
        {`
          /* Custom animations */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          
          /* Professional card hover effects */
          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          /* Professional button styles */
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
            color: #fff;
          }
          
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          }
          
          /* Smooth scroll behavior */
          html {
            scroll-behavior: smooth;
          }
          
          /* Professional typography */
          .text-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          /* Staggered animation delays */
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
          .delay-600 { animation-delay: 0.6s; }

          /* Highlight targeted feature cards */
          .feature-card:target {
            animation: highlightCard 3s ease-in-out forwards;
          }

          /* Hover effect for feature cards */
          .feature-card:hover {
            box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 20px rgba(59, 130, 246, 0.4) !important;
            transition: all 0.3s ease;
          }

          @keyframes highlightCard {
            0% { 
              transform: scale(1);
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }
            10% { 
              transform: scale(1.02);
              box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 20px rgba(59, 130, 246, 0.4);
            }
            70% { 
              transform: scale(1);
              box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 20px rgba(59, 130, 246, 0.4);
            }
            100% { 
              transform: scale(1);
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }
          }
        `}
      </style>
      <div className="bg-white text-gray-900 font-sans">

        {/* Professional Navbar */}
        <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <img
                      src={Logo}
                              alt="College Logo"
                              className="w-14 h-14 rounded object-cover border border-teal-200 bg-teal-50 shadow-lg mb-2"
                            />
                    <h1 className="text-2xl font-bold text-gradient">CampusNotify</h1>
                  </div>
                </div>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <Link to="/home" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Home</Link>



                  <Link to="/feature" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Features</Link>
                  <Link to="/tutorial" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Tutorial</Link>
                  <Link to="/contact" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Contact</Link>
                  {isAuth ? (
                    <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Dashboard</Link>
                  ) : (
                    <>
                      <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Login</Link>
                      <Link to="/signup" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Sign Up</Link>
                    </>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <div className="hidden md:block">
                <a href="#" className="btn-primary text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg" onClick={() => navigate(isAuth ? '/dashboard' : '/login')}>
                  Get Started
                </a>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button id="menu-toggle" className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 transition-colors duration-200" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div id="mobile-menu" className={`md:hidden ${mobileMenuOpen ? '' : 'hidden'}`}>
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                <a href="#home" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Home</a>
                <div className="px-3 py-2">
                  <span className="text-gray-900 font-semibold text-base">Templates</span>
                  <div className="mt-2 space-y-1 pl-4">
                    <a href="#" className="text-gray-600 hover:text-primary-600 block py-1 text-sm transition-colors duration-200">Notice Templates</a>
                    <a href="#" className="text-gray-600 hover:text-primary-600 block py-1 text-sm transition-colors duration-200">Event Templates</a>
                    <a href="#" className="text-gray-600 hover:text-primary-600 block py-1 text-sm transition-colors duration-200">Exam Templates</a>
                    <a href="#" className="text-gray-600 hover:text-primary-600 block py-1 text-sm transition-colors duration-200">Circular Templates</a>
                  </div>
                </div>
                <Link to="/feature" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Features</Link>
                <Link to="/home#tutorial" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Tutorial</Link>
                <Link to="/contact" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Contact</Link>
                <div className="px-3 py-2">
                  <a href="#" className="btn-primary text-white block text-center px-4 py-2 rounded-lg text-sm font-medium shadow-lg" onClick={() => navigate(isAuth ? '/dashboard' : '/login')}>
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Professional Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-primary-50 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center px-6 py-2 rounded-full bg-blue-200 text-blue-700 text-sm font-medium mb-8 shadow-md">
                <i className="fas fa-star mr-2"></i>
                Powerful Features
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Everything You Need for
                <span className="text-gradient block">Professional Communication</span>
              </h1>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
                Streamline your campus communication with our comprehensive suite of tools designed for modern educational institutions.
              </p>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              
              {/* Feature 1: Smart Templates */}
              <div id="smart-templates" className="feature-card bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100 fade-in-up delay-100">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-file-alt text-primary-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Templates</h3>
                <p className="text-gray-600 mb-4">
                  Choose from professionally designed templates for notices, events, exams, and circulars. Customize to match your institution's branding with ease.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>10+ pre-designed templates</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Custom branding options</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Drag-and-drop editor</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Multi-format export (PDF, PNG, JPG)</li>
                </ul>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-check-circle text-green-500 mr-1"></i>
                  Professional Design Library
                </div>
              </div>

              {/* Feature 2: Role-Based Access */}
              <div id="role-based-access" className="feature-card bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100 fade-in-up delay-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-users-cog text-green-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Role-Based Access</h3>
                <p className="text-gray-600 mb-4">
                  Secure permission system allowing different access levels for administrators, faculty, and staff members with comprehensive audit trails.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Multi-level permission system</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Department-wise access control</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Comprehensive audit logs</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Activity monitoring & reporting</li>
                </ul>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-shield-alt text-green-500 mr-1"></i>
                  Enterprise Security
                </div>
              </div>

              {/* Feature 3: Staff Management */}
              <div id="staff-management" className="feature-card bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100 fade-in-up delay-300">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-user-friends text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Staff Management</h3>
                <p className="text-gray-600 mb-4">
                  Efficiently manage team members, assign responsibilities, and track notice creation activities across all departments and divisions.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Unlimited user accounts</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Department-wise organization</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Task assignment & tracking</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Performance analytics</li>
                </ul>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-users text-orange-500 mr-1"></i>
                  Unlimited Users
                </div>
              </div>

              {/* Feature 4: Digital Archive */}
              <div id="digital-archive" className="feature-card bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100 fade-in-up delay-400">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-archive text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Digital Archive</h3>
                <p className="text-gray-600 mb-4">
                  Automatically archive all notices with powerful search capabilities. Maintain compliance and historical records effortlessly with cloud storage.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Automatic cloud backup</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Advanced search & filtering</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Compliance reporting</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Version history tracking</li>
                </ul>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-cloud text-purple-500 mr-1"></i>
                  Cloud Storage
                </div>
              </div>

              {/* Feature 5: Multi-Language Support */}
              <div id="multi-language-support" className="feature-card bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100 fade-in-up delay-500">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-globe text-blue-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Language Support</h3>
                <p className="text-gray-600 mb-4">
                  Create notices in multiple languages to serve diverse campus communities. Automatic translation assistance and RTL support available.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>2+ supported languages</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Auto-translation assistance</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>RTL language support</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Unicode font compatibility</li>
                </ul>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-language text-blue-500 mr-1"></i>
                  2+ Languages
                </div>
              </div>

              {/* Feature 6: Analytics & Insights */}
              <div id="analytics-insights" className="feature-card bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100 fade-in-up delay-600">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-chart-line text-indigo-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Insights</h3>
                <p className="text-gray-600 mb-4">
                  Track notice engagement, delivery rates, and audience reach with comprehensive analytics and detailed reporting tools for data-driven decisions.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Real-time engagement metrics</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Delivery rate tracking</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Custom report generation</li>
                  <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Data export capabilities</li>
                </ul>
                <div className="text-sm text-gray-500">
                  <i className="fas fa-chart-bar text-indigo-500 mr-1"></i>
                  Real-time Data
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Advanced Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-2 rounded-full bg-blue-200 text-blue-700 text-sm font-medium mb-8 shadow-md">
                <i className="fas fa-rocket mr-2"></i>
                Advanced Capabilities
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Take Your Communication to the Next Level
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover powerful advanced features that set CampusNotify apart from traditional notice management systems.
              </p>
            </div>

            {/* Advanced Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              
              {/* Integration & API */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-plug text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Seamless Integration & API</h3>
                    <p className="text-gray-600 mb-4">
                      Connect with existing systems through our robust REST API. Integrate with student information systems, 
                      email platforms, and mobile apps for unified communication.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>RESTful API access</li>
                      <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Webhook support</li>
                      <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Third-party integrations</li>
                      <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Custom development support</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Security & Compliance */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-shield-alt text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Enterprise Security & Compliance</h3>
                    <p className="text-gray-600 mb-4">
                      Bank-level security with end-to-end encryption, GDPR compliance, and comprehensive audit trails. 
                      Multi-factor authentication and SSO support for enhanced security.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>End-to-end encryption</li>
                      <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>GDPR compliance</li>
                      <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>Multi-factor authentication</li>
                      <li className="flex items-center"><i className="fas fa-check text-green-500 mr-2"></i>SSO integration</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        <footer className="bg-gray-900 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    
    {/* Main Footer Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      
      {/* Company Info */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-gradient mb-4">CampusNotify</h2>
        <p className="text-gray-300 mb-6 max-w-md">
          Empowering educational institutions with professional communication tools. 
          Streamline your campus notices and keep everyone informed with our intuitive platform.
        </p>
        <div className="flex space-x-4">
          <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#3b5998] transition-colors duration-200">
            <i className="fab fa-facebook-f text-sm"></i>
          </a>
          <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#1DA1F2] transition-colors duration-200">
            <svg viewBox="0 0 120 120" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-label="X">
              <path d="M93.5 18.5h15.2L76.1 54.1 111 101.5H82.7l-22.1-29.2-25.3 29.2H20.1l34.2-39.5L9.5 18.5h29.1l20.1 26.6 23.8-26.6zm-5.3 76.2h8.4L41.7 25.1h-9.1l55.6 69.6z"/>
            </svg>
          </a>
          <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#0077B5] transition-colors duration-200">
            <i className="fab fa-linkedin-in text-sm"></i>
          </a>
          <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-b from-[#833ab3] via-[#fd1d1d] to-[#fcb045] transition-colors duration-200">
            <i className="fab fa-instagram text-sm"></i>
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        <ul className="space-y-2">
          <li><a href="#home" className="text-gray-300 hover:text-white transition-colors duration-200">Home</a></li>
          <li><a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200">About</a></li>
          <li><a href="features.html" className="text-gray-300 hover:text-white transition-colors duration-200">Features</a></li>
          <li><a href="#tutorial" className="text-gray-300 hover:text-white transition-colors duration-200">Tutorial</a></li>

        </ul>
      </div>

      {/* Support */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Support</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Help Center</a></li>
          <li><a href="contact.html" className="text-gray-300 hover:text-white transition-colors duration-200">Contact Us</a></li>
          <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
        </ul>
      </div>

    </div>

    {/* Newsletter Signup */}
    {/* <div className="border-t border-gray-800 pt-8 mb-8">
      <div className="max-w-md mx-auto text-center">
        <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
        <p className="text-gray-300 mb-4 text-sm">Get the latest updates and features delivered to your inbox.</p>
        <div className="flex">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-primary-500 text-white"
          >
          <button className="btn-primary px-6 py-2 rounded-r-lg font-medium">
            Subscribe
          </button>
        </div>
      </div>
    </div> */}

    {/* Bottom Bar */}
    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-gray-400 text-sm">
        &copy; 2025 CampusNotify. All rights reserved.
      </p>
      <div className="flex space-x-6 mt-4 md:mt-0">
        <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Terms of Service</a>
        <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a>
        <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Cookie Policy</a>
      </div>
    </div>

  </div>
</footer>
          
      </div>
    </>
  );
};

export default Feature;
