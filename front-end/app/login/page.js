"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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
        setShowWelcomeModal(true);
        setTimeout(() => {
          router.push("/home");
        }, 1500);
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan Password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transform transition active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? "Memproses..." : "Masuk ke Dashboard"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-600 mb-1.5">Default Login:</p>
            <p className="flex items-center justify-center gap-1.5 flex-wrap">
              <span>Username:</span>
              <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 text-[11px] font-semibold">admin</code>
              <span className="text-slate-300 mx-0.5">|</span>
              <span>Password:</span>
              <code className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 text-[11px] font-semibold">admin123</code>
            </p>
          </div>
        </div>
      </div>

      {/* MODAL WELCOME */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl transform transition-all text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Login Berhasil!</h3>
            <p className="text-slate-500 mb-6">Selamat datang, Anda akan dialihkan ke dashboard...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}