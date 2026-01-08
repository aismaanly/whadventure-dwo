"use client";

import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  const isActive = (path) => pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-xl flex flex-col sticky top-0 h-screen z-20">
        
        {/* Header logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="mr-3 shadow-md rounded-xl overflow-hidden bg-white p-1 border border-slate-100">
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg leading-tight tracking-tight">DWO <span className="text-blue-600">2025</span></p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Adventureworks</p>
          </div>
        </div>

        {/* Menu title */}
        <div className="px-6 pt-6 pb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Main Analytics
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1 text-sm overflow-y-auto mt-2">
          
          {/* Menu Home */}
          <a 
            href="/home" 
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              isActive("/home") ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
              isActive("/home") ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="leading-none">Home</span>
              <span className="text-[10px] opacity-70 mt-1">Ringkasan Data</span>
            </div>
          </a>

          {/* Menu Fact Sales */}
          <a 
            href="/fact-sales" 
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              isActive("/fact-sales") ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
              isActive("/fact-sales") ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="leading-none text-[13px]">Fact Sales</span>
              <span className="text-[10px] opacity-70 mt-1">Analisis Penjualan</span>
            </div>
          </a>

          {/* Menu Fact Production */}
          <a 
            href="/fact-production" 
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              isActive("/fact-production") ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
              isActive("/fact-production") ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="leading-none text-[13px]">Fact Production</span>
              <span className="text-[10px] opacity-70 mt-1">Aktivitas Produksi</span>
            </div>
          </a>

          {/* Menu AI Report */}
          <a 
            href="/ai-report" 
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              isActive("/ai-report") ? "bg-amber-50 text-amber-600 shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
              isActive("/ai-report") ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="leading-none text-[13px]">AI Analytics</span>
              <span className="text-[10px] opacity-70 mt-1">Smart Reporting</span>
            </div>
          </a>

          {/* Menu External Page */}
          <a 
            href="/external" 
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
              isActive("/external") ? "bg-purple-50 text-purple-600 shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-colors ${
              isActive("/external") ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="leading-none text-[13px]">External Page</span>
              <span className="text-[10px] opacity-70 mt-1">Mondrian / OLAP</span>
            </div>
          </a>
        </nav>

        {/* TOMBOL LOGOUT */}
        <div className="px-3 py-4 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mr-3 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span>LOGOUT</span>
          </button>
        </div>

        <div className="px-6 py-4 border-t border-slate-50 text-[10px] text-slate-400 text-center font-medium">
          DWO Kelompok 4 &copy; {new Date().getFullYear()}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-4 bg-slate-100"></div>
        <div className="max-w-7xl mx-auto px-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}