"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip as ReTooltip } from "recharts";

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#0ea5e9",
  "#a855f7",
  "#14b8a6",
  "#e11d48",
];

const STOCK_SCRAP_COLORS = ["#22c55e", "#ef4444"];
const BASE_URL = "http://localhost:4000";
const LOCATION_TOP_N = 10;
const CATEGORY_TOP_N = 10;

export default function FactProductionPage() {
  const [byCategory, setByCategory] = useState([]);
  const [byLocation, setByLocation] = useState([]);

  // state drilldown kategori
  const [categoryDrill, setCategoryDrill] = useState(null);
  const [categoryDetail, setCategoryDetail] = useState([]);
  const [loadingCategoryDetail, setLoadingCategoryDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // VIEW tambahan untuk "Other" (kategori)
  const [catView, setCatView] = useState("detail"); 
  const [categoryOther, setCategoryOther] = useState([]); 
  const [loadingCategoryOther, setLoadingCategoryOther] = useState(false);

  // state drilldown lokasi
  const [locView, setLocView] = useState("main"); 
  const [locParent, setLocParent] = useState("main"); 
  const [locationDrill, setLocationDrill] = useState(null); 
  const [locationDetail, setLocationDetail] = useState([]); 
  const [locationOther, setLocationOther] = useState([]); 
  const [loadingLocationDetail, setLoadingLocationDetail] = useState(false);

  // load data overview
  useEffect(() => {
    fetch(`${BASE_URL}/api/production/by-category`)
      .then((res) => res.json())
      .then(setByCategory)
      .catch(console.error);

    fetch(`${BASE_URL}/api/production/by-location?top=${LOCATION_TOP_N}`)
      .then((res) => res.json())
      .then(setByLocation)
      .catch(console.error);
  }, []);

  // drilldown: kategori
  useEffect(() => {
    if (!categoryDrill) {
      setCategoryDetail([]);
      setCategoryOther([]);
      setCatView("detail");
      setSelectedProduct(null);
      return;
    }

    setLoadingCategoryDetail(true);
    fetch(`${BASE_URL}/api/production/by-category-detail?category=${encodeURIComponent(categoryDrill)}&top=${CATEGORY_TOP_N}`)
      .then((res) => res.json())
      .then((rows) => {
        setCategoryDetail(rows);
        setCategoryOther([]);
        setCatView("detail");
        setSelectedProduct(null);
      })
      .catch(console.error)
      .finally(() => setLoadingCategoryDetail(false));
  }, [categoryDrill]);

  // effect category other
  useEffect(() => {
    if (!categoryDrill || catView !== "other") return;
    setLoadingCategoryOther(true);
    fetch(`${BASE_URL}/api/production/by-category-other?category=${encodeURIComponent(categoryDrill)}&top=${CATEGORY_TOP_N}`)
      .then((res) => res.json())
      .then(setCategoryOther)
      .catch(console.error)
      .finally(() => setLoadingCategoryOther(false));
  }, [catView, categoryDrill]);

  // location other
  useEffect(() => {
    if (locView !== "other") return;
    setLoadingLocationDetail(true);
    fetch(`${BASE_URL}/api/production/by-location-other?top=${LOCATION_TOP_N}`)
      .then((res) => res.json())
      .then(setLocationOther)
      .catch(console.error)
      .finally(() => setLoadingLocationDetail(false));
  }, [locView]);

  // location detail
  useEffect(() => {
    if (locView !== "detail" || !locationDrill) {
      setLocationDetail([]);
      return;
    }
    setLoadingLocationDetail(true);
    fetch(`${BASE_URL}/api/production/by-location-detail?location=${encodeURIComponent(locationDrill)}&top=${LOCATION_TOP_N}`)
      .then((res) => res.json())
      .then(setLocationDetail)
      .catch(console.error)
      .finally(() => setLoadingLocationDetail(false));
  }, [locView, locationDrill]);

  // KPI Calculations
  const totalStock = byCategory.reduce((sum, row) => sum + Number(row.total_stock || 0), 0);
  const totalScrap = byCategory.reduce((sum, row) => sum + Number(row.total_scrap || 0), 0);
  const scrapRatio = totalStock + totalScrap === 0 ? 0 : (totalScrap / (totalStock + totalScrap)) * 100;

  // Pie Data Category
  const categoryOverviewData = byCategory.filter((row) => row.category).map((row) => ({
    name: row.category,
    value: Number(row.total_stock || 0),
  }));

  const categoryDetailPieData = categoryDetail.map((row) => ({
    name: row.product_name,
    value: Number(row.total_stock || 0),
    isOther: row.product_name === "Other" || row.__other === true,
  }));

  const categoryPieData = categoryDrill && categoryDetailPieData.length > 0 ? categoryDetailPieData : categoryOverviewData;

  // Pie Data Location
  const locationOverviewData = byLocation.map((row) => ({
    name: row.location,
    value: Number(row.total_stock || 0),
    isOther: row.location === "Other" || row.__other === true,
  }));

  const locationOtherPieData = locationOther.map((row) => ({
    name: row.location,
    value: Number(row.total_stock || 0),
    isOther: false,
  }));

  const locationDetailPieData = locationDetail.map((row) => ({
    name: row.category,
    value: Number(row.total_stock || 0),
  }));

  const locationPieData = locView === "detail" ? locationDetailPieData : locView === "other" ? locationOtherPieData : locationOverviewData;

  const getSummary = (rows) => {
    const stock = rows.reduce((sum, r) => sum + Number(r.total_stock || 0), 0);
    const scrap = rows.reduce((sum, r) => sum + Number(r.total_scrap || 0), 0);
    const ratio = stock + scrap === 0 ? 0 : (scrap / (stock + scrap)) * 100;
    return { stock, scrap, ratio };
  };

  const categorySummaryBase = categoryDrill ? getSummary(categoryDetail) : { stock: totalStock, scrap: totalScrap, ratio: scrapRatio };
  const selectedProductRow = selectedProduct ? (catView === "other" ? categoryOther : categoryDetail).find((r) => r.product_name === selectedProduct) : null;
  const productSummary = selectedProductRow ? {
        stock: Number(selectedProductRow.total_stock || 0),
        scrap: Number(selectedProductRow.total_scrap || 0),
        ratio: Number(selectedProductRow.total_stock || 0) + Number(selectedProductRow.total_scrap || 0) === 0 ? 0 : (Number(selectedProductRow.total_scrap || 0) / (Number(selectedProductRow.total_stock || 0) + Number(selectedProductRow.total_scrap || 0))) * 100,
      } : null;

  const categorySummary = productSummary || categorySummaryBase;
  const locationSummary = locView === "detail" ? getSummary(locationDetail) : locView === "other" ? getSummary(locationOther) : { stock: totalStock, scrap: totalScrap, ratio: scrapRatio };

  // UI Strings
  const categoryHeaderTitle = !categoryDrill ? "Output Produksi per Kategori" : catView === "other" ? `Produk Lainnya (Other) – ${categoryDrill}` : `Detail Produk – ${categoryDrill}`;
  const categoryHint = !categoryDrill ? "Klik potongan pie untuk melihat detail produk per kategori." : catView === "other" ? "Klik salah satu produk untuk melihat ringkasan. Klik ← Kembali untuk kembali ke Top 10." : "Klik salah satu produk untuk melihat Stocked & Scrapped. Klik potongan 'Other' untuk melihat produk lainnya.";
  const locationHeaderTitle = locView === "detail" ? `Detail Kategori – ${locationDrill}` : locView === "other" ? "Lokasi Lainnya (Other)" : "Output Produksi per Lokasi";
  const locationHint = locView === "main" ? "Klik lokasi untuk melihat kategori. Klik potongan 'Other' untuk melihat lokasi lainnya." : locView === "other" ? "Klik salah satu lokasi untuk melihat detail kategori di lokasi tersebut." : "Klik ← Kembali untuk kembali ke daftar sebelumnya.";

  // Handlers
  const handleCategoryClick = (data) => {
    const payload = data?.payload ?? data;
    const name = payload?.name ?? data?.name;
    if (!name) return;

    if (!categoryDrill) {
      setCategoryDrill(name);
      setCatView("detail");
      return;
    }
    if (catView === "detail" && (payload?.isOther || name === "Other")) {
      setCatView("other");
      setSelectedProduct(null);
      return;
    }
    if (payload?.isOther || name === "Other") return;
    setSelectedProduct((prev) => (prev === name ? null : name));
  };

  const handleCategoryBack = () => {
    if (catView === "other") { setCatView("detail"); setSelectedProduct(null); return; }
    setCategoryDrill(null); setSelectedProduct(null); setCatView("detail");
  };

  const handleLocationClick = (data) => {
    const payload = data?.payload ?? data;
    const name = payload?.name ?? data?.name;
    if (!name) return;

    if (locView === "main") {
      if (payload?.isOther || name === "Other") { setLocParent("main"); setLocView("other"); return; }
      setLocParent("main"); setLocationDrill(name); setLocView("detail");
    } else if (locView === "other") {
      setLocParent("other"); setLocationDrill(name); setLocView("detail");
    }
  };

  const handleLocationBack = () => {
    if (locView === "detail") { setLocView(locParent); setLocationDrill(null); return; }
    if (locView === "other") { setLocView("main"); setLocParent("main"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Fact Production Overview</h1>
          <p className="text-sm text-slate-500">Ringkasan output produksi berdasarkan data warehouse <span className="font-semibold">whadventure</span>.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Stocked Qty</p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">{totalStock.toLocaleString("id-ID")}</p>
          </div>
          <p className="mt-4 text-xs text-slate-400">Jumlah produk yang berhasil diproduksi.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Scrapped Qty</p>
            <p className="mt-3 text-3xl font-bold text-rose-500">{totalScrap.toLocaleString("id-ID")}</p>
          </div>
          <p className="mt-4 text-xs text-slate-400">Jumlah produk cacat / dibuang selama proses produksi.</p>
        </div>
        <div className="bg-gradient-to-r from-sky-500 to-cyan-400 rounded-2xl shadow-sm p-5 text-white flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase">Rasio Scrap</p>
            <p className="mt-3 text-3xl font-bold">{scrapRatio.toFixed(1)}%</p>
          </div>
          <p className="mt-4 text-xs text-sky-100">Perbandingan antara barang scrap dan seluruh output produksi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIE 1: CATEGORY */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{categoryHeaderTitle}</p>
              <p className="text-xs text-slate-400">{categoryHint}</p>
            </div>
            {categoryDrill && <button className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50" onClick={handleCategoryBack}>← Kembali</button>}
          </div>

          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between gap-4">
            {categoryDrill && catView === "other" ? (
              <div className="w-[260px] h-[220px] overflow-auto rounded-xl border border-slate-200 p-2">
                {loadingCategoryOther ? <p className="text-xs text-slate-400">Memuat...</p> : 
                 categoryOther.length === 0 ? <p className="text-xs text-slate-400">Kosong.</p> :
                  <ul className="space-y-1">
                    {categoryOther.map((r) => (
                      <li key={r.product_name} onClick={() => setSelectedProduct((prev) => prev === r.product_name ? null : r.product_name)}
                          className={`cursor-pointer rounded-lg px-2 py-1 flex items-center justify-between ${selectedProduct === r.product_name ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-700"}`}>
                        <span className="text-xs truncate pr-2">{r.product_name}</span>
                        <span className="text-xs tabular-nums">{Number(r.total_stock).toLocaleString("id-ID")}</span>
                      </li>
                    ))}
                  </ul>
                }
              </div>
            ) : (
              <PieChart width={260} height={220}>
                <Pie data={categoryPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} stroke="#ffffff" isAnimationActive={true} onClick={handleCategoryClick}>
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={selectedProduct ? (entry.name === selectedProduct ? 1 : 0.35) : 1} className="cursor-pointer" />
                  ))}
                </Pie>
                <ReTooltip formatter={(value) => Number(value).toLocaleString("id-ID")} />
              </PieChart>
            )}

            <div className="flex flex-col items-start w-full lg:w-48 text-xs text-slate-600 space-y-1">
              <p className="font-semibold">{selectedProduct ? `Ringkasan produk` : categoryDrill ? "Ringkasan kategori" : "Ringkasan produksi"}</p>
              {selectedProduct && <p className="text-[11px] text-slate-500 mb-1">Produk: <span className="font-semibold">{selectedProduct}</span></p>}
              <p>Stocked: <span className="font-semibold">{categorySummary.stock.toLocaleString("id-ID")}</span></p>
              <p>Scrapped: <span className="font-semibold">{categorySummary.scrap.toLocaleString("id-ID")}</span></p>
              <p>Scrap ratio: <span className="font-semibold">{categorySummary.ratio.toFixed(1)}%</span></p>
              {categoryDrill && (
                <div className="mt-3 self-center">
                  <PieChart width={140} height={140}>
                    <Pie data={[{ name: "Stocked", value: categorySummary.stock }, { name: "Scrapped", value: categorySummary.scrap }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={55} stroke="#ffffff" isAnimationActive={true}>
                      <Cell fill={STOCK_SCRAP_COLORS[0]} /><Cell fill={STOCK_SCRAP_COLORS[1]} />
                    </Pie>
                    <ReTooltip formatter={(val) => Number(val).toLocaleString("id-ID")} />
                  </PieChart>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PIE 2: LOCATION */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{locationHeaderTitle}</p>
              <p className="text-xs text-slate-400">{locationHint}</p>
            </div>
            {locView !== "main" && <button className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50" onClick={handleLocationBack}>← Kembali</button>}
          </div>

          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between gap-4">
            <PieChart width={260} height={220}>
              <Pie data={locationPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} stroke="#ffffff" isAnimationActive={true} onClick={handleLocationClick}>
                {locationPieData.map((entry, index) => (
                  <Cell key={`loc-${index}`} fill={COLORS[index % COLORS.length]} className={locView === "detail" ? "cursor-default" : "cursor-pointer"} />
                ))}
              </Pie>
              <ReTooltip formatter={(value) => Number(value).toLocaleString("id-ID")} />
            </PieChart>
            <div className="text-xs text-slate-600 space-y-1 w-full lg:w-48">
              <p className="font-semibold">{locView === "detail" ? "Ringkasan lokasi" : locView === "other" ? "Ringkasan Other" : "Ringkasan produksi"}</p>
              {locView === "detail" && locationDrill && <p className="text-[11px] text-slate-500">Lokasi: <span className="font-semibold">{locationDrill}</span></p>}
              <p>Stocked: <span className="font-semibold">{locationSummary.stock.toLocaleString("id-ID")}</span></p>
              <p>Scrapped: <span className="font-semibold">{locationSummary.scrap.toLocaleString("id-ID")}</span></p>
              <p>Scrap ratio: <span className="font-semibold">{locationSummary.ratio.toFixed(1)}%</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}