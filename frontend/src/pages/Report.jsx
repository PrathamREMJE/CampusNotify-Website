import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import { staffAPI, noticeAPI } from '../services/api';

// Professional Stat Card with subtle accent
const StatCard = ({ title, value, subtitle, color = 'blue', icon = null }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-indigo-500',
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className={`absolute right-4 top-4 w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} text-white flex items-center justify-center shadow-md`}> 
        {icon}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-4xl font-extrabold tracking-tight text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

// Simple table component with header accent
const SimpleTable = ({ columns, rows, emptyText = 'No data' }) => (
  <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
    <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left font-semibold text-gray-700 px-4 py-2 border-b">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-3 text-gray-500" colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-2 border-b text-gray-800">{r[c.dataIndex]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Chart components (no external libs)
const DonutChart = ({ percentage = 0, size = 140, strokeWidth = 14, label, valueText, colors = { track: '#e5e7eb', progress: '#2563eb' } }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(percentage, 0), 100);
  const offset = circumference * (1 - progress / 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <svg width={size} height={size} className="mx-auto block">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={colors.track}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={colors.progress}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </g>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-gray-900 font-bold" fontSize="18">
          {Math.round(progress)}%
        </text>
      </svg>
      <div className="text-center mt-2">
        <p className="text-sm text-gray-500">{label}</p>
        {valueText && <p className="text-xs text-gray-400">{valueText}</p>}
      </div>
    </div>
  );
};

const BarChart = ({ data = [], color = 'bg-blue-600' }) => {
  const max = Math.max(...data.map(d => d.value || 0), 1);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="space-y-3">
        {data.length === 0 && (
          <p className="text-sm text-gray-500">No data</p>
        )}
        {data.map((d, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700 font-medium">{d.label}</span>
              <span className="text-xs text-gray-500">{d.value}</span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${color}`} style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function Report() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staff, setStaff] = useState([]);
  const [notices, setNotices] = useState([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [staffResp, noticesResp, activeResp] = await Promise.all([
          staffAPI.getStaffList(),
          // Prefer list endpoint if available for future filters
          noticeAPI.getNotices(),
          staffAPI.getActiveUsers(),
        ]);

        const staffArray = Array.isArray(staffResp) ? staffResp : (staffResp?.results || staffResp || []);
        const noticesArray = Array.isArray(noticesResp) ? noticesResp : (noticesResp?.results || noticesResp || []);

        setStaff(staffArray);
        setNotices(noticesArray);
        setActiveCount(activeResp?.total_count || 0);
      } catch (e) {
        console.error('Report fetch error:', e);
        setError('Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const stats = useMemo(() => ({
    totalStaff: staff.length,
    totalNotices: notices.length,
    activeUsers: activeCount,
  }), [staff.length, notices.length, activeCount]);

  // Breakdown helpers
  const byType = useMemo(() => {
    const map = {};
    for (const n of notices) {
      const t = n.notice_type || 'custom';
      map[t] = (map[t] || 0) + 1;
    }
    return Object.entries(map).map(([type, count]) => ({ type, count }));
  }, [notices]);

  const byStatus = useMemo(() => {
    const map = {};
    for (const n of notices) {
      const s = n.status || 'unknown';
      map[s] = (map[s] || 0) + 1;
    }
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [notices]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading Report...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-800 rounded-2xl shadow-xl mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <span className="text-xl sm:text-2xl font-bold">R</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports</h1>
                <p className="text-sm text-blue-100">Overview of staff and notice activity</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full" />
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard title="Total Staff" value={stats.totalStaff} color="emerald" />
          <StatCard title="Total Notices" value={stats.totalNotices} color="blue" />
          <StatCard title="Active Users" value={stats.activeUsers} color="amber" />
        </div>

        {/* Charts + Breakdowns */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Donut charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 xl:col-span-1">
            <DonutChart
              percentage={stats.totalStaff ? (stats.activeUsers / stats.totalStaff) * 100 : 0}
              label="Active Staff Ratio"
              valueText={`${stats.activeUsers}/${stats.totalStaff}`}
              colors={{ track: '#e5e7eb', progress: '#059669' }}
            />
            <DonutChart
              percentage={stats.totalNotices ? (byStatus.find(s => s.status === 'published')?.count || 0) / stats.totalNotices * 100 : 0}
              label="Published Notices"
              valueText={`${byStatus.find(s => s.status === 'published')?.count || 0}/${stats.totalNotices}`}
              colors={{ track: '#e5e7eb', progress: '#2563eb' }}
            />
          </div>

          {/* Bar charts */}
          <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Notices by Type</h2>
              <BarChart
                data={byType.map(i => ({ label: i.type, value: i.count }))}
                color="bg-indigo-600"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Notices by Status</h2>
              <BarChart
                data={byStatus.map(i => ({ label: i.status, value: i.count }))}
                color="bg-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Raw tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Notices by Type (Table)</h2>
            <SimpleTable
              columns={[
                { key: 'typeCol', title: 'Type', dataIndex: 'type' },
                { key: 'countCol', title: 'Count', dataIndex: 'count' },
              ]}
              rows={byType}
              emptyText="No notices found"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Notices by Status (Table)</h2>
            <SimpleTable
              columns={[
                { key: 'statusCol', title: 'Status', dataIndex: 'status' },
                { key: 'countCol', title: 'Count', dataIndex: 'count' },
              ]}
              rows={byStatus}
              emptyText="No notices found"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Report;