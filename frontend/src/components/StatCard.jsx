export default function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <span className="text-3xl mb-2">{icon}</span>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
} 