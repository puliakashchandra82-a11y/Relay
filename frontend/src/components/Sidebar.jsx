import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  Heart,
  MapPin,
  UserCircle,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { APP_VERSION } from "../version";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/browse", label: "Browse", icon: Search },
  { to: "/bookings", label: "My Bookings", icon: CalendarCheck },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/locations", label: "Locations", icon: MapPin },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [logoError, setLogoError] = useState(false);

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-navy-900 border-r border-white/5 h-screen sticky top-0 py-6 px-4">
      <div className="flex items-center gap-2 px-2 mb-1">
        {!logoError ? (
          <img
            src="/logo.png"
            onError={() => setLogoError(true)}
            alt="Relay"
            className="w-9 h-9 rounded-xl object-cover shadow-glow"
          />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-glow">
            <Zap size={18} className="text-white" fill="white" />
          </div>
        )}
        <div>
          <p className="text-white font-bold text-lg leading-none">Relay</p>
          <p className="text-[10px] text-white/40 tracking-wide">BOOK ANYTHING, ANYWHERE</p>
        </div>
      </div>
      <p className="text-white/20 text-[10px] font-mono px-2 mb-7">{APP_VERSION}</p>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-accent-600/30 to-accent-500/10 text-white border border-accent-500/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mt-2 ${
                isActive
                  ? "bg-gradient-to-r from-orange-500/30 to-orange-400/10 text-white border border-orange-400/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <ShieldCheck size={18} />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="rounded-2xl bg-gradient-to-br from-navy-700 to-navy-800 border border-white/5 p-4 mt-4">
        <p className="text-white text-xs font-semibold mb-1">Relay Pro</p>
        <p className="text-white/40 text-[11px] leading-snug mb-3">
          Priority booking & no service fees on every reservation.
        </p>
        <button className="w-full text-xs font-semibold bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg py-2 hover:opacity-90">
          Upgrade
        </button>
      </div>
    </aside>
  );
}
