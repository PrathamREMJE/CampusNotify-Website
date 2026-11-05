import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/images/Logo.jpeg';
import firstview from '../assets/images/firstview.png';
import noticeArchieve from '../assets/images/notice_archieve.jpg';
import noticeSelector from '../assets/images/Notice Selector Img.png';
import predefinedEmpty from '../assets/images/Holiday Notice Predefined Mode Empty.png';
import predefinedFilled from '../assets/images/Holiday Notice Predefined Mode Filled Data.png';
import predefinedPreview from '../assets/images/Holiday Notice Predefined Mode Preview Page.png';
import predefinedFinal from '../assets/images/Holiday Notice Predefined Mode Notice PDF .png';
import customEmpty from '../assets/images/Holiday Notice Custom Mode Empty.png';
import customFilled from '../assets/images/Holiday Notice Custom Mode Filled Data.png';
import customPreview from '../assets/images/Holiday Notice Custom Mode Preview Page.png';
import customFinal from '../assets/images/Holiday Notice Custom Mode Notice PDF .png';
import signupImg from '../assets/images/signup.png';
import dashboardImg from '../assets/images/Dashboard-Img.png';

const Tutorial = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('access_token'));
  useEffect(() => {
    const onStorage = () => setIsAuth(!!localStorage.getItem('access_token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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

    const animateElements = document.querySelectorAll('.step-card, .fade-in-up');
    animateElements.forEach(el => observer.observe(el));
  }, []);



  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
          .step-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .step-card:hover { transform: translateY(-6px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
          html { scroll-behavior: smooth; }
          .gradient-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .gradient-secondary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          .gradient-accent {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          /* Glass morphism effect */
          .glass {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          /* Professional button styles */
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: all 0.3s ease;
            color: white;
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
                <a href="#" className="btn-primary text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg" onClick={() => navigate('/login')}>
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

        {/* Hero */}
        <section className="relative py-16 bg-gradient-to-br from-gray-50 via-white to-primary-50 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="fade-in-up">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <i className="fas fa-graduation-cap mr-2"></i>
                Step-by-Step Guide
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">Getting Started with <span className="text-gradient">CampusNotify</span></h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">Follow these quick steps to sign up, explore the interface, and start creating professional notices.</p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

            {/* Step 1: Sign Up / Login */}
            <section id="step-signup" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Step 1: Sign Up / Login</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Click the <strong>Sign Up</strong> button and enter your institute email and basic details.</li>
                  <li>Verify your email using the one-time link to activate your account.</li>
                  <li>Use your email and password to <strong>Log In</strong>.</li>
                  <li>Optionally enable <strong>2FA</strong> for additional security in account settings.</li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <img className="w-full rounded-xl border border-gray-200" alt="Sign Up" src={signupImg} />
              </div>
            </section>

            {/* Step 2: First View of Website */}
            <section id="step-first-view" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
              <div>
                <img className="w-full rounded-xl border border-gray-200" alt="First view" src={firstview} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Step 2: First View of Website</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Explore the <strong>top navigation</strong> to access Features, Tutorial, and Contact.</li>
                  <li>Review the <strong>hero section</strong> for a quick overview and CTAs.</li>
                  <li>Scroll to discover <strong>About</strong> and <strong>Key Highlights</strong> of CampusNotify.</li>
                  <li>Use the <strong>Get Started</strong> button to jump to creation workflows.</li>
                </ul>
              </div>
            </section>

            {/* Step 3: Dashboard to Create Notices */}
            <section id="step-dashboard" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
              <div className="order-2 lg:order-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Step 3: Dashboard – Create Notices</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Open the <strong>Dashboard</strong> from the navigation or your profile menu.</li>
                  <li>Click <strong>Create Notice</strong> and select a template (Notice/Event/Exam/Circular).</li>
                  <li>Fill in details like <strong>title</strong>, <strong>date</strong>, <strong>department</strong>, and attachments.</li>
                  <li>Preview and <strong>Save as Draft</strong> or <strong>Publish</strong> immediately.</li>
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <img className="w-full rounded-xl border border-gray-200" alt="Dashboard" src={dashboardImg} />
              </div>
            </section>

            {/* Step 4: Manage & Share (Optional, extend later) */}
            <section id="step-manage" className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
              <div>
                <img className="w-full rounded-xl border border-gray-200" alt="Manage & Share" src={noticeArchieve} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Step 4: Manage & Share</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  <li>Track notice status and performance from the <strong>Activity</strong> panel.</li>
                  <li>Edit or revoke notices with <strong>version history</strong> preserved.</li>
                  <li>Share via <strong>PDF/PNG</strong> exports or integrated channels.</li>
                  <li>Assign <strong>roles</strong> for approval workflows when needed.</li>
                </ul>
              </div>
            </section>

            {/* Example: Create a Holiday Notice */}
            <section id="example-holiday-notice" className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Example: Create a <span className="text-gradient">Holiday Notice</span></h2>
                <p className="text-gray-600 max-w-3xl mx-auto">Start by selecting the notice type, then choose <strong>Predefined</strong> or <strong>Custom</strong> templates. Each shows <strong>Empty</strong>, <strong>Filled</strong>, <strong>Preview</strong>, and <strong>Final</strong> stages.</p>
              </div>

              {/* Select Notice Type */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
                <div>
                  <img className="w-full rounded-xl border border-gray-200" alt="Select Notice Type" src={noticeSelector} />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">Select Notice</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Go to <strong>Create Notice</strong>.</li>
                    <li>Choose the notice category (e.g., <strong>Holiday Notice</strong>).</li>
                    <li>Proceed to pick <strong>Predefined</strong> or <strong>Custom</strong> template path.</li>
                  </ul>
                </div>
              </section>

              {/* Predefined Templates */}
              <div className="space-y-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                  <i className="fas fa-layer-group mr-2"></i> Predefined Templates
                </div>

                {/* Predefined - Empty */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
                  <div>
                    <img className="w-full rounded-xl border border-gray-200" alt="Predefined - Empty Template" src={predefinedEmpty} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">Predefined: Empty Template</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Switch to the <strong>Predefined</strong> tab and choose a layout.</li>
                      <li>Template opens with placeholder fields and default styles.</li>
                      <li>Fill in all the necessary content in the predefined templates.</li>
                    </ul>
                  </div>
                </section>

                {/* Predefined - Filled */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
                  <div className="order-2 lg:order-1">
                    <h3 className="text-2xl font-semibold mb-3">Predefined: Filled Template</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Enter notice details like <strong>Holiday Name</strong>, <strong>Date</strong>, <strong>Department</strong>.</li>
                      <li>Attach files or set signatory if needed.</li>
                    </ul>
                  </div>
                  <div className="order-1 lg:order-2">
                    <img className="w-full rounded-xl border border-gray-200" alt="Predefined - Filled" src={predefinedFilled} />
                  </div>
                </section>

                {/* Predefined - Preview */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
                  <div>
                    <img className="w-full rounded-xl border border-gray-200" alt="Predefined - Preview" src={predefinedPreview} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">Predefined: Preview of Notice</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Check layout, typography, and content alignment.</li>
                      <li>Make quick edits before publishing.</li>
                    </ul>
                  </div>
                </section>

                {/* Predefined - Final */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
                  <div className="order-2 lg:order-1">
                    <h3 className="text-2xl font-semibold mb-3">Predefined: Final Generated Notice</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li><strong>Publish</strong> or <strong>Save Draft</strong>.</li>
                      <li>Optionally export as <strong>PDF/PNG</strong> or share via channels.</li>
                    </ul>
                  </div>
                  <div className="order-1 lg:order-2">
                    <img className="w-full rounded-xl border border-gray-200" alt="Predefined - Final Notice" src={predefinedFinal} />
                  </div>
                </section>
              </div>

              {/* Custom Templates */}
              <div className="space-y-8">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                  <i className="fas fa-pen-ruler mr-2"></i> Custom Templates
                </div>

                {/* Custom - Empty */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
                  <div>
                    <img className="w-full rounded-xl border border-gray-200" alt="Custom - Empty Canvas" src={customEmpty} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">Custom: Empty Template</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Switch to <strong>Custom</strong> and start from <strong>Blank</strong> or base style.</li>
                      <li>Define brand colors, header, and footer placeholders.</li>
                    </ul>
                  </div>
                </section>

                {/* Custom - Filled */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
                  <div className="order-2 lg:order-1">
                    <h3 className="text-2xl font-semibold mb-3">Custom: Filled Template</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Add sections and content variables like <strong>{'{holiday_name}'}</strong>, <strong>{'{date}'}</strong>, <strong>{'{department}'}</strong>.</li>
                      <li>Adjust spacing, fonts, and optional watermark/seal.</li>
                    </ul>
                  </div>
                  <div className="order-1 lg:order-2">
                    <img className="w-full rounded-xl border border-gray-200" alt="Custom - Filled" src={customFilled} />
                  </div>
                </section>

                {/* Custom - Preview */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
                  <div>
                    <img className="w-full rounded-xl border border-gray-200" alt="Custom - Preview" src={customPreview} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3">Custom: Preview of Notice</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li>Review composition and typography.</li>
                      <li>Make final tweaks to content and styles.</li>
                    </ul>
                  </div>
                </section>

                {/* Custom - Final */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center step-card bg-white rounded-2xl p-6 md:p-10 shadow-lg border border-gray-100">
                  <div className="order-2 lg:order-1">
                    <h3 className="text-2xl font-semibold mb-3">Custom: Final Generated Notice</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      <li><strong>Publish</strong> or <strong>Save Draft</strong>.</li>
                      <li>Optionally export as <strong>PDF/PNG</strong> or save template for reuse.</li>
                    </ul>
                  </div>
                  <div className="order-1 lg:order-2">
                    <img className="w-full rounded-xl border border-gray-200" alt="Custom - Final" src={customFinal} />
                  </div>
                </section>
              </div>
            </section>


          </div>
          
        </main>
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

export default Tutorial;
