import { Heart, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { imageFor, gradientFor } from "../lib/images";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function ProviderCard({ provider, favorited = false, onToggleFavorite }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fav, setFav] = useState(favorited);
  const [imgError, setImgError] = useState(false);

  async function handleFav(e) {
    e.stopPropagation();
    if (!user) return navigate("/login");
    const res = await api.toggleFavorite(provider.id);
    setFav(res.favorited);
    onToggleFavorite?.(provider.id, res.favorited);
  }

  return (
    <div
      onClick={() => navigate(`/providers/${provider.id}`)}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-navy-800 border border-white/5 hover:border-accent-500/40 transition-all hover:-translate-y-1 hover:shadow-glow"
    >
      <div className="relative h-36 overflow-hidden">
        {!imgError ? (
          <img
            src={imageFor(provider.type_name)}
            onError={() => setImgError(true)}
            alt={provider.type_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientFor(provider.type_name)}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-transparent to-transparent" />
        <button
          onClick={handleFav}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center"
        >
          <Heart size={15} className={fav ? "fill-rose-500 text-rose-500" : "text-white"} />
        </button>
        <span className="absolute bottom-3 left-3 text-[11px] font-semibold px-2 py-1 rounded-full bg-black/40 backdrop-blur text-white">
          {provider.type_name}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-semibold text-sm truncate">{provider.name}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="text-white/80 text-xs font-medium">{provider.rating}</span>
          </div>
        </div>
        <p className="text-white/40 text-xs mb-3 flex items-center gap-1">
          <MapPin size={11} /> {provider.location_name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-[11px]">{provider.review_count} reviews</span>
          <span className="text-accent-400 text-sm font-bold">from $25</span>
        </div>
      </div>
    </div>
  );
}
