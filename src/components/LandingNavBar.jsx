import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LandingNavBar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  return (
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
          <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
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
  );
};

export default LandingNavBar;
