import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

// TinyMCE core + UI
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';

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

const LocalLetterheadEditor = ({ onLetterheadChange, onClose }) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [letterheadHTML, setLetterheadHTML] = useState('');
  const [originalLetterhead, setOriginalLetterhead] = useState('');
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/letterhead/current/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setOriginalLetterhead(data.html_content);
      setLetterheadHTML(data.html_content);
      setLoading(false);
    })
    .catch(err => {
      console.error('Error fetching letterhead:', err);
      setLoading(false);
    });
  }, []);

  const handleEditorChange = (value) => {
    setLetterheadHTML(value);
  };

  const handleApplyLocally = () => {
    if (onLetterheadChange) {
      onLetterheadChange(letterheadHTML);
    }
    onClose();
  };

  const handleResetToDefault = () => {
    setLetterheadHTML(originalLetterhead);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Loading letterhead...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Local Letterhead Editor</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'preview' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('preview')}
          >
            🖼 Preview Mode
          </button>
          <button
            className={`px-6 py-3 font-medium ${activeTab === 'edit' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('edit')}
          >
            ✏️ Edit Mode
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'preview' ? (
            <div className="flex justify-center">
              <div
                className="border border-gray-300 shadow-lg"
                style={{
                  width: '794px', // A4 width at 96dpi
                  height: '1123px', // A4 height at 96dpi
                  backgroundColor: '#fff'
                }}
              >
                <iframe
                  srcDoc={letterheadHTML}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title="Letterhead Preview"
                />
              </div>
            </div>
          ) : (
            <div className="h-[600px]">
              <Editor
                onInit={(_evt, editor) => (editorRef.current = editor)}
                value={letterheadHTML}
                onEditorChange={handleEditorChange}
                init={{
                  height: 600,
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
                  content_style: `
                    body {
                      font-family: 'Times New Roman', serif;
                      font-size: 16px;
                      line-height: 1.5;
                      margin: 10px;
                      background: #fff;
                    }
                    table, th, td {
                      border: 1px solid black;
                      border-collapse: collapse;
                      padding: 6px;
                    }
                    th {
                      background-color: #f2f2f2;
                    }
                    img {
                      max-width: 100%;
                      height: auto;
                      display: block;
                      margin: 10px auto;
                    }
                  `,
                  setup: (editor) => {
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
                          {
                            type: 'menuitem',
                            text: 'Small (50px)',
                            onAction: () => {
                              editor.insertContent('<div style="height: 50px;"></div>');
                            }
                          },
                          {
                            type: 'menuitem',
                            text: 'Medium (100px)',
                            onAction: () => {
                              editor.insertContent('<div style="height: 100px;"></div>');
                            }
                          },
                          {
                            type: 'menuitem',
                            text: 'Large (150px)',
                            onAction: () => {
                              editor.insertContent('<div style="height: 150px;"></div>');
                            }
                          }
                        ];
                        callback(items);
                      }
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
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
          <div>
            <button
              onClick={handleResetToDefault}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset to Default
            </button>
          </div>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyLocally}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Apply Locally
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalLetterheadEditor;
