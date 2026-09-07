import { useState } from "react";
import { Mail, Phone, MapPin, ChevronDown, CheckCircle2 } from "lucide-react";
import Layout from "../components/Layout";
import TopBar from "../components/TopBar";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const FAQS = [
  {
    q: "How do I book an appointment?",
    a: "Browse or search for a provider, open their page, pick an available slot and hit Book. You'll need to be logged in.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes — go to My Bookings and cancel any upcoming, confirmed appointment. Cancellation is instant.",
  },
  {
    q: "How do I become a provider on Relay?",
    a: "Reach out through the contact form below with your business details and our team will get you set up.",
  },
  {
    q: "Is there a fee to use Relay?",
    a: "Booking is free for members. Providers are charged a small commission per completed booking.",
  },
  {
    q: "I forgot my password, what do I do?",
    a: "Password reset isn't available in this demo build yet — contact support below and we'll sort it out manually.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-navy-800 border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-white text-sm font-medium">{q}</span>
        <ChevronDown size={16} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-4 pb-4 text-white/50 text-sm leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Help() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.full_name || "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.submitContact(form);
      setSent(true);
      setForm({ name: user?.full_name || "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <TopBar title="Help & Contact" subtitle="Answers to common questions, or reach our team directly." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-white font-semibold mb-1">Frequently asked questions</h3>
          {FAQS.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>

        <div>
          <div className="bg-navy-800 border border-white/5 rounded-2xl p-5 mb-6">
            <h3 className="text-white font-semibold text-sm mb-4">Contact support</h3>

            {sent ? (
              <div className="flex flex-col items-center text-center py-6">
                <CheckCircle2 size={28} className="text-emerald-400 mb-2" />
                <p className="text-white text-sm font-medium">Message sent</p>
                <p className="text-white/40 text-xs mt-1">We'll get back to you shortly.</p>
                <button onClick={() => setSent(false)} className="text-accent-400 text-xs font-semibold mt-4">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-navy-700/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent-500"
                />
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-navy-700/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent-500"
                />
                <input
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="bg-navy-700/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent-500"
                />
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="bg-navy-700/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent-500 resize-none"
                />
                {error && <p className="text-rose-400 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>

          <div className="bg-navy-800 border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-white font-semibold text-sm mb-1">Other ways to reach us</p>
            <div className="flex items-center gap-3 text-white/50 text-xs">
              <Mail size={14} /> support@relay.app
            </div>
            <div className="flex items-center gap-3 text-white/50 text-xs">
              <Phone size={14} /> +1 (555) 010-2024
            </div>
            <div className="flex items-center gap-3 text-white/50 text-xs">
              <MapPin size={14} /> 123 Main St, City Center
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
