import { FaChalkboardTeacher, FaRegStickyNote, FaUsers, FaUniversity, FaSignOutAlt, FaCog, FaFileAlt } from 'react-icons/fa';

const navItems = [
  { label: 'Dashboard', icon: <FaChalkboardTeacher />, path: '/dashboard' },
  { label: 'Notices', icon: <FaRegStickyNote />, path: '/notices/history' },
  { label: 'Letterhead Management', icon: <FaFileAlt />, path: '/letterhead-management' },
  { label: 'Staff', icon: <FaUsers />, path: '/manage-staff' },
  { label: 'College Info', icon: <FaUniversity />, path: '/college-info' },
  { label: 'Logout', icon: <FaSignOutAlt />, path: '/logout' },
];

export default function Sidebar({ activePath = '/dashboard' }) {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-blue-900 flex flex-col shadow-lg z-30">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-blue-800">
        <span className="text-2xl font-bold text-white">CampusNotify</span>
      </div>
      <nav className="flex-1 mt-6">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.label}>
              <a
                href={item.path}
                className={`flex items-center gap-3 px-6 py-3 rounded-l-full text-white text-lg font-medium transition-all duration-200 hover:bg-blue-800 ${activePath === item.path ? 'bg-blue-800 shadow-md' : ''}`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 