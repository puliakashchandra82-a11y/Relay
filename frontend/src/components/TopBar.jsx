import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function TopBar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.full_name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
      <div>
        <h1 className="text-white text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-navy-800 border border-white/5 rounded-xl px-3 py-2 w-64">
          <Search size={16} className="text-white/30" />
          <input
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(`/browse?q=${encodeURIComponent(e.target.value)}`);
            }}
            placeholder="Search services..."
            className="bg-transparent outline-none text-sm text-white placeholder:text-white/30 w-full"
          />
        </div>
        <button className="relative w-10 h-10 rounded-xl bg-navy-800 border border-white/5 flex items-center justify-center text-white/60 hover:text-white">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent-400" />
        </button>
        <button
          onClick={logout}
          title="Log out"
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xs font-bold"
        >
          {initials}
        </button>
      </div>
    </div>
  );
}
