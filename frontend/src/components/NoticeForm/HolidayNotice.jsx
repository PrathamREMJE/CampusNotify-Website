import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocalLetterheadEditor from '../Letterhead/LocalLetterheadEditor';

const HolidayNoticeForm = () => {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [language, setLanguage] = useState('english');
  const [mode, setMode] = useState('predefined');
  const [customContent, setCustomContent] = useState('');
  const [applyFooter, setApplyFooter] = useState(false);
  const [holidayType, setHolidayType] = useState('national');

  const navigate = useNavigate();

  // Draft functionality - save form data to localStorage
  const saveDraft = () => {
    const draftData = {
      date,
      reason,
      language,
      mode,
      customContent,
      applyFooter,
      holidayType
    };
    localStorage.setItem('holiday_notice_draft', JSON.stringify(draftData));
  };

  // Load draft data from localStorage
  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem('holiday_notice_draft');
      if (draftData) {
        const parsed = JSON.parse(draftData);
        setDate(parsed.date || '');
        setReason(parsed.reason || '');
        setLanguage(parsed.language || 'english');
        setMode(parsed.mode || 'predefined');
        setCustomContent(parsed.customContent || '');
        setApplyFooter(parsed.applyFooter || false);
        setHolidayType(parsed.holidayType || 'national');
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  // Clear draft data
  const clearDraft = () => {
    localStorage.removeItem('holiday_notice_draft');
  };

  // Load draft data when component mounts
  useEffect(() => {
    loadDraft();
  }, []);

  // Auto-save draft whenever form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [date, reason, language, mode, customContent, applyFooter, holidayType]);

  const handlePreview = () => {
    // Save current form data as draft before navigating to preview
    saveDraft();

    const formData =
      mode === 'custom'
    ? {
        mode: 'custom',
        custom_content: customContent,
        content_data: {
          audience: 'both',
          language: language,
          apply_footer: applyFooter,
        }
          }
        : {
            mode: 'predefined',
            content_data: {
              holiday_date: date,
              holiday_title: reason,
              audience: 'both',
              language: language,
              apply_footer: applyFooter,
            },
          };
    navigate("/notices/preview", { state: { noticeType: "holiday", data: formData, draftKey: 'holiday_notice_draft' } });
  };
  

  const languageOptions = [
    { value: 'english', label: 'English', flag: '🇺🇸', description: 'Standard English format' },
    { value: 'marathi', label: 'मराठी (Marathi)', flag: '🇮🇳', description: 'Regional language format' },
    { value: 'hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳', description: 'National language format' }
  ];

  const isFormValid = mode === 'custom'
    ? customContent.trim().length > 0
    : date && reason.trim();
  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Professional Header with Gradient */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-2xl">🏖️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Holiday Notice Generator</h2>
              <p className="text-white/90 text-sm font-medium">Official Institutional Holiday Announcement System</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">OFFICIAL</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">SECURE</span>
            </div>
          </div>
        </div>
      </div>

      <form className="p-8 space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">Holiday Details</span>
          </div>
          <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
            <div className="h-1 bg-blue-600 rounded-full" style={{ width: '33%' }}></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-bold">2</span>
            </div>
            <span className="text-sm text-gray-500">Preview & Generate</span>
          </div>
        </div>

        {/* Draft Controls */}
        {localStorage.getItem('holiday_notice_draft') && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-700">Draft data loaded from previous session</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear the saved draft? This action cannot be undone.')) {
                  clearDraft();
                  window.location.reload(); // Reload to reset form
                }
              }}
              className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              Clear Draft
            </button>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mb-6 flex gap-4 items-center justify-between">
          <div className="flex gap-4">
            <button type="button" className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-200 ${mode==='predefined' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`} onClick={()=>setMode('predefined')}>Predefined</button>
            <button type="button" className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-200 ${mode==='custom' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'}`} onClick={()=>setMode('custom')}>Custom</button>
          </div>
        </div>

        {/* Holiday Date Field - Enhanced */}
        {mode !== 'custom' && (<div className="space-y-3">
          <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
            <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            Holiday Date
            <span className="text-red-500 ml-2 text-base">*</span>
            <div className="ml-auto bg-teal-50 px-2 py-1 rounded-full">
              <span className="text-xs font-semibold text-teal-700">REQUIRED</span>
            </div>
          </label>
          
          <div className="relative group">
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              min={currentDate}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300 text-gray-800 bg-white hover:border-teal-400 hover:shadow-md group-hover:shadow-lg font-medium text-lg"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          {!date ? (
            <div className="bg-teal-50 border-l-4 border-teal-400 p-4 rounded-r-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-teal-800">Select Holiday Date</p>
                  <p className="text-xs text-teal-600 mt-1">Choose the specific date when the holiday will be observed by the institution</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-800">Date Selected</p>
                  <p className="text-xs text-green-600 mt-1">Holiday scheduled for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          )}
        </div>)}
        

        {/* Holiday Reason Field - Enhanced */}
        {mode === 'custom' ? (
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" />
                </svg>
              </div>
              Custom Content
              <span className="text-red-500 ml-2 text-base">*</span>
            </label>
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="Enter your custom notice content here..."
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-gray-800 bg-white hover:border-green-400 hover:shadow-md resize-none font-medium text-lg"
              rows="8"
              maxLength="2000"
              required
            />
            <div className="text-right">
              <span className="text-sm text-gray-500">{customContent.length}/2000</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              Holiday Name / Event Title
              <span className="text-red-500 ml-2 text-base">*</span>
              <div className="ml-auto bg-emerald-50 px-2 py-1 rounded-full">
                <span className="text-xs font-semibold text-emerald-700">REQUIRED</span>
              </div>
            </label>
            
            <div className="relative group">
              <textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="Enter the official name of the holiday or celebration (e.g., Independence Day, Diwali Festival, Christmas Celebration, Eid ul-Fitr)"
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-gray-800 bg-white hover:border-emerald-400 hover:shadow-md group-hover:shadow-lg resize-none font-medium text-lg"
                rows="4"
                maxLength="100"
                required
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  reason.length > 80 ? 'bg-red-100 text-red-700' : 
                  reason.length > 60 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-gray-100 text-gray-600'
                }`}>
                  {reason.length}/100
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-teal-800 mb-2">Professional Writing Guidelines</h4>
                  <ul className="text-sm text-teal-700 space-y-1">
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></span>Use official holiday names (e.g., "Republic Day" not "26th Jan")</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></span>Include cultural context if applicable (e.g., "Diwali - Festival of Lights")</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2"></span>Keep it concise yet descriptive for official documentation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Language Selection Field - Enhanced */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            Document Language
            <div className="ml-auto bg-purple-50 px-2 py-1 rounded-full">
              <span className="text-xs font-semibold text-purple-700">LOCALIZATION</span>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {languageOptions.map((option) => (
              <div key={option.value} className="relative">
                <input
                  type="radio"
                  id={option.value}
                  name="language"
                  value={option.value}
                  checked={language === option.value}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor={option.value}
                  className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    language === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/20'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{option.flag}</span>
                    {language === option.value && (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{option.label}</h3>
                  <p className="text-xs text-gray-600">{option.description}</p>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Option */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Footer Options
            <div className="ml-auto bg-orange-50 px-2 py-1 rounded-full">
              <span className="text-xs font-semibold text-orange-700">OPTIONAL</span>
            </div>
          </label>

          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="applyFooter"
                checked={applyFooter}
                onChange={(e) => setApplyFooter(e.target.checked)}
                className="w-5 h-5 text-orange-600 bg-white border-2 border-orange-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <label htmlFor="applyFooter" className="ml-3 text-sm font-medium text-orange-800 cursor-pointer">
                Include institutional footer with contact information
              </label>
            </div>
            <p className="text-xs text-orange-600 mt-2 ml-8">
              Adds official contact details and institutional branding to the notice footer
            </p>
          </div>
        </div>

        {/* Form Validation Summary - Enhanced */}
        {!isFormValid && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-800 mb-3 text-lg">Complete Required Information</h4>
                <div className="space-y-2">
                  {!date && (
                    <div className="flex items-center p-2 bg-white/50 rounded-lg">
                      <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-amber-700">Holiday date must be selected</span>
                    </div>
                  )}
                  {!reason.trim() && (
                    <div className="flex items-center p-2 bg-white/50 rounded-lg">
                      <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm font-medium text-amber-700">Holiday name/reason is required</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button - Enhanced */}
        <div className="pt-6 border-t-2 border-gray-100">
          <button 
            type="button" 
            onClick={handlePreview} 
            disabled={!isFormValid}
            className={`w-full group relative overflow-hidden rounded-xl font-bold text-lg py-4 px-8 transition-all duration-300 transform ${
              isFormValid
                ? 'bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white shadow-2xl hover:shadow-3xl hover:-translate-y-1 hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-inner'
            }`}
          >
            <div className="flex items-center justify-center relative z-10">
              <div className="w-6 h-6 mr-3 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span>{isFormValid ? 'Generate Holiday Notice Preview' : 'Complete All Required Fields'}</span>
              {isFormValid && (
                <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </div>
            
            {isFormValid && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            )}
          </button>
          
          {isFormValid && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 font-medium">
                🔒 Secure Processing • 📄 Official Format • ⚡ Instant Generation
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your notice will be generated in professional institutional format
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default HolidayNoticeForm;
