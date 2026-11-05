import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';

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
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/fontfamily';
import 'tinymce/plugins/fontsize';

const AdminLetterheadEditor = () => {
  const editorRef = useRef(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/letterhead/current/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setContent(data.html_content || '');
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleEditorChange = (value) => {
    setContent(value);
  };

  const handleSave = () => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/letterhead/update/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ html_content: content })
    })
    .then(res => res.json())
    .then(data => {
      alert('Letterhead saved successfully!');
    })
    .catch(err => {
      console.error(err);
      alert('Error saving letterhead');
    });
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <html>
        <head>
          <title>Letterhead Preview</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              font-size: 16px;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  if (loading) {
    return (
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <div>Loading letterhead...</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <h2>Admin Letterhead Editor</h2>
      <div style={{
        width: '720px',
        height: '1019px',
        backgroundColor: '#f5f5f5',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '5px',
        margin: '0 auto',
        overflow: 'hidden'
      }}>
        <Editor
          onInit={(_evt, editor) => (editorRef.current = editor)}
          value={content}
          onEditorChange={handleEditorChange}
          init={{
            height: 1019,
            width: 720,
            menubar: 'file edit insert view format table tools help',
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
              'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount', 'fontfamily', 'fontsize'
            ],
            toolbar:
              'undo redo | fontfamily fontsize | bold italic underline forecolor backcolor | ' +
              'alignleft aligncenter alignright alignjustify | ' +
              'bullist numlist outdent indent | link image table | code | removeformat | preview fullscreen',
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
                width: 600px;
                margin-left: 80px;
                margin-right: 40px;
                padding: 10px;
                height: 1019px;
                background: #fff;
                margin: 0;
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
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button onClick={handlePreview} style={{ marginRight: '10px' }}>Preview</button>
        <button onClick={handleSave}>Save Letterhead</button>
      </div>
    </div>
  );
};

export default AdminLetterheadEditor;