import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Dumbbell, Sparkles, Scissors, Stethoscope, Briefcase, Wrench, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import TopBar from "../components/TopBar";
import ProviderCard from "../components/ProviderCard";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { HERO_IMAGE } from "../lib/images";

const ICONS = {
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  scissors: Scissors,
  stethoscope: Stethoscope,
  briefcase: Briefcase,
  wrench: Wrench,
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.types().then(setTypes);
    api.providers().then(setProviders);
    if (user) api.myBookings().then((b) => setBookings(b.filter((x) => x.status === "confirmed").slice(0, 3)));
  }, [user]);

  return (
    <Layout>
      <TopBar title={`Welcome back${user ? `, ${user.full_name.split(" ")[0]}` : ""}`} subtitle="Find and book your next appointment in seconds." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* Hero */}
          <div className="relative rounded-3xl overflow-hidden h-56 md:h-64">
            <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/60 to-transparent" />
            <div className="relative h-full flex flex-col justify-center px-8 max-w-md">
              <span className="text-accent-400 text-xs font-bold tracking-widest mb-2">RELAY</span>
              <h2 className="text-white text-2xl md:text-3xl font-extrabold leading-tight mb-3">
                Book anything,
                <br /> anywhere.
              </h2>
              <p className="text-white/60 text-sm mb-4">
                Gyms, spas, salons, clinics & more — one platform, real-time availability.
              </p>
              <button
                onClick={() => navigate("/browse")}
                className="w-fit flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 shadow-glow"
              >
                Explore services <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Browse by category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {types.map((t) => {
                const Icon = ICONS[t.icon] || Sparkles;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/browse?type=${t.id}`)}
                    className="flex flex-col items-center gap-2 bg-navy-800 border border-white/5 hover:border-accent-500/40 rounded-2xl py-4 px-2 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${t.color}22`, color: t.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-white/70 text-[11px] font-medium text-center leading-tight">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular services */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Popular services</h3>
              <button onClick={() => navigate("/browse")} className="text-accent-400 text-xs font-semibold">
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.slice(0, 6).map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar panel */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-navy-800 border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock size={16} className="text-accent-400" />
              <h3 className="text-white font-semibold text-sm">Upcoming appointments</h3>
            </div>
            {!user && <p className="text-white/40 text-xs">Log in to see your bookings.</p>}
            {user && bookings.length === 0 && <p className="text-white/40 text-xs">No upcoming appointments yet.</p>}
            <div className="flex flex-col gap-3">
              {bookings.map((b) => (
                <div key={b.booking_id} className="bg-navy-700/50 rounded-xl p-3">
                  <p className="text-white text-xs font-semibold">{b.class_name}</p>
                  <p className="text-white/40 text-[11px] mt-0.5">{b.provider_name}</p>
                  <p className="text-accent-400 text-[11px] mt-1">
                    {b.date} · {b.time}
                  </p>
                </div>
              ))}
            </div>
            {user && (
              <button
                onClick={() => navigate("/bookings")}
                className="w-full mt-4 text-xs font-semibold text-white/70 hover:text-white border border-white/10 rounded-lg py-2"
              >
                View all bookings
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-accent-600/20 to-navy-800 border border-accent-500/20 p-5">
            <p className="text-white font-semibold text-sm mb-1">Top rated this week</p>
            <p className="text-white/40 text-xs mb-4">Highest reviewed providers on Relay.</p>
            <div className="flex flex-col gap-2">
              {[...providers]
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 3)
                .map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/providers/${p.id}`)}
                    className="flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-lg px-2 py-1.5"
                  >
                    <span className="text-white/80 text-xs">{p.name}</span>
                    <span className="text-amber-400 text-xs font-semibold">★ {p.rating}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
