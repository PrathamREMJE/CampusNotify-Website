import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomNoticeEditor from '../../components/NoticeForm/CustomNoticeEditor';

const CustomNoticeForm = () => {
  const [content, setContent] = useState('');
  const [applyFooter, setApplyFooter] = useState(false);
  const navigate = useNavigate();

  // Draft functionality - save form data to localStorage
  const saveDraft = () => {
    const draftData = {
      content,
      applyFooter
    };
    localStorage.setItem('custom_notice_draft', JSON.stringify(draftData));
  };

  // Load draft data from localStorage
  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem('custom_notice_draft');
      if (draftData) {
        const parsed = JSON.parse(draftData);
        setContent(parsed.content || '');
        setApplyFooter(parsed.applyFooter || false);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  // Clear draft data
  const clearDraft = () => {
    localStorage.removeItem('custom_notice_draft');
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
  }, [content, applyFooter]);

  const handlePreview = () => {
    const trimmedContent = (content || '').trim();

    if (!trimmedContent) {
      alert('Please add some content before previewing the notice.');
      return;
    }

    const payload = {
      notice_type: 'custom',
      title: 'Custom Notice',
      content_data: {
        plain_html: trimmedContent,
        apply_footer: applyFooter,
      },
    };

    navigate('/notices/preview', { state: { noticeType: 'custom', data: payload, draftKey: 'custom_notice_draft' } });
  };



  const isFormValid = content.trim().length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Professional Header with Gradient */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Custom Notice Creator</h2>
              <p className="text-white/90 text-sm font-medium">Advanced Rich Text Notice Generation System</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">CUSTOM</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">FLEXIBLE</span>
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
            <span className="text-sm font-semibold text-gray-700">Notice Content</span>
          </div>
          <div className="flex-1 mx-4 h-1 bg-gray-200 rounded-full">
            <div className="h-1 bg-blue-600 rounded-full" style={{ width: '50%' }}></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-bold">2</span>
            </div>
            <span className="text-sm text-gray-500">Preview & Generate</span>
          </div>
        </div>

        {/* Draft Controls */}
        {localStorage.getItem('custom_notice_draft') && (
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

        {/* Content Section */}
        <div className="space-y-3">
          <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            Notice Content
            <span className="text-red-500 ml-2 text-base">*</span>
            <div className="ml-auto bg-blue-50 px-2 py-1 rounded-full">
              <span className="text-xs font-semibold text-blue-700">REQUIRED</span>
            </div>
          </label>

          <CustomNoticeEditor onChange={setContent} />

          {!content.trim() ? (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-800">Add Notice Content</p>
                  <p className="text-xs text-blue-600 mt-1">Use the rich text editor above to create your custom notice content</p>
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
                  <p className="text-sm font-semibold text-green-800">Content Added</p>
                  <p className="text-xs text-green-600 mt-1">Your notice content is ready for preview</p>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Footer Option */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm font-bold text-gray-800">
              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Apply Institutional Footer
            </label>
            <button
              type="button"
              onClick={() => setApplyFooter(!applyFooter)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                applyFooter ? 'bg-emerald-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  applyFooter ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              {applyFooter
                ? "✓ Institutional footer with contact information will be included in the notice."
                : "Institutional footer will not be included. Only your custom content will appear."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={handlePreview}
            disabled={!isFormValid}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isFormValid
                ? 'bg-gradient-to-r from-teal-600 to-emerald-700 text-white hover:from-teal-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Preview Notice
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomNoticeForm;
