import Layout from "../components/Layout";
import TopBar from "../components/TopBar";
import { useAuth } from "../AuthContext";
import { ShieldCheck, Mail, User } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const initials = user.full_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Layout>
      <TopBar title="Profile" subtitle="Your account details." />
      <div className="bg-navy-800 border border-white/5 rounded-2xl p-6 max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
          <div>
            <p className="text-white font-bold">{user.full_name}</p>
            <span className="text-[10px] font-bold uppercase tracking-wide text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <User size={15} /> {user.full_name}
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Mail size={15} /> {user.email || "—"}
          </div>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <ShieldCheck size={15} /> {user.role === "admin" ? "Administrator" : "Member"}
          </div>
        </div>
      </div>
    </Layout>
  );
}
