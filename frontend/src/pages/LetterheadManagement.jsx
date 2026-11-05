import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import Modal from 'react-modal';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import logo from '../assets/images/noticeheaderlogo.png';

// TinyMCE core + UI
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';
import 'tinymce/skins/ui/oxide/skin.min.css';

// Core free plugins
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';

const defaultLetterheadHTML = `<div class="container">
    <div class="header">
        <img src="${logo}" alt="Garware College Logo">
        <div class="subtitle">MAHARASHTRA EDUCATION SOCIETY'S</div>
        <div class="main-title">GARWARE COLLEGE OF COMMERCE (AUTONOMOUS)</div>
        <div class="empowering">Empowering generations since 1967...</div>
    </div>
    <div class="info-bar">
        NAAC Re-Accredited 'A' Grade (CGPA 3.45)
        <span class="award">Best College Award by Savitribai Phule Pune University</span>
    </div>
    <div class="principal-row">
        <div class="principal-col">
            <div class="principal-name">Dr. Kishor S. Desarda</div>
            <div class="principal-title">Principal</div>
        </div>
        <div class="contact-col">
            <div class="contact-lines">
                <div class="contact-line">
                    <strong>Karve Road, Deccan Gymkhana, Pune - 411004, (India)</strong>
                    &nbsp;&nbsp; Phone : Office 020-41038300 &nbsp;
                    Principal : 020-41038301
                </div>
                <div class="contact-line">
                    E-mail: Office : office.gcc@mespune.in &nbsp;
                    Principal : ksd.gcc@mespune.in &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Website : www.gcc.mespune.in
                </div>
                <div class="codes-row">
                    <span>[Univ. I.D. No.: PU/PN/C/018/(1967)]</span> •
                    <span>AISHE Code: C-41864</span> •
                    <span>U-DISE Code: 27251401523</span> •
                    <span>Jr. College Code: 11.11.002</span>
                </div>
            </div>
        </div>
    </div>
</div>


<div class="ending-footer">
    <div class="head-office">
        <span>Head Office:'MES Bhavan',Sadashiv Peth, Pune-411030, Maharashtra, India</span>
    </div>
    <div class="footer-ph">
        <span>Ph.: +91-020-41038100</span>
    </div>
    <div class="footer-link">
        <span>https://mespune.in</span>
    </div>
</div>`;

const LetterheadManagement = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchLetterhead();
  }, []);

  const fetchLetterhead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/letterhead/current/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const htmlContent = data.html_content || defaultLetterheadHTML;
      setContent(htmlContent);
      setOriginalContent(htmlContent);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching letterhead:', error);
      setLoading(false);
    }
  };

  const handleEditorChange = (value) => {
    setContent(value);
  };

  const saveLetterhead = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/letterhead/update/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ html_content: content })
      });

      if (response.ok) {
        setOriginalContent(content);
        alert('Letterhead saved successfully!');
      } else {
        const error = await response.json();
        alert(`Error saving letterhead: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving letterhead:', error);
      alert('Error saving letterhead. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetLetterhead = () => {
    if (window.confirm('Are you sure you want to reset the letterhead to its original state? This will discard all unsaved changes.')) {
      setContent(originalContent);
    }
  };

  const openPreview = () => {
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading letterhead...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors duration-200 group bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-2xl shadow-xl border border-teal-200 overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-700 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Letterhead Management</h2>
                <p className="text-teal-100">Design and manage your college letterhead template</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Letterhead Editor
              </h3>
              <p className="text-sm text-gray-600">
                Use the editor below to design your letterhead. Include header information, footer details, and define the editable content area.
              </p>
            </div>

            <div style={{
              minHeight: 'calc(100vh - 200px)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              backgroundColor: '#f9fafb',
              paddingTop: '20px',
            }}>
              <div style={{
                width: '695px',
                height: '842px',
                backgroundColor: 'white',
                boxShadow: '0 0 15px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                transform: 'none',
                zoom: '1',
                border: '1px solid #ddd',
                boxSizing: 'border-box'
              }}>
                <Editor
                onInit={(_evt, editor) => (editorRef.current = editor)}
                value={content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 842,
                  width: 595,
                  content_width: 595,
                  resize: false,
                  menubar: 'file edit insert view format table tools help',
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                    'searchreplace', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'help', 'wordcount'
                  ],

                  toolbar:
                    'undo redo | fontfamily fontsize | bold italic underline forecolor backcolor | ' +
                    'alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | link image table insertspacer | removeformat | preview fullscreen',

                  fontsize_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 32px 36px 48px 56px 64px 72px',
                  font_family_formats:
                    "Times New Roman=Times New Roman, Times, serif;" +
                    "Arial=Arial, Helvetica, sans-serif;" +
                    "Calibri=Calibri, sans-serif;" +
                    "Cambria=Cambria, serif;" +
                    "Georgia=Georgia, serif;" +
                    "Courier New=Courier New, monospace;" +
                    "Lucida Console=Lucida Console, monospace;" +
                    "Tahoma=Tahoma, sans-serif;" +
                    "Verdana=Verdana, sans-serif;" +
                    "Comic Sans MS=Comic Sans MS, cursive;" +
                    "Impact=Impact, sans-serif;" +
                    "Lucida Sans Unicode=Lucida Sans Unicode, sans-serif;" +
                    "Microsoft Sans Serif=Microsoft Sans Serif, sans-serif;" +
                    "Palatino Linotype=Palatino Linotype, serif;" +
                    "Trebuchet MS=Trebuchet MS, sans-serif;",

                  table_advtab: true,
                  table_cell_advtab: true,
                  table_row_advtab: true,
                  table_responsive_width: true,
                  table_default_attributes: { border: '1' },
                  table_default_styles: {
                    width: '100%',
                    borderCollapse: 'collapse',
                  },

                  content_css: false,
                  content_style: `
  html, body, #tinymce, .mce-content-body {
    width: 695px !important;
    height: 842px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    background: #ffffff !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #000;
    line-height: 1.4;
    transform: none !important;
    zoom: 1 !important;
  }

  /* Fix TinyMCE internal padding and auto margins */
  body.mce-content-body {
    padding: 0 !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }

  table, tr, td {
    border-collapse: collapse !important;
  }

  /* Letterhead Styling */
  .container { width: 100%; text-align: center; background: #fff; }
  .header img { height: 85px; margin: 5px 0; display: block; margin-left: auto; margin-right: auto; }
  .subtitle { font-size: 14px; color: #111; font-weight: 600; margin-top: 4px; }
  .main-title { font-size: 17px; font-weight: bold; color: #001e62; margin-top: 2px; }
  .empowering { font-size: 12px; font-style: italic; color: #333; margin-top: 2px; }
  .info-bar {
    border-top: 2px solid #001e62;
    border-bottom: 2px solid #001e62;
    padding: 3px 0;
    font-size: 12px;
    color: #001e62;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    text-align: center;
  }
  .principal-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 10px;
    font-size: 11px;
    line-height: 1.4;
  }
  .principal-name { font-weight: 600; }
  .ending-footer {
    border-top: 1px solid #001e62;
    margin-top: 25px;
    padding-top: 6px;
    font-size: 10px;
    color: #111;
    text-align: center;
  }
  img { max-width: 100%; height: auto; }
`,


                  setup: (editor) => {
  editor.on('init', () => {
    const iframe = editor.iframeElement;
    if (iframe) {
      iframe.style.width = '695px';
      iframe.style.height = '842px';
      iframe.style.maxWidth = '695px';
      iframe.style.maxHeight = '842px';
      iframe.style.margin = '0 auto';
      iframe.style.display = 'block';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.contentDocument.documentElement.style.width = '695px';
      iframe.contentDocument.documentElement.style.height = '842px';
      iframe.contentDocument.body.style.width = '695px';
      iframe.contentDocument.body.style.height = '842px';
      iframe.contentDocument.body.style.overflow = 'hidden';
      iframe.contentDocument.body.style.padding = '0';
      iframe.contentDocument.body.style.margin = '0';
      iframe.contentDocument.body.style.zoom = '1';
    }

    // Prevent TinyMCE from injecting scrollbars on resize
    const resizeFix = () => {
      if (iframe && iframe.contentDocument?.body) {
        iframe.contentDocument.body.style.overflow = 'hidden';
        iframe.contentDocument.body.style.zoom = '1';
      }
    };
    new ResizeObserver(resizeFix).observe(iframe);
  });

  editor.on('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      editor.insertContent('&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  });

  editor.ui.registry.addMenuButton('insertspacer', {
    text: 'Spacer',
    icon: 'plus',
    fetch: (callback) => {
      const items = [
        { type: 'menuitem', text: 'Small (50px)', onAction: () => editor.insertContent('<div style="height:50px;"></div>') },
        { type: 'menuitem', text: 'Medium (100px)', onAction: () => editor.insertContent('<div style="height:100px;"></div>') },
        { type: 'menuitem', text: 'Large (150px)', onAction: () => editor.insertContent('<div style="height:150px;"></div>') },
      ];
      callback(items);
    },
  });
},

                  automatic_uploads: true,
                  paste_data_images: true,
                  images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.withCredentials = false;
                    xhr.open('POST', 'http://localhost:8000/api/upload/image/');
                    const token = localStorage.getItem('access_token');
                    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                    xhr.upload.onprogress = (e) => progress(e.loaded / e.total * 100);
                    xhr.onload = () => {
                      if (xhr.status < 200 || xhr.status >= 300) {
                        reject({ message: 'HTTP Error: ' + xhr.status });
                        return;
                      }
                      const json = JSON.parse(xhr.responseText);
                      if (!json || typeof json.image_url !== 'string') {
                        reject({ message: 'Invalid JSON: ' + xhr.responseText });
                        return;
                      }
                      const imageUrl = json.image_url.startsWith('http')
                        ? json.image_url
                        : `http://localhost:8000${json.image_url}`;
                      resolve(imageUrl);
                    };
                    xhr.onerror = () => reject({ message: 'Image upload failed' });
                    const formData = new FormData();
                    formData.append('image', blobInfo.blob(), blobInfo.filename());
                    xhr.send(formData);
                  }),

                  branding: false,
                  license_key: 'gpl',
                  language: 'en',
                }}
              />
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p><strong>Header Area:</strong> College logo, name, address</p>
                <p><strong>Footer Area:</strong> Contact information, signatures</p>
                <p><strong>Editable Content Area:</strong> Where notice content will be inserted</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetLetterhead}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={saving}
                >
                  Reset
                </button>
                <button
                  onClick={openPreview}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={saving}
                >
                  Preview
                </button>
                <button
                  onClick={saveLetterhead}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Letterhead'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <Modal
          isOpen={previewOpen}
          onRequestClose={closePreview}
          className="modal"
          overlayClassName="overlay"
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              width: '695px',
              height: '842px',
              transform: 'none',
              zoom: '1',
              overflow: 'hidden',
              margin: '0 auto',
              border: '1px solid #ddd',
              padding: '0',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 1000,
            }
          }}
        >
          <div className="bg-white h-full overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">A4 Preview</h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div
              className="p-4"
              style={{
                width: '555px', // 595 - 40px padding
                minHeight: '762px', // 842 - 80px (header + padding)
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default LetterheadManagement;
