import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* --- CSS STYLES (Glassmorphism Only) --- */
const styleTag = `
  .glass-panel {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }
  .glass-button {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }
  .glass-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  }
`;

/* --- MAIN APP --- */
export default function LandingPage() {
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);

  return (
    <div className="min-h-screen font-sans text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 bg-slate-950">
      <style>{styleTag}</style>

      {/* --- NAVBAR --- */}
      <nav
        className={`fixed top-0 w-full z-40 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-slate-950/80 backdrop-blur-md border-white/5 py-4"
            : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30 group-hover:border-indigo-400 transition-all">
              <img src="/icons/logo.png" alt="logo" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              dev-event-hub
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/signin")}
              className="hidden md:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="glass-button px-5 py-2 rounded-full text-sm font-medium text-white flex items-center gap-2"
            >
              Sign Up <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col justify-center items-center text-center">
        {/* Subtle background glow for Hero only */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-4 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            The #1 Platform for Devs
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Connect. Code. <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
              Conquer the Future.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover the world's most innovative developer conferences,
            hackathons, and workshops. Your gateway to the global tech community
            starts here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/signin")}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Explore Events
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 mt-16">
            {[
              { label: "Active Users", value: "10k+" },
              { label: "Events Hosted", value: "500+" },
              { label: "Communities", value: "120" },
              { label: "Countries", value: "45" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
