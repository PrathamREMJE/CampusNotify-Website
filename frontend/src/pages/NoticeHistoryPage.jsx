import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { noticeAPI, departmentAPI, authAPI } from '../services/api';
import DashboardLayout from '../components/Layouts/DashboardLayout';

// Simple shadcn-like UI using tailwind
// Collapsible, Modal, Button, Input, Badge, Toast helpers
const Toast = ({ type = 'success', message, onClose }) => {
  if (!message) return null;
  const base = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2';
  const styles = type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white';
  return (
    <div className={`${base} ${styles}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/90 hover:text-white">✕</button>
    </div>
  );
};

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-gray-800">{title}</span>
        <span className="text-gray-500">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t px-4 py-2">{children}</div>}
    </div>
  );
};

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-auto bg-white rounded-2xl shadow-lg p-6">
        {children}
      </div>
    </div>
  );
};

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all ${props.className || ''}`}
  />
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

const MultiSelect = ({ options, selected, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-left flex justify-between items-center"
      >
        <span className={selected.length ? 'text-gray-900' : 'text-gray-500'}>
          {selected.length ? `${selected.length} selected` : placeholder}
        </span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-900">
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => handleToggle(opt.id)}
                className="mr-2"
              />
              {opt.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Map types to display names - keys must match exact backend notice_type values
const TYPE_LABELS = {
  holiday: 'Holiday',
  guest_lecture: 'Guest Lecture',
  exam: 'Exam',
  assignment: 'Assignment',
  class_timetable: 'Class Timetable',
  lecture_cancellation: 'Lecture Cancellation',
  sports_events: 'Sports Events',
  result_marksheet_distribution: 'Result/Marksheet Distribution',
  revaluation: 'Revaluation',
  photocopy: 'Photocopy Application',
  industrial_visit: 'Industrial Visit',
  seminar_workshop_webinar: 'Seminar/Workshop/Webinar',
  internship: 'Internship',
  library: 'Library',
  custom: 'Custom',
};

const groupByType = (items) => {
  const map = {};
  for (const n of items) {
    const t = n.notice_type || 'custom';
    if (!map[t]) map[t] = [];
    map[t].push(n);
  }
  return map;
};

// Render dynamic content_data structures
function ContentRenderer({ content }) {
  if (!content || typeof content !== 'object') return null;

  const sections = [];
  const handledKeys = new Set();

  // Helper: render list
  const renderList = (items, ordered = false) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    const Tag = ordered ? 'ol' : 'ul';
    return (
      <Tag className="list-disc list-inside space-y-1">
        {items.map((it, idx) => (
          <li key={idx} className="text-gray-800">{String(it)}</li>
        ))}
      </Tag>
    );
  };

  // Helper: render table [{ headers:[], rows:[[]] } or rows only]
  const renderTable = (table) => {
    if (!table) return null;

    let headers = table.headers || null;
    let rows = table.rows || null;

    // If table is array of objects, derive headers and rows
    if (!headers && !rows && Array.isArray(table) && table.length > 0 && typeof table[0] === 'object' && !Array.isArray(table[0])) {
      headers = Object.keys(table[0]);
      rows = table.map(row => headers.map(h => row[h]));
    }

    // If table is array of arrays and no headers, treat as rows only
    if (!headers && !rows && Array.isArray(table) && Array.isArray(table[0])) {
      rows = table;
    }

    if (!rows) return null;

    return (
      <div className="overflow-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          {headers && (
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 border-b text-left font-semibold text-gray-700">{String(h)}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                {r.map((c, j) => (
                  <td key={j} className="px-3 py-2 border-b text-gray-800">{String(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper: render images
  const renderImages = (images) => {
    if (!Array.isArray(images) || images.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((img, idx) => {
          const url = img?.url || img;
          const caption = img?.caption;
          if (!url) return null;
          return (
            <figure key={idx} className="space-y-2">
              <img src={url} alt={caption || `image-${idx}`} className="w-full rounded-lg border" />
              {caption && <figcaption className="text-xs text-gray-600">{caption}</figcaption>}
            </figure>
          );
        })}
      </div>
    );
  };

  // Helper: render signatures
  const renderSignatures = (signatures) => {
    if (!Array.isArray(signatures) || signatures.length === 0) return null;

    // Flatten nested signature objects if any
    const flattenSignature = (sig) => {
      if (typeof sig !== 'object' || sig === null) return sig;
      if (sig.signature) return flattenSignature(sig.signature);
      if (sig.person) return flattenSignature(sig.person);
      return sig;
    };

    return (
      <ul className="list-disc list-inside space-y-1">
        {signatures.map((s, i) => {
          const sig = flattenSignature(s);
          return (
            <li key={i} className="text-gray-800">
              {(sig.role || sig.title) && <span className="font-medium">{sig.role || sig.title}:</span>} {sig.person || sig.name || sig.signature_name || sig.signature || ''}
            </li>
          );
        })}
      </ul>
    );
  };

  // Helper: render generic key-value
  const renderKeyValue = (key, value) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div key={key} className="text-gray-700">
        <span className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</span> {String(value)}
      </div>
    );
  };

  // Common possible keys from your form pages
  const possible = {
    title: content.title || content.lecture_title || content.notice_title,
    introduction: content.introduction,
    ending_message: content.ending_message,
    date: content.date || content.guest_lecture_date,
    time: content.time,
    venue: content.venue,
    language: content.language,
    departments: content.departments || content.targetDepartments || content.target_departments,
    years: content.years || content.target_groups,
    learning_points: content.learning_points,
    learning_outcomes: content.learning_outcomes,
    instructions: content.instructions,
    tables: content.tables, // array of table structures
    images: content.images, // [{url, caption}] or array of urls
    signatures: content.signatures, // [{role, person, ...}]
    custom_content: content.custom_content,
    speaker_name: content.speaker_name || content.speaker,
    speaker_designation: content.speaker_designation || content.designation,
  };

  // Mark handled keys
  Object.keys(possible).forEach(key => {
    if (possible[key] !== undefined && possible[key] !== null && possible[key] !== '') {
      handledKeys.add(key);
    }
  });

  // Title / heading
  if (possible.title) {
    sections.push(
      <h3 key="t" className="text-lg font-semibold text-gray-900">{possible.title}</h3>
    );
  }

  if (possible.introduction) {
    sections.push(
      <p key="intro" className="text-gray-800 whitespace-pre-line">{possible.introduction}</p>
    );
  }

  // Key meta grid
  const meta = [
    ['Date', possible.date],
    ['Time', possible.time],
    ['Venue', possible.venue],
    ['Language', possible.language],
    ['Departments', Array.isArray(possible.departments) ? possible.departments.join(', ') : possible.departments],
    ['Year Groups', Array.isArray(possible.years) ? possible.years.join(', ') : possible.years],
    ['Speaker', possible.speaker_name],
    ['Designation', possible.speaker_designation],
  ].filter(([, v]) => v);

  if (meta.length) {
    sections.push(
      <div key="meta" className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {meta.map(([k, v]) => (
          <div key={k} className="text-gray-700"><span className="font-medium">{k}:</span> {String(v)}</div>
        ))}
      </div>
    );
  }

  if (possible.learning_points && possible.learning_points.length) {
    sections.push(
      <div key="lp" className="space-y-1">
        <h4 className="font-semibold text-gray-900">Learning Points</h4>
        {renderList(possible.learning_points)}
      </div>
    );
  }

  if (possible.learning_outcomes && possible.learning_outcomes.length) {
    sections.push(
      <div key="lo" className="space-y-1">
        <h4 className="font-semibold text-gray-900">Learning Outcomes</h4>
        {renderList(possible.learning_outcomes)}
      </div>
    );
  }

  if (possible.instructions && possible.instructions.length) {
    sections.push(
      <div key="inst" className="space-y-1">
        <h4 className="font-semibold text-gray-900">Instructions</h4>
        {renderList(possible.instructions)}
      </div>
    );
  }

  if (Array.isArray(possible.tables)) {
    possible.tables.forEach((tbl, idx) => {
      sections.push(
        <div key={`tbl-${idx}`} className="space-y-2">
          <h4 className="font-semibold text-gray-900">Table {idx + 1}</h4>
          {renderTable(tbl)}
        </div>
      );
    });
  }

  if (possible.images && Array.isArray(possible.images)) {
    sections.push(
      <div key="imgs" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderImages(possible.images)}
      </div>
    );
  }

  if (possible.custom_content) {
    sections.push(<p key="custom" className="text-gray-800 whitespace-pre-line">{possible.custom_content}</p>);
  }

  if (possible.ending_message) {
    sections.push(
      <p key="end" className="text-gray-800 whitespace-pre-line">{possible.ending_message}</p>
    );
  }

  if (possible.signatures && Array.isArray(possible.signatures) && possible.signatures.length) {
    sections.push(
      <div key="sigs" className="space-y-1">
        <h4 className="font-semibold text-gray-900">Signatures</h4>
        {renderSignatures(possible.signatures)}
      </div>
    );
  }

  // Now handle any remaining keys dynamically

  // Helper: detect if array is table (array of arrays or array of objects with headers/rows)
  const isTableArray = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    if (Array.isArray(arr[0])) return true; // array of arrays
    if (typeof arr[0] === 'object' && (arr[0].headers || arr[0].rows)) return true;
    return false;
  };

  // Helper: detect if array is signatures array
  const isSignaturesArray = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    if (typeof arr[0] !== 'object') return false;
    const keys = Object.keys(arr[0]);
    return keys.includes('role') || keys.includes('title') || keys.includes('person') || keys.includes('name') || keys.includes('signature_name');
  };

  Object.keys(content).forEach(key => {
    if (handledKeys.has(key)) return; // Already handled

    const value = content[key];
    if (value === null || value === undefined || value === '') return;

    if (typeof value === 'string') {
      sections.push(
        <div key={key} className="space-y-1">
          <h4 className="font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
          <p className="text-gray-800 whitespace-pre-line">{value}</p>
        </div>
      );
    } else if (Array.isArray(value)) {
      if (isTableArray(value)) {
        // If array of arrays, wrap in table structure
        if (Array.isArray(value[0]) && !value[0].headers && !value[0].rows) {
          sections.push(
            <div key={key} className="space-y-2">
              <h4 className="font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
              {renderTable({ rows: value })}
            </div>
          );
        } else {
          sections.push(
            <div key={key} className="space-y-2">
              <h4 className="font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
              {value.map((tbl, idx) => renderTable(tbl))}
            </div>
          );
        }
      } else if (isSignaturesArray(value)) {
        sections.push(
          <div key={key} className="space-y-1">
            <h4 className="font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
            {renderSignatures(value)}
          </div>
        );
      } else if (value.length > 0 && typeof value[0] === 'object' && (value[0].url || value[0].caption)) {
        // Images array
        sections.push(
          <div key={key} className="space-y-2">
            <h4 className="font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
            {renderImages(value)}
          </div>
        );
      } else {
        // Regular array
        sections.push(
          <div key={key} className="space-y-1">
            <h4 className="font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
            {renderList(value)}
          </div>
        );
      }
    } else if (typeof value === 'object') {
      // Check if it's a table object
      if (value.headers || value.rows) {
        sections.push(
          <div key={key} className="space-y-2">
            <h4 className="font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
            {renderTable(value)}
          </div>
        );
      } else {
        // Render as key-value pairs
        const subItems = Object.keys(value).map(subKey => renderKeyValue(subKey, value[subKey])).filter(Boolean);
        if (subItems.length > 0) {
          sections.push(
            <div key={key} className="space-y-1">
              <h4 className="font-semibold text-gray-900">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {subItems}
              </div>
            </div>
          );
        }
      }
    } else {
      // Primitive values
      sections.push(renderKeyValue(key, value));
    }
  });

  return <div className="space-y-4">{sections}</div>;
}

export default function NoticeHistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal state
  const [active, setActive] = useState(null);

  // Current user for permission checks
  const [currentUser, setCurrentUser] = useState(null);

  // Toast and delete confirmation
  const [toast, setToast] = useState({ type: 'success', message: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reports data
  const [departmentReport, setDepartmentReport] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Build clean params and be explicit about visibility scope
      const params = {
        page,
        page_size: pageSize,
        scope: 'own_and_subordinates',
      };
      if (searchTerm && searchTerm.trim()) params.search = searchTerm.trim();
      if (filterType !== 'all') params.notice_type = filterType;

      const res = await noticeAPI.getNoticeList(params);

      // Support paginated responses and (as a fallback) direct arrays
      const results = Array.isArray(res) ? res : res?.results;
      const total = Array.isArray(res) ? results.length : res?.count;

      setData(Array.isArray(results) ? results : []);
      setCount(Number.isFinite(total) ? total : 0);
    } catch (e) {
      console.error('Failed to load notices:', e?.response?.data || e.message || e);
      const apiErr = e?.response?.data;
      const msg = (typeof apiErr === 'string' && apiErr) || apiErr?.error || apiErr?.detail || 'Failed to load notices';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    // Load current user (from localStorage first, then API)
    const initUser = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          try { setCurrentUser(JSON.parse(stored)); } catch {}
        }
        const u = await authAPI.getUserProfile();
        if (u) {
          setCurrentUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        }
      } catch (e) {
        // Fallback to stored user only
      }
    };
    initUser();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // Removed useEffect for filters to apply on button click

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const grouped = useMemo(() => {
    const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return groupByType(sorted);
  }, [data]);

  const canDelete = (n) => {
    if (!n || !currentUser) return false;
    const allowedRoles = ['principal', 'vice_principal', 'hod'];
    const isOwner = n?.created_by?.id && currentUser?.id && n.created_by.id === currentUser.id;
    const hasRole = allowedRoles.includes(currentUser?.role);
    return isOwner || hasRole;
  };

  const handleDelete = async () => {
    if (!active) return;
    setDeleting(true);
    try {
      await noticeAPI.deleteNotice(active.id);
      setToast({ type: 'success', message: 'Notice deleted successfully' });
      setConfirmOpen(false);
      // Refresh list
      await fetchData();
      // Clear active if it was deleted (ensure it's not present anymore)
      setActive(null);
    } catch (e) {
      const apiErr = e?.response?.data;
      const msg = (typeof apiErr === 'string' && apiErr) || apiErr?.error || apiErr?.detail || 'Failed to delete notice';
      setToast({ type: 'error', message: msg });
    } finally {
      setDeleting(false);
    }
  };

  const categories = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-green-50/50 via-white to-white p-4 md:p-8 space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-3">
        {/* Breadcrumbs + Back */}
        <div className="flex items-center justify-between">
          <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-1">
              <li><Link to="/dashboard" className="hover:text-emerald-700">Dashboard</Link></li>
              <li className="text-gray-400">/</li>
              <li><span className="hover:text-emerald-700">Notices</span></li>
              <li className="text-gray-400">/</li>
              <li className="font-medium text-gray-800">History</li>
            </ol>
          </nav>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Notice History</h1>
                <p className="text-blue-100 text-lg">Filter, paginate, and preview your notices.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Filters</h3>
          <div className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 rounded-full px-2 py-1 ring-1 ring-gray-200">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
            <span>{count} results</span>
          </div>
        </div>
        <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700">Search</label>
            <Input placeholder="Search notices (title/type/content)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900"
            >
              <option value="all">All Types</option>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-6 py-2 rounded-xl bg-green-600 text-white font-semibold shadow-sm hover:shadow-md hover:bg-green-700 transition-all">
            Apply Filters
          </button>
        </form>
      </div>

      {/* Pagination controls */}
      <div className="sticky top-2 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 border rounded-xl px-4 py-2 flex items-center justify-between gap-3 text-sm text-gray-700 shadow-sm">
        <div className="text-gray-700">Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> • Total: <span className="font-medium">{count}</span></div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1.5 border rounded-lg bg-white">
            {[10, 20, 50].map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : categories.length === 0 ? (
        <div className="text-gray-600">No notices found.</div>
      ) : (
        <div className="space-y-3">
          {categories.map((typeKey) => (
            <Section key={typeKey} title={TYPE_LABELS[typeKey] || typeKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}>
              {/* Grid of notice cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {grouped[typeKey].map((n) => (
                  <div
                    key={n.id}
                    className="group relative overflow-hidden bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer"
                    onClick={() => {
                      if (n.pdf_file) {
                        const pdfUrl = n.pdf_file.startsWith('http') ? n.pdf_file : `http://127.0.0.1:8000${n.pdf_file}`;
                        window.open(pdfUrl, '_blank');
                      }
                    }}
                  >
                    {/* Accent gradient hover */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-emerald-50/60 via-transparent to-transparent"></div>
                    <div className="relative space-y-2">
                      {/* Type badge */}
                      <div className="inline-flex items-center gap-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 rounded-full px-2 py-0.5 w-fit">
                        <span>{TYPE_LABELS[n.notice_type] || (n.notice_type || '').replace(/_/g, ' ')}</span>
                      </div>
                      {/* Title */}
                      <h4 className="text-gray-900 text-base font-semibold group-hover:text-emerald-700 transition-colors line-clamp-2">{n.title}</h4>
                      {/* Meta */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{new Date(n.created_at).toLocaleString()}</span>
                        {n.created_by && (
                          <span>• by {n.created_by.first_name || n.created_by.username}</span>
                        )}
                      </div>
                      {/* Status badges */}
                      <div className="flex gap-2 flex-wrap items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          {n.status && <Badge variant={n.status}>{n.status.charAt(0).toUpperCase() + n.status.slice(1)}</Badge>}
                          {n.language && <Badge>{n.language}</Badge>}
                          {n.pdf_file && (
                            <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">PDF</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/notices/view/${n.id}`);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            View
                          </button>
                          {canDelete(n) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActive(n);
                                setConfirmOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
          <p className="text-gray-700">Are you sure you want to delete this notice? This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-black"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <Toast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, message: '' })} />

      </div>
    </DashboardLayout>
  );
}