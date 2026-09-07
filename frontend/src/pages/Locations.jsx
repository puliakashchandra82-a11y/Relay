import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import TopBar from "../components/TopBar";
import { api } from "../api";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.locations().then(setLocations);
  }, []);

  return (
    <Layout>
      <TopBar title="Locations" subtitle="Browse services near you." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((l) => (
          <div
            key={l.id}
            onClick={() => navigate(`/browse?location=${l.id}`)}
            className="cursor-pointer bg-navy-800 border border-white/5 hover:border-accent-500/40 rounded-2xl p-5 flex items-start gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400 flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{l.name}</p>
              <p className="text-white/40 text-xs mt-1">{l.address}</p>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
