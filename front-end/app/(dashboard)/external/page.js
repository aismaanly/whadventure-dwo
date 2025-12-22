"use client";
import { useState } from "react";

export default function ExternalPage() {
  const [openTab, setOpenTab] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">External Analytics</h1>
        <p className="text-sm text-slate-500">
          Eksplorasi data multidimensi menggunakan Mondrian OLAP Server.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* SECTION SALES */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <button
            onClick={() => setOpenTab(openTab === "sales" ? "" : "sales")}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm font-bold">S</div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Mondrian OLAP - Fact Sales</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Multidimensional Sales Analysis</p>
              </div>
            </div>
            <span className={`transform transition-transform duration-300 ${openTab === "sales" ? "rotate-180" : ""}`}>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </button>

          {openTab === "sales" && (
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="bg-white rounded-xl shadow-inner overflow-hidden border border-slate-200">
                <iframe
                  src={process.env.NEXT_PUBLIC_OLAP_SALES_URL}
                  className="w-full h-[600px] border-none"
                  title="Mondrian Sales"
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* SECTION PRODUCTION */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <button
            onClick={() => setOpenTab(openTab === "production" ? "" : "production")}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm font-bold">P</div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Mondrian OLAP - Fact Production</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Multidimensional Production Analysis</p>
              </div>
            </div>
            <span className={`transform transition-transform duration-300 ${openTab === "production" ? "rotate-180" : ""}`}>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </button>

          {openTab === "production" && (
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="bg-white rounded-xl shadow-inner overflow-hidden border border-slate-200">
                <iframe
                  src={process.env.NEXT_PUBLIC_OLAP_PRODUCTION_URL}
                  className="w-full h-[600px] border-none"
                  title="Mondrian Production"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}