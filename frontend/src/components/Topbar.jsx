import { FaBars, FaUserCircle } from 'react-icons/fa';

export default function Topbar() {
  return (
    <header className="w-full bg-white shadow flex items-center justify-between px-6 py-3 h-16">
      <div className="flex items-center gap-3">
        <FaBars className="text-2xl text-blue-900 md:hidden" />
        <span className="text-xl font-bold text-blue-900">CampusNotify</span>
      </div>
      <FaUserCircle className="text-3xl text-blue-900" />
    </header>
  );
} 