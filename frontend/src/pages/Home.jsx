

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/images/Logo.jpeg';
import DashboardImg from '../assets/images/Dashboard-Img.png';

const Home = () => {
  const [templateDropdownVisible, setTemplateDropdownVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const typewriterRef = useRef(null);

  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('access_token'));
  useEffect(() => {
    const onStorage = () => setIsAuth(!!localStorage.getItem('access_token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const messages = [
    "Create Professional Notices",
    "Manage Campus Communications",
    "Streamline Your Workflow",
    "Connect Your Community"
  ];

  useEffect(() => {
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 100;
    const deleteSpeed = 50;
    const pauseTime = 2000;

    const type = () => {
      const currentMessage = messages[messageIndex];

      if (isDeleting) {
        setTypewriterText(currentMessage.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setTypewriterText(currentMessage.substring(0, charIndex + 1));
        charIndex++;
      }

      let nextDelay = isDeleting ? deleteSpeed : typeSpeed;

      if (!isDeleting && charIndex === currentMessage.length) {
        nextDelay = pauseTime;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        messageIndex = (messageIndex + 1) % messages.length;
      }

      setTimeout(type, nextDelay);
    };

    type();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

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
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.card-hover, .feature-card, section > div');
    animateElements.forEach(el => observer.observe(el));
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

          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }

          .cursor {
            animation: blink 1s infinite;
          }

          .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }

          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }

          .gradient-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .gradient-secondary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          .gradient-accent {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          .glass {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            transition: all 0.3s ease;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
            color:linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            background:white;
          }

          html {
            scroll-behavior: smooth;
          }

          .text-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
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
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50">
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center px-6 py-2 rounded-full bg-blue-200 text-blue-700 text-sm font-medium mb-8 shadow-md" >
                Professional Notice Management System
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Streamline Your
                <span className="text-gradient block">Campus Communications</span>
              </h1>

              {/* Typewriter Text */}
              <div className="flex justify-center items-center mb-8">
                <p id="typewriter-text" className="text-xl md:text-2xl text-gray-600 font-medium">{typewriterText}</p>
                <span className={`cursor text-primary-500 text-xl md:text-2xl ml-1 ${cursorVisible ? '' : 'opacity-0'}`}>|</span>
              </div>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Create, manage, and distribute professional notices with ease. Our intuitive platform helps educational institutions
                maintain clear and consistent communication across all departments.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="#" className="btn-primary text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg inline-flex items-center" onClick={() => navigate(isAuth ? '/dashboard' : '/login')}>
                  <i className="fas fa-rocket mr-2"></i>
                  Start Creating Notices
                </a>
                <Link to="/feature" className="text-gray-700 hover:text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 hover:border-primary-300 transition-all duration-200 inline-flex items-center">
                  <i className="fas fa-star mr-2"></i>
                  View Features
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 animate-bounce">
            <a href="#about" className="text-gray-400 hover:text-primary-600 transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </a>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left: Content */}
              <div className="fade-in-up">
                <div className="inline-flex items-center px-6 py-2 rounded-full bg-blue-200 text-blue-700 text-sm font-medium mb-8 shadow-md">
                  <i className="fas fa-lightbulb mr-2"></i>
                  Why Choose CampusNotify?
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  Transform Your Campus Communication Experience
                </h2>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Say goodbye to outdated notice boards and scattered communication channels. CampusNotify provides a centralized,
                  professional platform that ensures your important messages reach the right people at the right time.
                </p>

                {/* Key Benefits */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                      <i className="fas fa-check text-primary-600 text-sm"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Professional Templates</h3>
                      <p className="text-gray-600">Pre-designed, customizable templates for all types of campus communications.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                      <i className="fas fa-check text-primary-600 text-sm"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Instant Distribution</h3>
                      <p className="text-gray-600">Reach your entire campus community with just a few clicks.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                      <i className="fas fa-check text-primary-600 text-sm"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900 mb-1">Smart Analytics</h3>
                      <p className="text-gray-600">Track engagement and ensure your messages are being seen and understood.</p>
                    </div>
                  </div>
                </div>

                <a href="features.html" className="btn-primary text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center">
                  <i className="fas fa-arrow-right mr-2"></i>
                  Explore Features
                </a>
              </div>

              {/* Right: Image/Visual */}
              <div className="relative">
                <div className="relative z-10">
                  <img
                    src={DashboardImg}
                    alt="CampusNotify Dashboard Preview"
                    className="rounded-2xl shadow-2xl w-full"
                  />
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-100 rounded-full opacity-60"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-secondary rounded-full opacity-20"></div>
              </div>

            </div>
          </div>
        </section>

        {/* Professional Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-2 rounded-full bg-blue-200 text-blue-700 text-sm font-medium mb-8 shadow-md">
                <i className="fas fa-star mr-2"></i>
                Powerful Features
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need for Professional Communication
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Streamline your campus communication with our comprehensive suite of tools designed for modern educational institutions.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {/* Feature 1: Smart Templates */}
              <div className="bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-file-alt text-primary-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Templates</h3>
                <p className="text-gray-600 mb-4">
                  Choose from professionally designed templates for notices, events, exams, and circulars. Customize to match your institution's branding.
                </p>
                <a href="features.html#smart-templates" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                  Learn more <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </a>
              </div>

              {/* Feature 2: Role-Based Access */}
              <div className="bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-users-cog text-green-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Role-Based Access</h3>
                <p className="text-gray-600 mb-4">
                  Secure permission system allowing different access levels for administrators, faculty, and staff members with audit trails.
                </p>
                <a href="features.html#role-based-access" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                  Learn more <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </a>
              </div>

              {/* Feature 3: Staff Management */}
              <div className="bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-user-friends text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Staff Management</h3>
                <p className="text-gray-600 mb-4">
                  Efficiently manage team members, assign responsibilities, and track notice creation activities across departments.
                </p>
                <a href="features.html#staff-management" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                  Learn more <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </a>
              </div>

              {/* Feature 4: Digital Archive */}
              <div className="bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-archive text-purple-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Digital Archive</h3>
                <p className="text-gray-600 mb-4">
                  Automatically archive all notices with powerful search capabilities. Maintain compliance and historical records effortlessly.
                </p>
                <a href="features.html#digital-archive" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                  Learn more <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </a>
              </div>

              {/* Feature 5: Multi-Language Support */}
              <div className="bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-globe text-blue-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Language Support</h3>
                <p className="text-gray-600 mb-4">
                  Create notices in multiple languages to serve diverse campus communities. Automatic translation assistance available.
                </p>
                <a href="features.html#multi-language-support" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                  Learn more <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </a>
              </div>

              {/* Feature 6: Analytics & Insights */}
              <div className="bg-white rounded-xl p-8 shadow-lg card-hover border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <i className="fas fa-chart-line text-indigo-600 text-xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Insights</h3>
                <p className="text-gray-600 mb-4">
                  Track notice engagement, delivery rates, and audience reach with comprehensive analytics and reporting tools.
                </p>
                <a href="features.html#analytics-insights" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
                  Learn more <i className="fas fa-arrow-right ml-2 text-sm"></i>
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* Tutorial Section */}
        <section id="tutorial" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section Header */
            }
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-2 rounded-full bg-blue-200 text-blue-700 text-sm font-medium mb-8 shadow-md">
                <i className="fas fa-graduation-cap mr-2"></i>
                Learn & Master
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Follow our comprehensive guides and video tutorials to master CampusNotify quickly. From basic setup to advanced features, we've got you covered.
              </p>
            </div>

            {/* Tutorial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">

              {/* Tutorial 1 */}
              <div className="bg-gray-50 rounded-xl p-6 card-hover">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-play-circle text-primary-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Start Guide</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Learn the basics of creating your first notice in under 5 minutes.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <i className="fas fa-clock mr-2"></i>
                  5 min read
                </div>
              </div>

              {/* Tutorial 2 */}
              <div className="bg-gray-50 rounded-xl p-6 card-hover">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-video text-green-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Video Walkthrough</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Watch our comprehensive video guide covering all major features.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <i className="fas fa-clock mr-2"></i>
                  15 min video
                </div>
              </div>

              {/* Tutorial 3 */}
              <div className="bg-gray-50 rounded-xl p-6 card-hover">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-book text-orange-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Advanced Features</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Master advanced features like automation, analytics, and integrations.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <i className="fas fa-clock mr-2"></i>
                  20 min read
                </div>
              </div>

            </div>

            {/* CTA */}
            <div className="text-center">
              <a href="#" className="btn-primary text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg inline-flex items-center">
                <i className="fas fa-rocket mr-2"></i>
                Start Learning Now
              </a>
            </div>

          </div>
        </section>

<footer className="bg-gray-900 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    
    {/* Main Footer Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      
      {/* Company Info */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-white mb-4">CampusNotify</h2>
        <p className="text-gray-400 mb-6 max-w-md">
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

export default Home;
