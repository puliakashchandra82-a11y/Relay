import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Layout from "../components/Layout";
import TopBar from "../components/TopBar";
import ProviderCard from "../components/ProviderCard";
import { api } from "../api";

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [types, setTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [providers, setProviders] = useState([]);
  const [q, setQ] = useState(params.get("q") || "");

  const typeId = params.get("type") || "";
  const locationId = params.get("location") || "";

  useEffect(() => {
    api.types().then(setTypes);
    api.locations().then(setLocations);
  }, []);

  useEffect(() => {
    api
      .providers({
        ...(typeId ? { type_id: typeId } : {}),
        ...(locationId ? { location_id: locationId } : {}),
        ...(params.get("q") ? { q: params.get("q") } : {}),
      })
      .then(setProviders);
  }, [typeId, locationId, params]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <Layout>
      <TopBar title="Browse services" subtitle="Find the right provider for you." />

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 bg-navy-800 border border-white/5 rounded-xl px-3 py-2.5 flex-1">
          <Search size={16} className="text-white/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateParam("q", q)}
            placeholder="Search by name..."
            className="bg-transparent outline-none text-sm text-white placeholder:text-white/30 w-full"
          />
        </div>
        <select
          value={typeId}
          onChange={(e) => updateParam("type", e.target.value)}
          className="bg-navy-800 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white/80 outline-none"
        >
          <option value="">All categories</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={locationId}
          onChange={(e) => updateParam("location", e.target.value)}
          className="bg-navy-800 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-white/80 outline-none"
        >
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {providers.length === 0 ? (
        <p className="text-white/40 text-sm">No providers match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}
    </Layout>
  );
}
