import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const NoticePreviewPage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) return;
    fetch('http://127.0.0.1:8000/api/staff/list/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setStaffList(data))
      .catch(() => setStaffList([]));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch('http://127.0.0.1:8000/api/departments/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => setDeptList(data))
      .catch(() => setDeptList([]));
  }, [token]);

  const getDeptName = (id) => {
    const dept = deptList.find(d => String(d.id) === String(id));
    return dept ? dept.name : id;
  };

  if (!token) {
    toast.error("Please login first.");
    return null;
  }

  const location = useLocation();
  const navigate = useNavigate();

  const noticeData = location.state?.data;
  const draftKey = location.state?.draftKey;
  const noticeType = location.state?.noticeType;
  const localLetterhead = location.state?.localLetterhead;

  // Calculate finalVenue at component level so it's available throughout
  const finalVenue = noticeData?.venue === "custom" ? noticeData?.customVenue : noticeData?.venue;

  // Override introduction text for guest_lecture predefined mode with committee-specific message when applicable
  const introductionText = noticeType === 'guest_lecture' && noticeData?.mode === 'predefined'
    ? noticeData.category === 'committee' && (noticeData.committee || noticeData.committee_name)
      ? `The ${noticeData.committee || noticeData.committee_name} has organized a Guest Lecture on the topic "${noticeData.lecture_title || noticeData.lectureTitle}" for ${noticeData.years?.join('/')} ${noticeData.departments?.join(', ')} students.`
      : `A Guest Lecture has been organized on topic "${noticeData.lecture_title || noticeData.lectureTitle}" for ${noticeData.years?.join('/')} ${noticeData.departments?.join(', ')} students.`
    : noticeData?.introduction || '';

  if (!noticeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-black rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Preview Available</h3>
          <p className="text-gray-600 mb-4">No notice data found to preview.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmAndDownload = async () => {
    setIsGenerating(true);
    let requestBody;
    const finalVenue =
      noticeData.venue === "custom" ? noticeData.customVenue : noticeData.venue;
    if (noticeType === "holiday") {
      requestBody = {
        notice_type: "holiday",
        title: "Notice",
        origin_type: "office",
        origin_name: "Office",
        ...noticeData,
      };
    } else if (noticeType === "exam") {
      requestBody = {
        notice_type: "exam",
        title: "Exam Notice",
        ...noticeData,
      };
    } else if (noticeType === "lecture_cancellation") {
      requestBody = {
        notice_type: "lecture_cancellation",
        title: "Lecture Cancellation Notice",
        ...noticeData,
      };
    } else if (noticeType === "assignment") {
      requestBody = {
        notice_type: "assignment",
        title: "Assignment Submission Notice",
        content_data: {
          ...noticeData.content_data,
          assignment_table: noticeData.assignment_table,
        },
      };
    } else if (noticeType === "class_timetable") {
      requestBody = {
        notice_type: "class_timetable",
        title: "Class Timetable",
        content_data: {
          ...noticeData.content_data,
          timetable_table: noticeData.timetable_table,
        },
      };
    } else if (noticeType === "sports_events") {
      requestBody = {
        notice_type: "sports_events",
        title: noticeData.title,
        content_data: {
          ...noticeData.content_data,
          signatures: noticeData.content_data.signatures,
          introduction: noticeData.content_data.introduction,
          ending_content: noticeData.content_data.ending_content
        },
        table_mode: noticeData.table_mode,
        table_data: noticeData.table_data,
      };
    } else if (noticeType === "result_marksheet_distribution") {
      requestBody = {
        notice_type: "result_marksheet_distribution",
        title: "Result / Marksheet Distribution",
        content_data: {
          ...noticeData.content_data,
          distribution_table: noticeData.distribution_table,
        },
      };
    } else if (noticeType === "revaluation") {
      requestBody = {
        notice_type: "revaluation",
        title: "Revaluation Results Notice",
        content_data: {
          ...noticeData.content_data,
          revaluation_table: noticeData.revaluation_table,
        },
      };
    } else if (noticeType === "photocopy") {
      requestBody = {
        notice_type: "photocopy",
        mode: noticeData.mode,
        title: noticeData.content_data?.title || "Photocopy Application Notice",
        ...noticeData.content_data,
      };
    } else if (noticeType === "industrial_visit") {
      requestBody = {
        notice_type: "industrial_visit",
        title: "Industrial Visit Notice",
        ...noticeData,
      };
    } else if (noticeType === "seminar_workshop_webinar") {
      requestBody = {
        notice_type: "seminar_workshop_webinar",
        title: noticeData.content_data?.title || "Seminar / Workshop / Webinar Notice",
        content_data: {
          ...noticeData.content_data,
          seminar_table: noticeData.seminar_workshop_table,
        },
        seminar_table: noticeData.seminar_workshop_table,
        ...noticeData,
      };
    } else if (noticeType === "internship") {
      const { applyFooter, ...rest } = noticeData;
      requestBody = {
        notice_type: "internship",
        title: noticeData.title || "Internship Notice",
        ...rest,
        apply_footer: applyFooter,
      };
    } else if (noticeType === "library") {
      requestBody = {
        notice_type: "library",
        title: noticeData.title || "Library Notice",
        ...noticeData,
        targetDepartments: Array.isArray(noticeData.targetDepartments)
          ? noticeData.targetDepartments.map(deptId => getDeptName(deptId))
          : noticeData.targetDepartments,
      };
    } else if (noticeType === "notice_creation") {
      requestBody = {
        notice_type: "notice_creation",
        title: "Notice Creation",
        ...noticeData,
      };
    } else if (
      noticeType === "custom" ||
      noticeType === "misc" ||
      noticeType === "miscellaneous" ||
      noticeType === "miscellaneours"
    ) {
      // Preserve user-defined order for PDF by composing plain_html from ordered_blocks
      const blocks = Array.isArray(noticeData.ordered_blocks) ? noticeData.ordered_blocks : [];
      const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const htmlParts = [];
      blocks.forEach((b) => {
        if (b.type === 'introduction' && b.text) {
          htmlParts.push(`<div class="content" style="margin-left: 60px;"><div class="section"><p>${esc(b.text)}</p></div></div>`);
        } else if (b.type === 'section' && (b.title || b.text || (Array.isArray(b.list) && b.list.length))) {
          const title = b.title ? `<p><strong>${esc(b.title)}</strong></p>` : '';
          const text = b.text ? `<p>${esc(b.text)}</p>` : '';
          const list = Array.isArray(b.list) && b.list.length
            ? `<ol style="margin-left: 20px;">${b.list.map((it) => `<li>${esc(it)}</li>`).join('')}</ol>`
            : '';
          htmlParts.push(`<div class="content"><div class="section">${title}${text}${list}</div></div>`);
        } else if (b.type === 'table' && Array.isArray(b.rows) && b.rows.length > 0) {
          const header = b.rows[0] || [];
          const bodyRows = b.rows.slice(1) || [];
          htmlParts.push(`
            <div class="content">
              <table>
                <thead>
                  <tr>
                    ${header.map((h) => `<th>${esc(h)}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${bodyRows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </div>
          `);
        } else if (b.type === 'instructions' && Array.isArray(b.items) && b.items.length > 0) {
          htmlParts.push(`
            <div class="section" style="margin-left: 70px;">
              <p><strong>Instructions:</strong></p>
              <ol style="margin-left: 20px;">
                ${b.items.map((ins) => `<li>${esc(ins)}</li>`).join('')}
              </ol>
            </div>
          `);
        } else if (b.type === 'images' && Array.isArray(b.items) && b.items.length > 0) {
          htmlParts.push(`
            <div class="content" style="margin-top: 40px; display: flex; justify-content: space-around;">
              ${b.items.map((img) => `
                <div style="text-align: center;">
<img src="${img.url.startsWith('http') ? '' : 'http://localhost:8000'}${img.url}" alt="Uploaded Image" style="width: 120px; height: 120px;" />
                  ${img.caption ? `<p style="margin-top: 8px; font-size: 14px;">${esc(img.caption)}</p>` : ''}
                </div>
              `).join('')}
            </div>
          `);
        } else if (b.type === 'ending' && b.text) {
          htmlParts.push(`<div class="section" style="margin-left: 70px;"><p>${esc(b.text)}</p></div>`);
        } else if (b.type === 'signatures' && Array.isArray(b.items) && b.items.length > 0) {
          htmlParts.push(`
            <div class="signatures">
              ${b.items.map((sig) => {
                const name = sig.person_name ? esc(sig.person_name) : esc(sig.person);
                const role = sig.custom_role ? esc(sig.custom_role) : esc(sig.role);
                return `
                  <div class="signature">
                    <p style="font-weight: bold; color: black;">(${name})</p>
                    <p style="font-size: 13px; color: black;">${role}</p>
                  </div>
                `;
              }).join('')}
            </div>
          `);
        }
      });
      const plain_html = htmlParts.join('') || noticeData.content_data?.plain_html || '<p></p>';

      requestBody = {
        notice_type: "custom",
        title: noticeData.title || "Custom Notice",
        // keep meta so header & target meta render
        target_departments: noticeData.target_departments,
        target_groups: noticeData.target_groups,
        // provide ordered html for backend template
        plain_html,
        // clear legacy fields to avoid duplicate rendering
        introduction_content: null,
        ending_content: null,
        instructions: [],
        sections: [],
        table: [],
        images: [],
        signatures: [],
        apply_footer: noticeData.apply_footer,
      };
    } else {
      requestBody = {
        notice_type: noticeType,
        title: "Guest Lecture Notice",
        origin_type: noticeData.origin_type,
        department_name: noticeData.department_name,
        committee_name: noticeData.committee_name,
        venue: finalVenue,
        ...noticeData,
      };
    }

    try {
      const response = await fetch("http://localhost:8000/api/notices/generate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`Error generating PDF: ${response.status}`);

      const data = await response.json();
      if (data.pdf_url) {
        const pdfUrl = `http://localhost:8000${data.pdf_url}`;
        window.open(encodeURI(pdfUrl), "_blank");
        toast.success("Notice PDF generated successfully!");
        
        // Clear the draft after successful PDF generation
        if (draftKey) {
          localStorage.removeItem(draftKey);
        }
      } else {
        throw new Error("PDF URL missing");
      }
    } catch (error) {
      toast.error("PDF generation failed: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getNoticeTypeInfo = () => {
    switch (noticeType) {
      case 'holiday':
        return {
          title: 'Holiday Notice',
          icon: '🏖️',
          color: 'from-teal-600 to-emerald-700'
        };
      case 'guest_lecture':
        return {
          title: 'Guest Lecture Notice',
          icon: '🎓',
          color: 'from-blue-600 to-blue-700'
        };
      case 'exam':
        return {
          title: 'Exam Notice',
          icon: '📝',
          color: 'from-red-600 to-red-700'
        };
      case 'lecture_cancellation':
        return {
          title: '',
          icon: '📄',
          color: 'from-gray-500 to-gray-600'
        };
      case 'assignment':
        return {
          title: 'Assignment Submission Notice',
          icon: '📝',
          color: 'from-indigo-600 to-purple-700'
        };
      case 'sports_events':
        return {
          title: noticeData.title,
          icon: '🏅',
          color: 'from-green-600 to-teal-700'
        };
      case 'result_marksheet_distribution':
        return {
          title: 'Result / Marksheet Distribution Notice',
          icon: '📜',
          color: 'from-teal-600 to-emerald-700'
        };
      case 'photocopy':
        return {
          title: 'Photocopy Application Notice',
          icon: '📄',
          color: 'from-indigo-600 to-purple-700'
        };
      case 'revaluation':
        return {
          title: 'Revaluation Results Notice',
          icon: '📜',
          color: 'from-teal-600 to-emerald-700'
        };
      case 'industrial_visit':
        return {
          title: 'Industrial Visit Notice',
          icon: '🏭',
          color: 'from-blue-600 to-indigo-700'
        };
      case 'seminar_workshop_webinar':
        return {
          title: 'Seminar / Workshop / Webinar Notice',
          icon: '🎓',
          color: 'from-indigo-600 to-purple-700'
        };
      case 'internship':
        return {
          title: 'Internship Notice',
          icon: '💼',
          color: 'from-yellow-600 to-yellow-700'
        };
      default:
        return {
          title: 'Notice',
          icon: '📄',
          color: 'from-gray-500 to-gray-600'
        };
    }
  };

  const noticeInfo = getNoticeTypeInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Notice Preview</h1>
          <p className="text-gray-600">Review your notice before generating the final document</p>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className={`bg-gradient-to-r ${noticeInfo.color} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{noticeInfo.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {noticeInfo.title}
                  </h2>
                  <p className="text-white/80 text-sm">Preview & Confirmation</p>
                </div>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">Draft</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <div className="grid gap-6">
              {/* Notice Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                // ...existing code...
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Notice Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
{noticeType === 'industrial_visit' && (
  <>
    {/* Predefined mode preview */}
    {noticeData.mode === 'predefined' ? (
      <>
        {noticeData.visit_title && (
          <div className="bg-white p-3 rounded border-l-4 border-gray-400 col-span-2">
            <label className="text-sm font-medium text-gray-600">Visit Title</label>
            <p className="text-gray-800 font-semibold">{noticeData.visit_title}</p>
          </div>
        )}
        {noticeData.destination && (
          <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
            <label className="text-sm font-medium text-gray-600">Destination</label>
            <p className="text-gray-800 font-semibold">{noticeData.destination}</p>
          </div>
        )}
        {noticeData.visit_date && (
          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
            <label className="text-sm font-medium text-gray-600">Visit Date</label>
            <p className="text-gray-800 font-semibold">{new Date(noticeData.visit_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        )}

        {(noticeData.consent_deadline_date || noticeData.consent_deadline_time || noticeData.consent_submission_place) && (
          <div className="bg-white p-3 rounded border-l-4 border-orange-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Consent Submission</label>
            <p className="text-gray-800 font-semibold whitespace-pre-wrap">
              {noticeData.consent_deadline_date && (
                <>Date: {new Date(noticeData.consent_deadline_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} </>
              )}
              {noticeData.consent_deadline_time && (<>| Time: {noticeData.consent_deadline_time} </>)}
              {noticeData.consent_submission_place && (<>| Place: {noticeData.consent_submission_place}</>)}
            </p>
          </div>
        )}

        {Array.isArray(noticeData.target_groups) && noticeData.target_groups.length > 0 && (
          <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
            <label className="text-sm font-medium text-gray-600">Target Year Groups</label>
            <p className="text-gray-800 font-semibold">{noticeData.target_groups.join(', ')}</p>
          </div>
        )}

        {Array.isArray(noticeData.target_departments) && noticeData.target_departments.length > 0 && (
          <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
            <label className="text-sm font-medium text-gray-600">Target Departments</label>
            <p className="text-gray-800 font-semibold">{noticeData.target_departments.join(', ')}</p>
          </div>
        )}

        {(noticeData.briefing_date || noticeData.briefing_time || noticeData.briefing_venue) && (
          <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Briefing</label>
            <p className="text-gray-800 font-semibold whitespace-pre-wrap">
              {noticeData.briefing_date && (
                <>Date: {new Date(noticeData.briefing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} </>
              )}
              {noticeData.briefing_time && (<>| Time: {noticeData.briefing_time} </>)}
              {noticeData.briefing_venue && (<>| Venue: {noticeData.briefing_venue}</>)}
            </p>
          </div>
        )}


      </>

    ) : (
      // Custom mode preview
      <>
        {noticeData.custom_content && (
          <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Custom Content</label>
            <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.custom_content}</p>
          </div>
        )}
        {noticeData.destination && (
          <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
            <label className="text-sm font-medium text-gray-600">Destination</label>
            <p className="text-gray-800 font-semibold">{noticeData.destination}</p>
          </div>
        )}
        {noticeData.visit_date && (
          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
            <label className="text-sm font-medium text-gray-600">Visit Date</label>
            <p className="text-gray-800 font-semibold">{new Date(noticeData.visit_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        )}
        {(noticeData.briefing_date || noticeData.briefing_time || noticeData.briefing_venue) && (
          <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Briefing</label>
            <p className="text-gray-800 font-semibold whitespace-pre-wrap">
              {noticeData.briefing_date && (
                <>Date: {new Date(noticeData.briefing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} </>
              )}
              {noticeData.briefing_time && (<>| Time: {noticeData.briefing_time} </>)}
              {noticeData.briefing_venue && (<>| Venue: {noticeData.briefing_venue}</>)}
            </p>
          </div>
        )}
        {noticeData.ending_message && (
          <div className="bg-white p-3 rounded border-l-4 border-pink-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Ending Message</label>
            <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.ending_message}</p>
          </div>
    )}


  </>

)}

    {Array.isArray(noticeData.signatures) && noticeData.signatures.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
        <label className="text-sm font-medium text-gray-600">Signatures</label>
        <div className="mt-2 flex gap-12 justify-center">
          {noticeData.signatures.map((sig, idx) => {
            const staff = staffList.find(s => String(s.id) === String(sig.person));
            const name = sig.person_name
              ? sig.person_name
              : staff
                ? (staff.first_name && staff.last_name
                  ? `${staff.first_name} ${staff.last_name}`
                  : staff.username || staff.id)
                : sig.person;
            return (
              <div key={idx} className="text-center">
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-gray-600 text-sm">
                  {sig.custom_role && sig.custom_role.trim() !== ""
                    ? sig.custom_role
                    : sig.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    )}

  </>
)}
                  {noticeType === 'internship' && (
  <>
    {noticeData.introduction && (
      <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Introduction</label>
        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.introduction}</p>
      </div>
    )}
    {noticeData.organizationName && (
      <div className="bg-white p-3 rounded border-l-4 border-indigo-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Organization Name</label>
        <p className="text-gray-800 font-semibold">{noticeData.organizationName}</p>
      </div>
    )}
    {Array.isArray(noticeData.internshipProfile) && noticeData.internshipProfile.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Internship Profile</label>
        <ul className="list-disc list-inside text-gray-800 font-semibold mt-1">
          {noticeData.internshipProfile.map((item, idx) => (
            <li key={idx} className="ml-4">{item}</li>
          ))}
        </ul>
      </div>
    )}
    {noticeData.internshipDuration && (
      <div className="bg-white p-3 rounded border-l-4 border-green-500">
        <label className="text-sm font-medium text-gray-600">Internship Duration</label>
        <p className="text-gray-800 font-semibold">{noticeData.internshipDuration}</p>
      </div>
    )}
    {noticeData.stipend && (
      <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
        <label className="text-sm font-medium text-gray-600">Stipend</label>
        <p className="text-gray-800 font-semibold">{noticeData.stipend}</p>
      </div>
    )}
    {noticeData.location && (
      <div className="bg-white p-3 rounded border-l-4 border-orange-500">
        <label className="text-sm font-medium text-gray-600">Location</label>
        <p className="text-gray-800 font-semibold">{noticeData.location}</p>
      </div>
    )}
    {noticeData.endingContent && (
      <div className="bg-white p-3 rounded border-l-4 border-red-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Ending Content</label>
        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.endingContent}</p>
      </div>
    )}
    {Array.isArray(noticeData.signatures) && noticeData.signatures.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
        <label className="text-sm font-medium text-gray-600">Signatures</label>
        <div className="mt-2 flex gap-12 justify-center">
          {noticeData.signatures.map((sig, idx) => {
            const staff = staffList.find(s => String(s.id) === String(sig.person));
            const name = sig.person_name
              ? sig.person_name
              : staff
                ? (staff.first_name && staff.last_name
                  ? `${staff.first_name} ${staff.last_name}`
                  : staff.username || staff.id)
                : sig.person;
            return (
              <div key={idx} className="text-center">
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-gray-600 text-sm">
                  {sig.custom_role && sig.custom_role.trim() !== ""
                    ? sig.custom_role
                    : sig.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    )}


  </>
)}
                  {noticeType === 'lecture_cancellation' ? (
                    <>
                      {noticeData.target_audience && (
                        <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Target Audience</label>
                          <p className="text-gray-800 font-semibold">
                          {Array.isArray(noticeData.target_audience) 
                            ? noticeData.target_audience.join(", ") 
                            : noticeData.target_audience}
                          </p>
                        </div>
                      )}
                      <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
                        <label className="text-sm font-medium text-gray-600">Content</label>
                        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data?.content}</p>
                      </div>
                      {Array.isArray(noticeData.content_data?.signatures) && noticeData.content_data.signatures.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Signatures</label>
                          <div className="mt-2 flex gap-12 justify-center">
                            {noticeData.content_data.signatures.map((sig, idx) => {
                              const staff = staffList.find(s => String(s.id) === String(sig.person));
                              const name = sig.person_name
                                ? sig.person_name
                                : staff
                                  ? (staff.first_name && staff.last_name
                                    ? `${staff.first_name} ${staff.last_name}`
                                    : staff.username || staff.id)
                                  : sig.person;
                              return (
                                <div key={idx} className="text-center">
                                  <p className="font-semibold text-gray-800">{name}</p>
                                  <p className="text-gray-600 text-sm">
                                    {sig.custom_role && sig.custom_role.trim() !== ""
                                      ? sig.custom_role
                                      : sig.role}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </>
                    ) : noticeType === 'library' ? (
                    <>
                      {/* Title */}
                      {noticeData.title && (
                        <div className="bg-white p-3 rounded border-l-4 border-gray-400 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Notice Title</label>
                          <p className="text-gray-800 font-semibold">{noticeData.title}</p>
                        </div>
                      )}

                      {/* Content */}
                      {noticeData.content && (
                        <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Content</label>
                          <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content}</p>
                        </div>
                      )}

                      {/* Target Year Groups */}
                      {Array.isArray(noticeData.targetGroups) && noticeData.targetGroups.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-pink-500">
                          <label className="text-sm font-medium text-gray-600">Target Year Groups</label>
                          <p className="text-gray-800 font-semibold">{noticeData.targetGroups.join(', ')}</p>
                        </div>
                      )}

                      {/* Target Departments */}
                      {Array.isArray(noticeData.targetDepartments) && noticeData.targetDepartments.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                          <label className="text-sm font-medium text-gray-600">Target Departments</label>
                          <p className="text-gray-800 font-semibold">
                            {noticeData.targetDepartments.map(deptId => getDeptName(deptId)).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* From Date */}
                      {noticeData.fromDate && (
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <label className="text-sm font-medium text-gray-600">From Date</label>
                          <p className="text-gray-800 font-semibold">{new Date(noticeData.fromDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      )}

                      {/* To Date */}
                      {noticeData.toDate && (
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <label className="text-sm font-medium text-gray-600">To Date</label>
                          <p className="text-gray-800 font-semibold">{new Date(noticeData.toDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      )}

                      {/* Instructions */}
                      {Array.isArray(noticeData.instructions) && noticeData.instructions.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-orange-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Instructions</label>
                          <ul className="list-disc list-inside text-gray-800 font-semibold mt-1">
                            {noticeData.instructions.map((instruction, idx) => (
                              <li key={idx} className="ml-4">{instruction}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Ending Content */}
                      {noticeData.endingContent && (
                        <div className="bg-white p-3 rounded border-l-4 border-red-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Ending Content</label>
                          <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.endingContent}</p>
                        </div>
                      )}

                      {/* Signatures */}
                      {Array.isArray(noticeData.signatures) && noticeData.signatures.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
                          <div className="mt-2 flex gap-12 justify-center">
                            {noticeData.signatures.map((sig, idx) => {
                              const staff = staffList.find(s => String(s.id) === String(sig.person));
                              const name = sig.person_name
                                ? sig.person_name
                                : staff
                                  ? (staff.first_name && staff.last_name
                                    ? `${staff.first_name} ${staff.last_name}`
                                    : staff.username || staff.id)
                                  : sig.person;
                              return (
                                <div key={idx} className="text-center">
                                  <p className="font-semibold text-gray-800">{name}</p>
                                  <p className="text-gray-600 text-sm">
                                    {sig.custom_role && sig.custom_role.trim() !== ""
                                      ? sig.custom_role
                                      : sig.role}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </>
                  ) : noticeType === 'assignment' ? (
                    <>
                      {/* Assignment Title */}
                      {noticeData.content_data?.assignment_title && (
                        <div className="bg-white p-3 rounded border-l-4 border-indigo-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Assignment Title</label>
                          <p className="text-gray-800 font-semibold">{noticeData.content_data.assignment_title}</p>
                        </div>
                      )}

                      {/* Target Groups */}
                      {Array.isArray(noticeData.content_data?.target_groups) && noticeData.content_data.target_groups.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-pink-500">
                          <label className="text-sm font-medium text-gray-600">Target Year Groups</label>
                          <p className="text-gray-800 font-semibold">{noticeData.content_data.target_groups.join(', ')}</p>
                        </div>
                      )}

                      {/* Target Departments */}
                      {Array.isArray(noticeData.content_data?.target_departments) && noticeData.content_data.target_departments.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                          <label className="text-sm font-medium text-gray-600">Target Departments</label>
                          <p className="text-gray-800 font-semibold">
                            {noticeData.content_data.target_departments.map(deptId => getDeptName(deptId)).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Introduction Content */}
                      {noticeData.content_data?.introduction_content && (
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Introduction Content</label>
                          <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data.introduction_content}</p>
                        </div>
                      )}

                      {/* Instructions */}
                      {Array.isArray(noticeData.content_data?.instructions) && noticeData.content_data.instructions.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-orange-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Instructions</label>
                          <ul className="list-disc list-inside text-gray-800 font-semibold mt-1">
                            {noticeData.content_data.instructions.map((instruction, idx) => (
                              <li key={idx} className="ml-4">{instruction}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Assignment Table */}
                      {Array.isArray(noticeData.assignment_table) && noticeData.assignment_table.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-green-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Assignment Submission Schedule</label>
                          <div className="mt-2">
                            <table className="w-full border-collapse border border-gray-300 text-sm">
                              <thead>
                                <tr className="text-black">
                                  {noticeData.assignment_table[0].map((header, colIndex) => (
                                    <th key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800 font-semibold">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {noticeData.assignment_table.slice(1).map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                      <td key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Ending Content */}
                      {noticeData.content_data?.ending_content && (
                        <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Ending Content</label>
                          <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data.ending_content}</p>
                        </div>
                      )}

                      {/* Signatures */}
                      {Array.isArray(noticeData.content_data?.signatures) && noticeData.content_data.signatures.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
                          <div className="mt-2 flex gap-12 justify-center">
                            {noticeData.content_data.signatures.map((sig, idx) => {
                              const staff = staffList.find(s => String(s.id) === String(sig.person));
                              const name = sig.person_name
                                ? sig.person_name
                                : staff
                                  ? (staff.first_name && staff.last_name
                                    ? `${staff.first_name} ${staff.last_name}`
                                    : staff.username || staff.id)
                                  : sig.person;
                              return (
                                <div key={idx} className="text-center">
                                  <p className="font-semibold text-gray-800">{name}</p>
                                  <p className="text-gray-600 text-sm">
                                    {sig.custom_role && sig.custom_role.trim() !== ""
                                      ? sig.custom_role
                                      : sig.role}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
      
                      )}



                    </>
                ) : noticeType === 'custom' ? (
                  <>
                    {/* Custom Notice Title */}
                    {noticeData.title && (
                      <div className="bg-white p-3 rounded border-l-4 border-gray-400 col-span-2">
                        <label className="text-sm font-medium text-gray-600">Notice Title</label>
                        <p className="text-gray-800 font-semibold">{noticeData.title}</p>
                      </div>
                    )}

                    {/* Target Meta (always shown if present) */}
                    {Array.isArray(noticeData.target_departments) && noticeData.target_departments.length > 0 && (
                      <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                        <label className="text-sm font-medium text-gray-600">Target Departments</label>
                        <p className="text-gray-800 font-semibold">
                          {noticeData.target_departments.map(deptId => getDeptName(deptId)).join(', ')}
                        </p>
                      </div>
                    )}
                    {Array.isArray(noticeData.target_groups) && noticeData.target_groups.length > 0 && (
                      <div className="bg-white p-3 rounded border-l-4 border-pink-500">
                        <label className="text-sm font-medium text-gray-600">Target Year Groups</label>
                        <p className="text-gray-800 font-semibold">{noticeData.target_groups.join(', ')}</p>
                      </div>
                    )}

                    {/* Plain HTML Content for Custom Notices (when ordered_blocks are not present) */}
                    {(!Array.isArray(noticeData.ordered_blocks) || noticeData.ordered_blocks.length === 0) && noticeData.content_data?.plain_html && (
                      <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
                        <label className="text-sm font-medium text-gray-600">Content</label>
                        <div className="mt-2 prose max-w-none" style={{ color: 'black' }} dangerouslySetInnerHTML={{ __html: noticeData.content_data.plain_html }} />
                      </div>
                    )}

                    {/* Ordered Blocks (for structured custom notices) */}
                    {Array.isArray(noticeData.ordered_blocks) && noticeData.ordered_blocks.length > 0 && (
                      <div className="col-span-2 space-y-4">
                        {noticeData.ordered_blocks.map((b, idx) => {
                          if (b.type === 'introduction' && b.text) {
                            return (
                              <div key={idx} className="bg-white p-3 rounded border-l-4 border-purple-500">
                                <label className="text-sm font-medium text-gray-600">Introduction</label>
                                <p className="text-gray-800 font-semibold whitespace-pre-wrap">{b.text}</p>
                              </div>
                            );
                          }
                          if (b.type === 'section' && (b.title || b.text || (Array.isArray(b.list) && b.list.length))) {
                            return (
                              <div key={idx} className="bg-white p-3 rounded border-l-4 border-indigo-500">
                                <label className="text-sm font-medium text-gray-600">Section</label>
                                <div className="mt-2 border-l-2 border-indigo-200 pl-4">
                                  {b.title && <h4 className="font-semibold text-gray-800">{b.title}</h4>}
                                  {b.text && <p className="text-gray-700 whitespace-pre-wrap mt-1">{b.text}</p>}
                                  {Array.isArray(b.list) && b.list.length > 0 && (
                                    <ul className="list-disc list-inside text-gray-700 mt-2">
                                      {b.list.map((item, itemIdx) => (
                                        <li key={itemIdx}>{item}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          if (b.type === 'table' && Array.isArray(b.rows) && b.rows.length > 0) {
                            return (
                              <div key={idx} className="bg-white p-3 rounded border-l-4 border-green-500">
                                <label className="text-sm font-medium text-gray-600">Table</label>
                                <div className="overflow-x-auto mt-2">
                                  <table className="w-full border-collapse border border-gray-300 text-sm">
                                    <thead>
                                      <tr className="text-black">
                                        {b.rows[0].map((header, colIndex) => (
                                          <th key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800 font-semibold">{header}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {b.rows.slice(1).map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                          {row.map((cell, colIndex) => (
                                            <td key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800">{cell}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          }
                          if (b.type === 'instructions' && Array.isArray(b.items) && b.items.length > 0) {
                            return (
                              <div key={idx} className="bg-white p-3 rounded border-l-4 border-orange-500">
                                <label className="text-sm font-medium text-gray-600">Instructions</label>
                                <ul className="list-disc list-inside text-gray-800 font-semibold mt-1">
                                  {b.items.map((instruction, i) => (
                                    <li key={i} className="ml-4">{instruction}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }
                          if (b.type === 'images' && Array.isArray(b.items) && b.items.length > 0) {
                            return (
                              <div key={idx} className="bg-white p-3 rounded border-l-4 border-blue-500">
                                <label className="text-sm font-medium text-gray-600">Images</label>
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {b.items.map((img, i) => (
                                    <div key={i} className="text-center">
<img src={`${img.url.startsWith('http') ? '' : 'http://localhost:8000'}${img.url}`} alt={img.caption || `Image ${i + 1}`} className="w-full h-32 object-cover rounded border" />
                                      {img.caption && <p className="text-sm text-gray-600 mt-1">{img.caption}</p>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          if (b.type === 'ending' && b.text) {
                            return (
                              <div key={idx} className="bg-white p-3 rounded border-l-4 border-purple-500">
                                <label className="text-sm font-medium text-gray-600">Ending Content</label>
                                <p className="text-gray-800 font-semibold whitespace-pre-wrap">{b.text}</p>
                              </div>
                            );
                          }
                          if (b.type === 'signatures' && Array.isArray(b.items) && b.items.length > 0) {
                            return (
                              <div key={idx} className="bg-white p-3 rounded border-l-4 border-green-600">
                                <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
                                <div className="mt-2 flex gap-12 justify-center">
                                  {b.items.map((sig, i) => {
                                    const staff = staffList.find(s => String(s.id) === String(sig.person));
                                    const name = sig.person_name
                                      ? sig.person_name
                                      : staff
                                        ? (staff.first_name && staff.last_name
                                          ? `${staff.first_name} ${staff.last_name}`
                                          : staff.username || staff.id)
                                        : sig.person;
                                    return (
                                      <div key={i} className="text-center">
                                        <p className="font-semibold text-gray-800">{name}</p>
                                        <p className="text-gray-600 text-sm">{sig.custom_role && sig.custom_role.trim() !== '' ? sig.custom_role : sig.role}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}


                  </>
                ) : (
                    <>
                      {noticeData.content_data?.holiday_date && (
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                          <label className="text-sm font-medium text-gray-600">Holiday Date</label>
                          <p className="text-gray-800 font-semibold">{noticeData.content_data.holiday_date}</p>
                        </div>
                      )}
                      
                      {noticeData.content_data?.holiday_title && (
                        <div className="bg-white p-3 rounded border-l-4 border-green-500">
                          <label className="text-sm font-medium text-gray-600">Reason</label>
                          <p className="text-gray-800 font-semibold">{noticeData.content_data.holiday_title}</p>
                        </div>
                      )}

                      {noticeData.mode === 'custom' && noticeData.custom_content && (
                        <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Custom Content</label>
                          <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.custom_content}</p>
                        </div>
                      )}

                      {noticeData.content_data?.language && noticeType !== 'industrial_visit' && (
                        <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                          <label className="text-sm font-medium text-gray-600">Language</label>
                          <p className="text-gray-800 font-semibold capitalize">{noticeData.content_data.language}</p>
                        </div>
                      )}


{/* Exam Notice Extra Details and Footer Option */}
                      {noticeType === "exam" && (
                        <>
                          {noticeData.content_data?.exam_title && (
                            <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
                              <label className="text-sm font-medium text-gray-600">Exam Title</label>
                              <p className="text-gray-800 font-semibold">{noticeData.content_data.exam_title}</p>
                            </div>
                          )}
                          {noticeData.content_data?.exam_month && (
                            <div className="bg-white p-3 rounded border-l-4 border-pink-500">
                              <label className="text-sm font-medium text-gray-600">Exam Month/Year</label>
                              <p className="text-gray-800 font-semibold">{noticeData.content_data.exam_month}</p>
                            </div>
                          )}
                          {noticeData.content_data?.course_dept_semester && (
                            <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                              <label className="text-sm font-medium text-gray-600">Course/Dept Semester</label>
                              <p className="text-gray-800 font-semibold">{noticeData.content_data.course_dept_semester}</p>
                            </div>
                          )}
                          {noticeData.content_data?.exam_category && (
                            <div className="bg-white p-3 rounded border-l-4 border-green-500">
                              <label className="text-sm font-medium text-gray-600">Category</label>
                              <p className="text-gray-800 font-semibold">{noticeData.content_data.exam_category}</p>
                            </div>
                          )}
                          {noticeData.content_data?.introduction_content && (
                            <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
                              <label className="text-sm font-medium text-gray-600">Introduction Content</label>
                              <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data.introduction_content}</p>
                            </div>
                          )}
                          {/* Exam Table Preview */}
                      {noticeType === 'exam' && Array.isArray(noticeData.exam_table) && noticeData.exam_table.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-red-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Exam Schedule</label>
                          <table className="w-full mt-2 border-collapse border border-gray-300 text-sm">
                            <tbody>
                              {noticeData.exam_table.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, colIndex) => (
                                    <td key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                          
                        </>
                      )}
                      {/* Exam Signatures Section */}
                      {noticeType === "exam" && Array.isArray(noticeData.content_data?.signatures) && noticeData.content_data.signatures.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
                            <div className="mt-2 flex gap-12 justify-center">
                              {noticeData.content_data.signatures.map((sig, idx) => {
                                const staff = staffList.find(s => String(s.id) === String(sig.person));
                                const name = sig.person_name
                                ? sig.person_name
                                : staff
                                  ? (staff.first_name && staff.last_name
                                    ? `${staff.first_name} ${staff.last_name}`
                                    : staff.username || staff.id)
                                  : sig.person;
                                return (
                                  <div key={idx} className="text-center">
                                    <p className="font-semibold text-gray-800">{name}</p>
                                    <p className="text-gray-600 text-sm">
                                      {sig.custom_role && sig.custom_role.trim() !== ""
                                        ? sig.custom_role
                                        : sig.role}
                                    </p>
                                  </div>
                                  
                                );
                              })}
                            </div>
                        </div>
                      )}

                      {/* Timetable Table Preview */}
                  <>
                  {noticeType === 'class_timetable' && (
                    <>
                      {noticeData.title && (
                        <div className="bg-white p-3 rounded border-l-4 border-gray-400 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Title</label>
                          <p className="text-gray-800 font-semibold">{noticeData.title}</p>
                        </div>
                      )}
                      {Array.isArray(noticeData.timetable_table) && noticeData.timetable_table.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-indigo-500 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Class Timetable</label>
                          <div className="overflow-x-auto mt-2">
                            <table className="w-full border-collapse border border-gray-300 text-sm">
                              <thead>
                                <tr className="text-black">
                                  {noticeData.timetable_table[0].map((header, colIndex) => (
                                    <th key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800 font-semibold">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {noticeData.timetable_table.slice(1).map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                      <td key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {/* Signatures */}
                      {Array.isArray(noticeData.content_data?.signatures) && noticeData.content_data.signatures.length > 0 && (
                        <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
                          <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
                          <div className="mt-2 flex gap-12 justify-center">
                            {noticeData.content_data.signatures.map((sig, idx) => {
                              const staff = staffList.find(s => String(s.id) === String(sig.person));
                              const name = sig.person_name
                                ? sig.person_name
                                : staff
                                  ? (staff.first_name && staff.last_name
                                    ? `${staff.first_name} ${staff.last_name}`
                                    : staff.username || staff.id)
                                  : sig.person;
                              return (
                                <div key={idx} className="text-center">
                                  <p className="font-semibold text-gray-800">{name}</p>
                                  <p className="text-gray-600 text-sm">
                                    {sig.custom_role && sig.custom_role.trim() !== ""
                                      ? sig.custom_role
                                      : sig.role}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
 {noticeType === "sports_events" && (
  <>
    {/* 🔹 Title at the top */}
    {noticeData.title && (
      <div className="bg-white p-3 rounded border-l-4 border-gray-400 col-span-2">
        <label className="text-sm font-medium text-gray-600">Title</label>
        <p className="text-gray-800 font-semibold">{noticeData.title}</p>
      </div>
    )}

    {/* Introduction */}
    {noticeData.content_data?.introduction && (
      <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Introduction</label>
        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data.introduction}</p>
      </div>
    )}

    {/* Sports Events Table */}
    {noticeData.content_data?.table_data?.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-green-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Sports Events Schedule</label>
        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="text-black">
                {noticeData.content_data.table_data[0].map((header, colIndex) => (
                  <th key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {noticeData.content_data.table_data.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Ending Content */}
    {noticeData.content_data?.ending_content && (
      <div className="bg-white p-3 rounded border-l-4 border-orange-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Ending Content</label>
        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data.ending_content}</p>
      </div>
    )}

    {/* Signatures */}
    {Array.isArray(noticeData.content_data?.signatures) && noticeData.content_data.signatures.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
        <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
        <div className="mt-2 flex gap-12 justify-center">
          {noticeData.content_data.signatures.map((sig, idx) => {
            const staff = staffList.find(s => String(s.id) === String(sig.person));
            const name = sig.person_name
              ? sig.person_name
              : staff
                ? (staff.first_name && staff.last_name
                  ? `${staff.first_name} ${staff.last_name}`
                  : staff.username || staff.id)
                : sig.person;
            return (
              <div key={idx} className="text-center">
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-gray-600 text-sm">
                  {sig.custom_role && sig.custom_role.trim() !== ""
                    ? sig.custom_role
                    : sig.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    )}


  </>
)}

{noticeType === "result_marksheet_distribution" && (
  <>
    {/* Title */}
    {noticeData.content_data?.result_title && (
      <div className="bg-white p-3 rounded border-l-4 border-gray-400 col-span-2">
        <label className="text-sm font-medium text-gray-600">Result/Marksheet Distribution Notice Title</label>
        <p className="text-gray-800 font-semibold">{noticeData.content_data.result_title}</p>
      </div>
    )}

    {/* Introduction */}
    {noticeData.content_data?.introduction_content && (
      <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Introduction</label>
        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data.introduction_content}</p>
      </div>
    )}

    {/* Distribution Table */}
    {Array.isArray(noticeData.distribution_table) && noticeData.distribution_table.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-green-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Marsheet Distribution Schedule</label>
        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="text-black">
                {noticeData.distribution_table[0].map((header, colIndex) => (
                  <th key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {noticeData.distribution_table.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Instructions */}
    {Array.isArray(noticeData.content_data?.instructions) && noticeData.content_data.instructions.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-orange-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Instructions</label>
        <ul className="list-disc list-inside text-gray-800 font-semibold mt-1">
          {noticeData.content_data.instructions.map((instruction, idx) => (
            <li key={idx} className="ml-4">{instruction}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Ending Content */}
    {noticeData.content_data?.ending_content && (
      <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Ending Content</label>
        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data.ending_content}</p>
      </div>
    )}

    {/* Signatures */}
    {Array.isArray(noticeData.content_data?.signatures) && noticeData.content_data.signatures.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
        <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
        <div className="mt-2 flex gap-12 justify-center">
          {noticeData.content_data.signatures.map((sig, idx) => {
            const staff = staffList.find(s => String(s.id) === String(sig.person));
            const name = sig.person_name
              ? sig.person_name
              : staff
                ? (staff.first_name && staff.last_name
                  ? `${staff.first_name} ${staff.last_name}`
                  : staff.username || staff.id)
                : sig.person;
            return (
              <div key={idx} className="text-center">
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-gray-600 text-sm">
                  {sig.custom_role && sig.custom_role.trim() !== ""
                    ? sig.custom_role
                    : sig.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    )}


  </>
)}

{noticeType === "revaluation" && (
  <>
    {/* Title */}
    {noticeData.content_data?.result_title && (
      <div className="bg-white p-3 rounded border-l-4 border-gray-400 col-span-2">
        <label className="text-sm font-medium text-gray-600">Revaluation Notice Title</label>
        <p className="text-gray-800 font-semibold">{noticeData.content_data.result_title}</p>
      </div>
    )}

    {/* Introduction */}
    {noticeData.content_data?.introduction_content && (
      <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Introduction</label>
        <p className="text-gray-800">{noticeData.content_data.introduction_content}</p>
      </div>
    )}

    {/* Revaluation Table */}
    {Array.isArray(noticeData.revaluation_table) &&
      noticeData.revaluation_table.length > 1 && (
        <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
          <label className="text-sm font-medium text-gray-600">Revaluation Table</label>
        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
{noticeType === "revaluation" ? (
    <>
      <tr className="bg-gray-100">
        <th rowSpan={2} className="border px-3 py-2 text-black text-center" style={{ width: "3%" }}>Sr No</th>
        <th rowSpan={2} className="border px-3 py-2 text-black text-left" style={{ width: "18%" }}>Name of Students</th>
        <th rowSpan={2} className="border px-3 py-2 text-black text-center" style={{ width: "10%" }}>Class</th>
        <th rowSpan={2} className="border px-3 py-2 text-black text-center" style={{ width: "5%" }}>Sem</th>
        <th rowSpan={2} className="border px-3 py-2 text-black text-center" style={{ width: "5%" }}>Seat No</th>
        <th rowSpan={2} className="border px-3 py-2 text-black text-center" style={{ width: "8%" }}>Subject Code</th>
        <th rowSpan={2} className="border px-3 py-2 text-black text-left" style={{ width: "15%" }}>Subject</th>
        <th colSpan={3} className="border px-3 py-2 text-black text-center" style={{ width: "20%" }}>
          Result of Verification of Mark
        </th>
        <th rowSpan={2} className="border px-3 py-2 text-black text-center" style={{ width: "10%" }}>
          Student Signature Received Result
        </th>
      </tr>
      <tr className="bg-gray-100">
        <th className="border px-3 py-2 text-black text-center" style={{ width: "6.66%" }}>Previous Marks</th>
        <th className="border px-3 py-2 text-black text-center" style={{ width: "6.66%" }}>Marks after Revaluation</th>
        <th className="border px-3 py-2 text-black text-center" style={{ width: "6.66%" }}>Result of the Revaluation</th>
      </tr>
    </>
  ) : (
    <tr>
      {noticeData.revaluation_table[0].map((header, i) => (
        <th key={i} className="border px-3 py-2 text-black text-center">
          {header || ""}
        </th>
      ))}
    </tr>
  )}
</thead>

              <tbody>
                {noticeData.revaluation_table.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800">
                        {cell || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    {/* Instructions */}
    {Array.isArray(noticeData.content_data?.instructions) &&
      noticeData.content_data.instructions.length > 0 && (
        <div className="bg-white p-3 rounded border-l-4 border-yellow-500 col-span-2">
          <label className="text-sm font-medium text-gray-600">Instructions</label>
          <ul className="list-disc list-inside text-gray-800 mt-1">
            {noticeData.content_data.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>
        </div>
      )}

    {/* Ending */}
    {noticeData.content_data?.ending_content && (
      <div className="bg-white p-3 rounded border-l-4 border-pink-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Ending Note</label>
        <p className="text-gray-800">{noticeData.content_data.ending_content}</p>
      </div>
    )}

    {/* Signatures */}
    {Array.isArray(noticeData.content_data?.signatures) &&
      noticeData.content_data.signatures.length > 0 && (
        <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
          <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
          <div className="mt-2 flex gap-12 justify-center">
            {noticeData.content_data.signatures.map((sig, idx) => {
              const staff = staffList.find((s) => String(s.id) === String(sig.person));
              const name = sig.person_name
                ? sig.person_name
                : staff
                ? (staff.first_name && staff.last_name
                    ? `${staff.first_name} ${staff.last_name}`
                    : staff.username || staff.id)
                : sig.person;
              return (
                <div key={idx} className="text-center">
                  <p className="font-semibold text-gray-800">{name}</p>
                  <p className="text-gray-600 text-sm">
                    {sig.custom_role?.trim() !== "" ? sig.custom_role : sig.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
  </>
)}


{noticeType === "photocopy" && (
  <>
    {/* Title */}
    {noticeData.content_data?.title && (
      <div className="bg-white p-3 rounded border-l-4 border-gray-400 col-span-2">
        <label className="text-sm font-medium text-gray-600">Notice Title</label>
        <p className="text-gray-800 font-semibold">{noticeData.content_data.title}</p>
      </div>
    )}

    {/* Custom Mode Fields */}
    {noticeData.mode === "custom" && (
      <>
        {/* Introduction Content */}
        <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
          <label className="text-sm font-medium text-gray-600">Introduction</label>
          <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data?.introduction_content || ""}</p>
        </div>

        {/* Steps Title */}
        {noticeData.content_data?.steps_title && (
          <div className="bg-white p-3 rounded border-l-4 border-indigo-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Steps Title</label>
            <p className="text-gray-800 font-semibold">{noticeData.content_data.steps_title}</p>
          </div>
        )}

        {/* Steps */}
        {Array.isArray(noticeData.content_data?.steps) && noticeData.content_data.steps.length > 0 && (
          <div className="bg-white p-3 rounded border-l-4 border-green-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Application Steps</label>
            <ol className="list-decimal list-inside text-gray-800 font-semibold mt-1">
              {noticeData.content_data.steps.map((step, idx) => (
                <li key={idx} className="ml-4">{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Instructions */}
        {Array.isArray(noticeData.content_data?.instructions) && noticeData.content_data.instructions.length > 0 && (
          <div className="bg-white p-3 rounded border-l-4 border-orange-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Instructions</label>
            <ul className="list-disc list-inside text-gray-800 font-semibold mt-1">
              {noticeData.content_data.instructions.map((instruction, idx) => (
                <li key={idx} className="ml-4">{instruction}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Fees */}
        {Array.isArray(noticeData.content_data?.fees) && noticeData.content_data.fees.length > 0 && (
          <div className="bg-white p-3 rounded border-l-4 border-yellow-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Fees</label>
            <div className="mt-2 space-y-2">
              {noticeData.content_data.fees.map((fee, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-gray-700 font-medium">{fee.heading}:</span>
                  <span className="text-gray-800 font-semibold">{fee.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="bg-white p-3 rounded border-l-4 border-red-500 col-span-2">
          <label className="text-sm font-medium text-gray-600">Note</label>
          <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data?.note || ""}</p>
        </div>

        {/* Ending Content */}
        <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
          <label className="text-sm font-medium text-gray-600">Ending Content</label>
          <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data?.ending_content || ""}</p>
        </div>
      </>
    )}

    {/* Predefined Mode Fields */}
    {noticeData.mode !== "custom" && (
      <>
        {/* Application Dates */}
        {noticeData.content_data?.application_start_date && (
          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
            <label className="text-sm font-medium text-gray-600">Application Start Date</label>
            <p className="text-gray-800 font-semibold">{noticeData.content_data.application_start_date}</p>
          </div>
        )}

        {noticeData.content_data?.application_end_date && (
          <div className="bg-white p-3 rounded border-l-4 border-blue-500">
            <label className="text-sm font-medium text-gray-600">Application End Date</label>
            <p className="text-gray-800 font-semibold">{noticeData.content_data.application_end_date}</p>
          </div>
        )}

        {/* Steps */}
        {Array.isArray(noticeData.content_data?.steps) && noticeData.content_data.steps.length > 0 && (
          <div className="bg-white p-3 rounded border-l-4 border-green-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Application Steps</label>
            <ol className="list-decimal list-inside text-gray-800 font-semibold mt-1">
              {noticeData.content_data.steps.map((step, idx) => (
                <li key={idx} className="ml-4">{step}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Fees */}
        {noticeData.content_data?.fees && typeof noticeData.content_data.fees === 'object' && (
          <div className="bg-white p-3 rounded border-l-4 border-yellow-500 col-span-2">
            <label className="text-sm font-medium text-gray-600">Fee Structure</label>
            <div className="mt-2 space-y-1">
              {Object.entries(noticeData.content_data.fees).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-gray-800 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    )}

    {/* Signatures */}
    {Array.isArray(noticeData.content_data?.signatures) && noticeData.content_data.signatures.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
        <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
        <div className="mt-2 flex gap-12 justify-center">
          {noticeData.content_data.signatures.map((sig, idx) => {
            const staff = staffList.find(s => String(s.id) === String(sig.person));
            const name = sig.person_name
              ? sig.person_name
              : staff
                ? (staff.first_name && staff.last_name
                  ? `${staff.first_name} ${staff.last_name}`
                  : staff.username || staff.id)
                : sig.person;
            return (
              <div key={idx} className="text-center">
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-gray-600 text-sm">
                  {sig.custom_role && sig.custom_role.trim() !== ""
                    ? sig.custom_role
                    : sig.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    )}


  </>
)}

{noticeType === "seminar_workshop_webinar" && (
  <>
    {/* Title */}
    {noticeData.content_data?.title && (
      <div className="bg-white p-3 rounded border-l-4 border-gray-400 col-span-2">
        <label className="text-sm font-medium text-gray-600">Title</label>
        <p className="text-gray-800 font-semibold">{noticeData.content_data.title}</p>
      </div>
    )}

    {/* Content */}
    {noticeData.content_data?.content && (
      <div className="bg-white p-3 rounded border-l-4 border-purple-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Content</label>
        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data.content}</p>
      </div>
    )}

    {/* Seminar/Workshop/Webinar Table */}
    {Array.isArray(noticeData.seminar_workshop_table) && noticeData.seminar_workshop_table.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-green-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Seminar / Workshop / Webinar Schedule</label>
        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="text-black">
                {noticeData.seminar_workshop_table[0].map((header, colIndex) => (
                  <th key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {noticeData.seminar_workshop_table.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="border border-gray-300 px-2 py-1 text-gray-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Ending Content */}
    {noticeData.content_data?.ending_content && (
      <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
        <label className="text-sm font-medium text-gray-600">Ending Content</label>
        <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.content_data.ending_content}</p>
      </div>
    )}

    {/* Signatures */}
    {Array.isArray(noticeData.content_data?.signatures) && noticeData.content_data.signatures.length > 0 && (
      <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
        <label className="text-sm font-medium text-gray-600">Authorized Signatures</label>
        <div className="mt-2 flex gap-12 justify-center">
          {noticeData.content_data.signatures.map((sig, idx) => {
            const staff = staffList.find(s => String(s.id) === String(sig.person));
            const name = sig.person_name
              ? sig.person_name
              : staff
                ? (staff.first_name && staff.last_name
                  ? `${staff.first_name} ${staff.last_name}`
                  : staff.username || staff.id)
                : sig.person;
            return (
              <div key={idx} className="text-center">
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-gray-600 text-sm">
                  {sig.custom_role && sig.custom_role.trim() !== ""
                    ? sig.custom_role
                    : sig.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    )}

  </>
)}

</>



                  </>




)}



                      {/* Guest Lecture Notice Specific Fields */}
                      {noticeType === 'guest_lecture' && (
                        <>
                          {/* Lecture Title */}
                          {(noticeData.lecture_title || noticeData.lectureTitle) && (
                            <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
                              <label className="text-sm font-medium text-gray-600">Lecture Title</label>
                              <p className="text-gray-800 font-semibold">{noticeData.lecture_title || noticeData.lectureTitle}</p>
                            </div>
                          )}

                          {/* Speaker Details */}
                          {(noticeData.speaker_name || noticeData.speaker) && (
                            <div className="bg-white p-3 rounded border-l-4 border-green-500">
                              <label className="text-sm font-medium text-gray-600">Speaker Name</label>
                              <p className="text-gray-800 font-semibold">{noticeData.speaker_name || noticeData.speaker}</p>
                            </div>
                          )}

                          {(noticeData.speaker_designation || noticeData.designation) && (
                            <div className="bg-white p-3 rounded border-l-4 border-green-500">
                              <label className="text-sm font-medium text-gray-600">Speaker Designation</label>
                              <p className="text-gray-800 font-semibold">{noticeData.speaker_designation || noticeData.designation}</p>
                            </div>
                          )}

                          {noticeData.speaker_organization && (
                            <div className="bg-white p-3 rounded border-l-4 border-green-500">
                              <label className="text-sm font-medium text-gray-600">Speaker Organization</label>
                              <p className="text-gray-800 font-semibold">{noticeData.speaker_organization}</p>
                            </div>
                          )}

                          {noticeData.speaker_profile && (
                            <div className="bg-white p-3 rounded border-l-4 border-green-500 col-span-2">
                              <label className="text-sm font-medium text-gray-600">Speaker Profile</label>
                              <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.speaker_profile}</p>
                            </div>
                          )}

                          {/* Date and Time */}
                          {(noticeData.date || noticeData.guest_lecture_date) && (
                            <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                              <label className="text-sm font-medium text-gray-600">Date</label>
                              <p className="text-gray-800 font-semibold">{new Date(noticeData.date || noticeData.guest_lecture_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                          )}

                          {noticeData.time && (
                            <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                              <label className="text-sm font-medium text-gray-600">Time</label>
                              <p className="text-gray-800 font-semibold">{noticeData.time}</p>
                            </div>
                          )}

                          {/* Venue */}
                          {finalVenue && (
                            <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
                              <label className="text-sm font-medium text-gray-600">Venue</label>
                              <p className="text-gray-800 font-semibold">{finalVenue}</p>
                            </div>
                          )}

                          {/* Target Audience */}
                          {Array.isArray(noticeData.departments) && noticeData.departments.length > 0 && (
                            <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                              <label className="text-sm font-medium text-gray-600">Target Departments</label>
                              <p className="text-gray-800 font-semibold">
                                {noticeData.departments.map(deptId => getDeptName(deptId)).join(', ')}
                              </p>
                            </div>
                          )}

                          {Array.isArray(noticeData.years) && noticeData.years.length > 0 && (
                            <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                              <label className="text-sm font-medium text-gray-600">Target Year Groups</label>
                              <p className="text-gray-800 font-semibold">{noticeData.years.join(', ')}</p>
                            </div>
                          )}

                          {/* Category and Organization */}
                          {noticeData.category && (
                            <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                              <label className="text-sm font-medium text-gray-600">Category</label>
                              <p className="text-gray-800 font-semibold capitalize">{noticeData.category}</p>
                            </div>
                          )}

                          {noticeData.category === 'committee' && noticeData.committee && (
                            <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                              <label className="text-sm font-medium text-gray-600">Organizing Committee</label>
                              <p className="text-gray-800 font-semibold">{noticeData.committee}</p>
                            </div>
                          )}

                          {/* Custom Content */}
                          {noticeData.mode === 'custom' && noticeData.custom_content && (
                            <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
                              <label className="text-sm font-medium text-gray-600">Custom Content</label>
                              <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.custom_content}</p>
                            </div>
                          )}

                          {/* Introduction Text for Predefined Mode */}
                          {noticeData.mode === 'predefined' && introductionText && (
                            <div className="bg-white p-3 rounded border-l-4 border-blue-500 col-span-2">
                              <label className="text-sm font-medium text-gray-600">Introduction</label>
                              <p className="text-gray-800 font-semibold whitespace-pre-wrap">{introductionText}</p>
                            </div>
                          )}

                          {/* Learning Outcomes */}
                          {Array.isArray(noticeData.learning_outcomes) && noticeData.learning_outcomes.length > 0 && (
                            <div className="bg-white p-3 rounded border-l-4 border-indigo-500 col-span-2">
                              <label className="text-sm font-medium text-gray-600">Learning Outcomes</label>
                              <ul className="list-disc list-inside text-gray-800 font-semibold mt-1">
                                {noticeData.learning_outcomes.map((lo, idx) => (
                                  <li key={idx}>{lo}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Ending Message */}
                          {noticeData.ending_message && (
                            <div className="bg-white p-3 rounded border-l-4 border-gray-500 col-span-2">
                              <label className="text-sm font-medium text-gray-600">Ending Message</label>
                              <p className="text-gray-800 font-semibold whitespace-pre-wrap">{noticeData.ending_message}</p>
                            </div>
                          )}

                          {/* Signed By */}
                          {noticeData.signed_by && (
                            <div className="bg-white p-3 rounded border-l-4 border-teal-500 col-span-2">
                              <label className="text-sm font-medium text-gray-600">Signed By</label>
                              <p className="text-gray-800 font-semibold">{noticeData.signed_by}</p>
                            </div>
                          )}

                          {/* Signatures */}
                          {Array.isArray(noticeData.signatures) && noticeData.signatures.length > 0 && (
                            <div className="bg-white p-3 rounded border-l-4 border-green-600 col-span-2">
                              <label className="text-sm font-medium text-gray-600">Signatures</label>
                              <div className="mt-2 flex gap-12 justify-center">
                                {noticeData.signatures.map((sig, idx) => {
                                  const staff = staffList.find(s => String(s.id) === String(sig.person));
                                  const name = sig.person_name
                                    ? sig.person_name
                                    : staff
                                      ? (staff.first_name && staff.last_name
                                        ? `${staff.first_name} ${staff.last_name}`
                                        : staff.username || staff.id)
                                      : sig.person;
                                  // Prefer custom_role text; otherwise map known ids to readable labels
                                  const roleText = sig.custom_role && sig.custom_role.trim() !== ""
                                    ? sig.custom_role
                                    : (sig.role === 'hod' ? 'Head of Department' : sig.role);
                                  return (
                                    <div key={idx} className="text-center">
                                      <p className="font-semibold text-gray-800">{name}</p>
                                      <p className="text-gray-600 text-sm">{roleText}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}




                        </>
                      )}

                      {/* Show signatures with names */}
                </div>
              </div>

              {/* Preview Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Important Note</h4>
                    <p className="text-blue-700 text-sm">
                      Please review all the information carefully. Once confirmed, a PDF document will be generated
                      and opened in a new tab for download.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Option Display for Guest Lecture Notice (at end, only for guest_lecture) */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  // Navigate back to the notice creation page with the current notice type and data pre-filled
                  navigate('/notices/create', { state: { selectedType: noticeType, data: noticeData } });
                }}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isGenerating}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Edit
              </button>
              
              <button 
                onClick={handleConfirmAndDownload} 
                disabled={isGenerating}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Confirm & Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticePreviewPage;