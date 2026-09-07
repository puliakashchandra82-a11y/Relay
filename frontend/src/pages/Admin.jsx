import { useEffect, useState } from "react";
import { Users, Building2, CalendarCheck, DollarSign } from "lucide-react";
import Layout from "../components/Layout";
import TopBar from "../components/TopBar";
import { api } from "../api";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-navy-800 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}22`, color }}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-white text-xl font-bold leading-none">{value}</p>
        <p className="text-white/40 text-xs mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.adminStats().then(setStats);
    api.adminBookings().then(setBookings);
  }, []);

  return (
    <Layout>
      <TopBar title="Admin Dashboard" subtitle="Platform overview across all providers." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total users" value={stats?.users ?? "—"} color="#6366f1" />
        <StatCard icon={Building2} label="Providers" value={stats?.providers ?? "—"} color="#f97316" />
        <StatCard icon={CalendarCheck} label="Active bookings" value={stats?.bookings ?? "—"} color="#22c55e" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${stats?.revenue ?? 0}`} color="#eab308" />
      </div>

      <div className="bg-navy-800 border border-white/5 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">All bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/30 text-xs uppercase">
                <th className="pb-3">Customer</th>
                <th className="pb-3">Service</th>
                <th className="pb-3">Provider</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-white/5">
                  <td className="py-2.5 text-white/80">{b.full_name}</td>
                  <td className="py-2.5 text-white/60">{b.class_name}</td>
                  <td className="py-2.5 text-white/60">{b.provider_name}</td>
                  <td className="py-2.5 text-white/60">
                    {b.date} · {b.time}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
