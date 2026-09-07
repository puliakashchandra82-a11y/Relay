import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import Layout from "../components/Layout";
import TopBar from "../components/TopBar";
import { api } from "../api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  function load() {
    api.myBookings().then(setBookings);
  }

  useEffect(load, []);

  async function handleCancel(id) {
    await api.cancelBooking(id);
    load();
  }

  return (
    <Layout>
      <TopBar title="My Bookings" subtitle="All your upcoming and past appointments." />

      {bookings.length === 0 ? (
        <p className="text-white/40 text-sm">No bookings yet — go browse some services.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div
              key={b.booking_id}
              className="bg-navy-800 border border-white/5 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold text-sm">{b.class_name}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-white/40 text-xs mb-1">{b.provider_name}</p>
                <div className="flex items-center gap-3 text-white/30 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {b.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {b.time}
                  </span>
                  {b.location_name && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {b.location_name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent-400 font-bold text-sm">${b.price}</span>
                {b.status === "confirmed" && (
                  <button
                    onClick={() => handleCancel(b.booking_id)}
                    className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500/20"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
