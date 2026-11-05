import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/images/Logo.jpeg';

const ContactUs = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
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
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
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

          /* Form input focus effects */
          .form-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            outline: none;
          }

          /* Contact card hover effects */
          .contact-card:hover {
            box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 20px rgba(59, 130, 246, 0.4) !important;
            transition: all 0.3s ease;
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
                <Link to="/home" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Home</Link>
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
                <Link to="/tutorial" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Tutorial</Link>
                <Link to="/contact" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Contact</Link>
                {isAuth ? (
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Login</Link>
                    <Link to="/signup" className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium transition-colors duration-200">Sign Up</Link>
                  </>
                )}
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
                <i className="fas fa-envelope mr-2"></i>
                Get in Touch
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Contact Our
                <span className="text-gradient block">Expert Team</span>
              </h1>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
                Have questions about CampusNotify? Need help getting started? Our dedicated support team is here to assist you every step of the way.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="py-20 bg-white flex justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Contact Cards Grid */}
            <div className="flex justify-center flex-wrap gap-8 mb-20">
              
              {/* Phone Contact */}
              <div className="contact-card bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center fade-in-up delay-100 w-72">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-phone text-primary-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Phone Support</h3>
                <p className="text-gray-600 mb-4">
                  Speak directly with our support team for immediate assistance.
                </p>
                <div className="space-y-2">
                  <p className="text-primary-600 font-semibold">+91 9876543210</p>
                  <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM IST</p>
                </div>
              </div>

              {/* Email Contact */}
              <div className="contact-card bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center fade-in-up delay-200 w-72">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-envelope text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Email Support</h3>
                <p className="text-gray-600 mb-4">
                  Send us your questions and we'll respond within 24 hours.
                </p>
                <div className="space-y-2">
                  <p className="text-primary-600 font-semibold">support@campusnotify.com</p>
                  <p className="text-sm text-gray-500">24/7 Response</p>
                </div>
              </div>

              {/* Office Location */}
              <div className="contact-card bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center fade-in-up delay-400 w-72">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-map-marker-alt text-purple-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Visit Us</h3>
                <p className="text-gray-600 mb-4">
                  Come visit our headquarters for in-person consultations.
                </p>
                <div className="space-y-2">
                  <p className="text-primary-600 font-semibold">MES GCC </p>
                  <p className="text-sm text-gray-500">Karve Road, Pune</p>
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

export default ContactUs;
