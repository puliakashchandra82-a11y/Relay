import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import TopBar from "../components/TopBar";
import ProviderCard from "../components/ProviderCard";
import { api } from "../api";

export default function Favorites() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    api.myFavorites().then(setProviders);
  }, []);

  return (
    <Layout>
      <TopBar title="Favorites" subtitle="Providers you've saved for later." />
      {providers.length === 0 ? (
        <p className="text-white/40 text-sm">No favorites yet — tap the heart on any provider card.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} favorited />
          ))}
        </div>
      )}
    </Layout>
  );
}
