import { Link } from "react-router-dom";
import { Zap, Mail } from "lucide-react";
import { useState } from "react";
import { APP_VERSION } from "../version";

export default function Footer() {
  const [logoError, setLogoError] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/5 pt-8 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            {!logoError ? (
              <img src="/logo.png" onError={() => setLogoError(true)} alt="Relay" className="w-7 h-7 rounded-lg object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                <Zap size={14} className="text-white" fill="white" />
              </div>
            )}
            <span className="text-white font-bold text-sm">Relay</span>
          </div>
          <p className="text-white/40 text-xs leading-relaxed max-w-xs">
            Book anything, anywhere. Gyms, spas, salons, clinics and more — real-time availability on one platform.
          </p>
        </div>

        <div>
          <p className="text-white/60 text-xs font-semibold mb-3">Product</p>
          <ul className="flex flex-col gap-2">
            <li><Link to="/browse" className="text-white/40 hover:text-white text-xs">Browse services</Link></li>
            <li><Link to="/locations" className="text-white/40 hover:text-white text-xs">Locations</Link></li>
            <li><Link to="/favorites" className="text-white/40 hover:text-white text-xs">Favorites</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-white/60 text-xs font-semibold mb-3">Support</p>
          <ul className="flex flex-col gap-2">
            <li><Link to="/help" className="text-white/40 hover:text-white text-xs">Help Center</Link></li>
            <li><Link to="/help" className="text-white/40 hover:text-white text-xs">Contact us</Link></li>
            <li>
              <a href="mailto:support@relay.app" className="text-white/40 hover:text-white text-xs flex items-center gap-1">
                <Mail size={11} /> support@relay.app
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 pt-5">
        <p className="text-white/25 text-[11px]">© {year} Relay. All rights reserved.</p>
        <p className="text-white/20 text-[11px] font-mono">{APP_VERSION}</p>
      </div>
    </footer>
  );
}
