"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        document.cookie = "isLoggedIn=true; path=/";
        router.push("/home");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Koneksi ke server gagal!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100 rounded-full blur-[120px] opacity-50 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-100 rounded-full blur-[120px] opacity-50 -z-10"></div>

      <div className="w-full max-w-md p-6">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10">
          <div className="text-center mb-10">
            <div className="inline-block p-1 rounded-2xl bg-white shadow-sm border border-slate-100 mb-4">
              <img 
                src="/favicon.ico" 
                alt="Logo" 
                className="w-16 h-16 object-contain p-2"
              />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              DWO<span className="text-blue-600"> 2025</span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">Silakan login terlebih dahulu!</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5 ml-1">Username</label>
              <input 
                type="text" 
                placeholder="Masukkan username"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transform transition active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">
              Final Project Kel 4 - C &copy; 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}