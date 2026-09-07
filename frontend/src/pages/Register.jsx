import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { APP_VERSION } from "../version";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.register(form);
      login(res.token, res.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-1">
          {!logoError ? (
            <img
              src="/logo.png"
              onError={() => setLogoError(true)}
              alt="Relay"
              className="w-10 h-10 rounded-xl object-cover shadow-glow"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-glow">
              <Zap size={20} className="text-white" fill="white" />
            </div>
          )}
          <span className="text-white font-bold text-xl">Relay</span>
        </div>
        <p className="text-center text-white/20 text-[10px] font-mono mb-7">{APP_VERSION}</p>

        <div className="bg-navy-800 border border-white/5 rounded-2xl p-6">
          <h1 className="text-white text-lg font-bold mb-1">Create your account</h1>
          <p className="text-white/40 text-xs mb-6">Join Relay and start booking.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              required
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="bg-navy-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent-500"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-navy-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent-500"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-navy-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent-500"
            />
            {error && <p className="text-rose-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-semibold rounded-xl py-2.5 mt-2 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-accent-400 font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
