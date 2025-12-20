"use client";
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:4000";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [prodCat, setProdCat] = useState("All");
  const [salesCat, setSalesCat] = useState("All");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Bikes", "Components"];

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/home/summary?prodCat=${prodCat}&salesCat=${salesCat}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [prodCat, salesCat]);

  if (loading && !data) {
    return (
      <div className="p-10 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Sinkronisasi Data Warehouse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* SECTION PRODUCTION */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Summary (Production) {prodCat !== "All" && <span className="text-blue-600">: {prodCat}</span>}
            </h2>
            <p className="text-sm text-slate-500">Pantau output dan efisiensi produksi.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori:</span>
            <select 
              value={prodCat} 
              onChange={(e) => setProdCat(e.target.value)}
              className="text-sm font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="Total Order Qty" value={data?.production?.total_order_qty} color="text-blue-600" desc="Estimasi pesanan produksi" />
          <KpiCard title="Total Stocked Qty" value={data?.production?.total_stocked_qty} color="text-emerald-600" desc="Barang masuk gudang" />
          <KpiCard title="Total Scrapped Qty" value={data?.production?.total_scrapped_qty} color="text-rose-500" desc="Barang cacat produksi" />
          <KpiCard title="Production Cost" value={data?.production?.total_production_cost} color="text-amber-500" isCurrency desc="Total pengeluaran biaya" />
        </div>
      </section>

      {/* SECTION SALES */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Summary (Sales) {salesCat !== "All" && <span className="text-indigo-600">: {salesCat}</span>}
            </h2>
            <p className="text-sm text-slate-500">Pantau performa penjualan dan pendapatan.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori:</span>
            <select 
              value={salesCat} 
              onChange={(e) => setSalesCat(e.target.value)}
              className="text-sm font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <KpiCard title="Total Sales Qty" value={data?.sales?.total_order_qty} color="text-indigo-600" desc="Produk terjual ke user" />
          <KpiCard title="Total Incomes" value={data?.sales?.total_incomes} color="text-green-600" isCurrency desc="Total pendapatan masuk" />
        </div>
      </section>
    </div>
  );
}

function KpiCard({ title, value, color, isCurrency, desc }) {
  // Pastikan nilai dikonversi ke Number agar .toLocaleString bekerja
  const numericValue = Number(value || 0);

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 flex flex-col justify-between hover:shadow-md transition-all duration-300 min-h-[140px]">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className={`text-3xl font-black mt-3 ${color}`}>
          {isCurrency 
            ? `$ ${numericValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            : numericValue.toLocaleString("id-ID")}
        </p>
      </div>
      <p className="text-[10px] text-slate-400 mt-4 font-medium italic">
        {desc}
      </p>
    </div>
  );
}