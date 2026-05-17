import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import DashboardPage from "./pages/DashboardPage";

function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A]">
      {/* Logo / Icon */}
      <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-2xl shadow-cyan-500/30">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>

      {/* App Name */}
      <h1 className="text-4xl font-bold text-white tracking-tight">
        Smart{" "}
        <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
          Leads
        </span>
      </h1>
      <p className="mt-2 text-slate-400 text-sm tracking-widest uppercase">
        Your Sales Intelligence Platform
      </p>

      {/* Animated loader bar */}
      <div className="mt-10 w-48 h-1 rounded-full bg-slate-700 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full animate-[load_3s_ease-in-out_forwards]" />
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return token ? <DashboardPage /> : <Auth setToken={setToken} />;
}