export default function QuickAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="group w-full bg-gradient-to-r from-blue-50 to-yellow-50 hover:from-blue-100 hover:to-yellow-100 text-blue-900 px-6 py-5 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-3 border border-blue-100 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-lg font-semibold">{label}</span>
    </button>
  );
} 