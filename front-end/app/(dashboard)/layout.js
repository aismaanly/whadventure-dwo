"use client"; // Tambahkan ini di baris pertama

import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Hapus cookie login
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    // 2. Arahkan ke halaman login
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-xl flex flex-col sticky top-0 h-screen">
        {/* Header logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-200">
          <div className="w-10 h-10 rounded-2xl bg-yellow-400 mr-3 flex items-center justify-center text-lg font-bold text-slate-900">
            D
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg leading-tight">Dashboard</p>
            <p className="text-xs text-slate-500">whadventure</p>
          </div>
        </div>

        {/* Menu title */}
        <div className="px-6 pt-4 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Main Menu
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1 text-sm overflow-y-auto">
          {/* Menu Fact Sales */}
          <a href="/dashboard/fact-sales" className="flex items-center px-4 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition">
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs mr-3 font-bold">S</span>
            <div className="flex flex-col">
              <span>Fact Sales</span>
              <span className="text-[11px] text-slate-400 font-normal">Ringkasan penjualan</span>
            </div>
          </a>

          {/* Menu Fact Production */}
          <a href="/dashboard/fact-production" className="flex items-center px-4 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition">
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-3 font-bold">P</span>
            <div className="flex flex-col">
              <span>Fact Production</span>
              <span className="text-[11px] text-slate-400 font-normal">Aktivitas produksi</span>
            </div>
          </a>

          {/* Menu External Page */}
          <a href="/dashboard/external" className="flex items-center px-4 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition">
            <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs mr-3 font-bold">O</span>
            <div className="flex flex-col">
              <span>External Page</span>
              <span className="text-[11px] text-slate-400 font-normal">Mondrian / OLAP</span>
            </div>
          </a>
        </nav>

        {/* TOMBOL LOGOUT (Diletakkan di atas footer sidebar) */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all group"
          >
            <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 group-hover:bg-red-600 group-hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span>Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 text-[11px] text-slate-400">
          © {new Date().getFullYear()} WHAdventure Dashboard
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}