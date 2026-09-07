import { useEffect, useState } from "react";
import { Users, Building2, CalendarCheck, DollarSign, Mail, Check } from "lucide-react";
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
  const [messages, setMessages] = useState([]);

  function loadMessages() {
    api.adminMessages().then(setMessages);
  }

  useEffect(() => {
    api.adminStats().then(setStats);
    api.adminBookings().then(setBookings);
    loadMessages();
  }, []);

  async function handleResolve(id) {
    await api.adminResolveMessage(id);
    loadMessages();
  }

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

      <div className="bg-navy-800 border border-white/5 rounded-2xl p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={16} className="text-accent-400" />
          <h3 className="text-white font-semibold text-sm">Support inbox</h3>
          {messages.filter((m) => m.status === "open").length > 0 && (
            <span className="text-[10px] font-bold bg-accent-500/20 text-accent-400 px-2 py-0.5 rounded-full">
              {messages.filter((m) => m.status === "open").length} open
            </span>
          )}
        </div>
        {messages.length === 0 ? (
          <p className="text-white/40 text-xs">No messages yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div key={m.id} className="bg-navy-700/50 rounded-xl p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white text-xs font-semibold">{m.subject || "(no subject)"}</p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === "open" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p className="text-white/40 text-[11px] mb-1">
                    {m.name} · {m.email}
                  </p>
                  <p className="text-white/60 text-xs">{m.message}</p>
                </div>
                {m.status === "open" && (
                  <button
                    onClick={() => handleResolve(m.id)}
                    className="w-7 h-7 shrink-0 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20"
                  >
                    <Check size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
