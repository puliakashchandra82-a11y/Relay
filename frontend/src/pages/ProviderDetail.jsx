import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Star, Calendar, Clock, ArrowLeft } from "lucide-react";
import Layout from "../components/Layout";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { imageFor } from "../lib/images";

export default function ProviderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.provider(id).then(setProvider);
  }, [id]);

  async function handleBook(classId) {
    if (!user) return navigate("/login");
    setBooking(classId);
    setMessage("");
    try {
      await api.book(classId);
      setMessage("Booked! Check My Bookings.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBooking(null);
    }
  }

  if (!provider) return null;

  return (
    <Layout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-white/40 hover:text-white text-xs mb-4"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="relative h-56 rounded-3xl overflow-hidden mb-6">
        <img src={imageFor(provider.type_name)} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/30 to-transparent" />
        <div className="absolute bottom-5 left-6">
          <span className="text-accent-400 text-xs font-bold">{provider.type_name}</span>
          <h1 className="text-white text-2xl font-extrabold">{provider.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-white/60 text-xs">
            <span className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" /> {provider.rating} ({provider.review_count})
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {provider.location_name}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-2">About</h3>
          <p className="text-white/50 text-sm mb-6">{provider.description}</p>
          <p className="text-white/40 text-xs">{provider.location_address}</p>
        </div>

        <div className="bg-navy-800 border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Available slots</h3>
          {message && <p className="text-accent-400 text-xs mb-3">{message}</p>}
          <div className="flex flex-col gap-2">
            {provider.classes.map((c) => (
              <div key={c.id} className="bg-navy-700/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-semibold">{c.name}</p>
                  <p className="text-white/40 text-[11px] flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {c.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {c.time}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-accent-400 text-xs font-bold mb-1">${c.price}</p>
                  <button
                    onClick={() => handleBook(c.id)}
                    disabled={booking === c.id}
                    className="text-[11px] font-semibold bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
                  >
                    {booking === c.id ? "..." : "Book"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
