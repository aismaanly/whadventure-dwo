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

// warna khusus untuk pie ringkasan Stocked vs Scrapped
const STOCK_SCRAP_COLORS = ["#22c55e", "#ef4444"];

const BASE_URL = "http://localhost:4000";

export default function FactProductionPage() {
  const [byCategory, setByCategory] = useState([]);
  const [byLocation, setByLocation] = useState([]);

  // state drilldown kategori
  const [categoryDrill, setCategoryDrill] = useState(null); // nama kategori yg sedang di-zoom
  const [categoryDetail, setCategoryDetail] = useState([]);
  const [loadingCategoryDetail, setLoadingCategoryDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // produk yg diklik di mode detail

  // state drilldown lokasi
  const [locationDrill, setLocationDrill] = useState(null); // nama lokasi yg sedang di-zoom
  const [locationDetail, setLocationDetail] = useState([]);
  const [loadingLocationDetail, setLoadingLocationDetail] = useState(false);

  // load data overview
  useEffect(() => {
    fetch(`${BASE_URL}/api/production/by-category`)
      .then((res) => res.json())
      .then(setByCategory)
      .catch(console.error);

    fetch(`${BASE_URL}/api/production/by-location`)
      .then((res) => res.json())
      .then(setByLocation)
      .catch(console.error);
  }, []);

  // drilldown: klik kategori -> ambil detail produk dalam kategori tsb
  useEffect(() => {
    if (!categoryDrill) {
      setCategoryDetail([]);
      setSelectedProduct(null); // reset produk terpilih saat keluar dari drill
      return;
    }

    setLoadingCategoryDetail(true);
    fetch(
      `${BASE_URL}/api/production/by-category-detail?category=${encodeURIComponent(
        categoryDrill
      )}`
    )
      .then((res) => res.json())
      .then((rows) => {
        setCategoryDetail(rows);
        setSelectedProduct(null); // reset saat ganti kategori drill
      })
      .catch(console.error)
      .finally(() => setLoadingCategoryDetail(false));
  }, [categoryDrill]);

  // drilldown: klik lokasi -> ambil detail kategori dalam lokasi tsb
  useEffect(() => {
    if (!locationDrill) {
      setLocationDetail([]);
      return;
    }

    setLoadingLocationDetail(true);
    fetch(
      `${BASE_URL}/api/production/by-location-detail?location=${encodeURIComponent(
        locationDrill
      )}`
    )
      .then((res) => res.json())
      .then(setLocationDetail)
      .catch(console.error)
      .finally(() => setLoadingLocationDetail(false));
  }, [locationDrill]);

  // -------- KPI global (pakai agregat dari byCategory) --------
  const totalStock = byCategory.reduce(
    (sum, row) => sum + Number(row.total_stock || 0),
    0
  );
  const totalScrap = byCategory.reduce(
    (sum, row) => sum + Number(row.total_scrap || 0),
    0
  );
  const scrapRatio =
    totalStock + totalScrap === 0
      ? 0
      : (totalScrap / (totalStock + totalScrap)) * 100;

  // -------- Data untuk PIE 1: kategori --------
  const categoryOverviewData = byCategory
    .filter((row) => row.category) // buang kategori NULL supaya nggak jadi "Unknown"
    .map((row) => ({
      name: row.category,
      value: Number(row.total_stock || 0),
    }));

  const categoryDetailPieData = categoryDetail.map((row) => ({
    name: row.product_name,
    value: Number(row.total_stock || 0),
  }));

  const categoryPieData =
    categoryDrill && categoryDetailPieData.length > 0
      ? categoryDetailPieData
      : categoryOverviewData;

  // -------- Data untuk PIE 2: lokasi --------
  const locationOverviewData = byLocation.map((row) => ({
    name: row.location,
    value: Number(row.total_stock || 0),
  }));

  const locationDetailPieData = locationDetail.map((row) => ({
    name: row.category,
    value: Number(row.total_stock || 0),
  }));

  const locationPieData =
    locationDrill && locationDetailPieData.length > 0
      ? locationDetailPieData
      : locationOverviewData;

  // helper ringkasan stock/scrap (untuk array row)
  const getSummary = (rows) => {
    const stock = rows.reduce((sum, r) => sum + Number(r.total_stock || 0), 0);
    const scrap = rows.reduce((sum, r) => sum + Number(r.total_scrap || 0), 0);
    const ratio = stock + scrap === 0 ? 0 : (scrap / (stock + scrap)) * 100;
    return { stock, scrap, ratio };
  };

  // ringkasan utk kategori (default: agregat kategori)
  const categorySummaryBase = categoryDrill
    ? getSummary(categoryDetail)
    : { stock: totalStock, scrap: totalScrap, ratio: scrapRatio };

  // ringkasan per-produk (kalau ada produk yg sedang dipilih)
  const selectedProductRow = selectedProduct
    ? categoryDetail.find((r) => r.product_name === selectedProduct)
    : null;

  const productSummary = selectedProductRow
    ? {
        stock: Number(selectedProductRow.total_stock || 0),
        scrap: Number(selectedProductRow.total_scrap || 0),
        ratio:
          Number(selectedProductRow.total_stock || 0) +
            Number(selectedProductRow.total_scrap || 0) ===
          0
            ? 0
            : (Number(selectedProductRow.total_scrap || 0) /
                (Number(selectedProductRow.total_stock || 0) +
                  Number(selectedProductRow.total_scrap || 0))) *
              100,
      }
    : null;

  // summary final yang ditampilkan di panel kanan pie 1
  const categorySummary = productSummary || categorySummaryBase;

  const locationSummary = locationDrill
    ? getSummary(locationDetail)
    : { stock: totalStock, scrap: totalScrap, ratio: scrapRatio };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Fact Production Overview
          </h1>
          <p className="text-sm text-slate-500">
            Ringkasan output produksi berdasarkan data warehouse{" "}
            <span className="font-semibold">whadventure</span>.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Total Stocked Qty
            </p>
            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {totalStock.toLocaleString("id-ID")}
            </p>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Jumlah produk yang berhasil diproduksi.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">
              Total Scrapped Qty
            </p>
            <p className="mt-3 text-3xl font-bold text-rose-500">
              {totalScrap.toLocaleString("id-ID")}
            </p>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Jumlah produk cacat / dibuang selama proses produksi.
          </p>
        </div>

        <div className="bg-gradient-to-r from-sky-500 to-cyan-400 rounded-2xl shadow-sm p-5 text-white flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase">Rasio Scrap</p>
            <p className="mt-3 text-3xl font-bold">{scrapRatio.toFixed(1)}%</p>
          </div>
          <p className="mt-4 text-xs text-sky-100">
            Perbandingan antara barang scrap dan seluruh output produksi.
          </p>
        </div>
      </div>

      {/* 2 PIE CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIE 1: BY CATEGORY */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                {categoryDrill
                  ? `Detail Produk – ${categoryDrill}`
                  : "Output Produksi per Kategori"}
              </p>
              <p className="text-xs text-slate-400">
                {categoryDrill
                  ? "Klik salah satu produk untuk melihat Stocked & Scrapped produk tersebut."
                  : "Klik potongan pie untuk melihat detail produk per kategori."}
              </p>
            </div>

            {categoryDrill && (
              <button
                className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  setCategoryDrill(null);
                  setSelectedProduct(null);
                }}
              >
                ← Kembali
              </button>
            )}
          </div>

          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* PIE UTAMA: overview kategori / detail produk */}
            <PieChart width={260} height={220}>
              <Pie
                data={categoryPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={1}
                isAnimationActive={true}
                onClick={(data) => {
                  if (!data?.name) return;

                  if (!categoryDrill) {
                    // MODE OVERVIEW -> klik kategori
                    setCategoryDrill((prev) =>
                      prev === data.name ? null : data.name
                    );
                  } else {
                    // MODE DRILL -> klik produk
                    setSelectedProduct((prev) =>
                      prev === data.name ? null : data.name
                    );
                  }
                }}
              >
                {categoryPieData.map((entry, index) => {
                  let opacity = 1;

                  if (!categoryDrill) {
                    // overview: highlight kategori yg di-hover (sudah diatur sebelumnya)
                    opacity = 1;
                  } else if (selectedProduct) {
                    // drill + ada produk terpilih => highlight produk tsb
                    opacity = entry.name === selectedProduct ? 1 : 0.35;
                  }

                  return (
                    <Cell
                      key={`cat-${entry.name}-${index}`}
                      className="cursor-pointer"
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={opacity}
                    />
                  );
                })}
              </Pie>
              <ReTooltip
                formatter={(value) => Number(value).toLocaleString("id-ID")}
              />
            </PieChart>

            {/* RINGKASAN + MINI PIE STOCKED vs SCRAPPED */}
            <div className="flex flex-col items-start w-full lg:w-48 text-xs text-slate-600 space-y-1">
              <p className="font-semibold">
                {selectedProduct
                  ? `Ringkasan produk`
                  : categoryDrill
                  ? "Ringkasan kategori"
                  : "Ringkasan produksi"}
              </p>

              {selectedProduct && (
                <p className="text-[11px] text-slate-500 mb-1">
                  Produk:{" "}
                  <span className="font-semibold">{selectedProduct}</span>
                </p>
              )}

              <p>
                Stocked:{" "}
                <span className="font-semibold">
                  {categorySummary.stock.toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                Scrapped:{" "}
                <span className="font-semibold">
                  {categorySummary.scrap.toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                Scrap ratio:{" "}
                <span className="font-semibold">
                  {categorySummary.ratio.toFixed(1)}%
                </span>
              </p>

              {loadingCategoryDetail && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Memuat detail...
                </p>
              )}

              {/* MINI PIE: Stocked vs Scrapped
                  - overview kategori: total all
                  - drill kategori TAPI belum pilih produk: agregat kategori
                  - drill + produk dipilih: data produk tsb
              */}
              {categoryDrill && (
                <div className="mt-3 self-center">
                  <PieChart width={140} height={140}>
                    <Pie
                      data={[
                        {
                          name: "Stocked",
                          value: categorySummary.stock,
                        },
                        {
                          name: "Scrapped",
                          value: categorySummary.scrap,
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={2}
                      stroke="#ffffff"
                      strokeWidth={1}
                      isAnimationActive={true}
                    >
                      <Cell key="stock" fill={STOCK_SCRAP_COLORS[0]} />
                      <Cell key="scrap" fill={STOCK_SCRAP_COLORS[1]} />
                    </Pie>
                    <ReTooltip
                      formatter={(value) =>
                        Number(value).toLocaleString("id-ID")
                      }
                    />
                  </PieChart>
                  <p className="text-[10px] text-slate-400 text-center mt-1">
                    Ringkasan Stocked vs Scrapped
                    {selectedProduct ? " (produk)" : " (kategori)"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PIE 2: BY LOCATION */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                {locationDrill
                  ? `Detail Kategori – ${locationDrill}`
                  : "Output Produksi per Lokasi"}
              </p>
              <p className="text-xs text-slate-400">
                Klik potongan pie untuk melihat kategori di lokasi tersebut.
              </p>
            </div>

            {locationDrill && (
              <button
                className="text-xs px-3 py-1 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50"
                onClick={() => setLocationDrill(null)}
              >
                ← Kembali
              </button>
            )}
          </div>

          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between gap-4">
            <PieChart width={260} height={220}>
              <Pie
                data={locationPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={1}
                isAnimationActive={true}
                onClick={(data) => {
                  if (!data?.name) return;
                  setLocationDrill((prev) =>
                    prev === data.name ? null : data.name
                  );
                }}
              >
                {locationPieData.map((entry, index) => (
                  <Cell
                    key={`loc-${entry.name}-${index}`}
                    className="cursor-pointer"
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={
                      !locationDrill || locationDrill === entry.name ? 1 : 0.35
                    }
                  />
                ))}
              </Pie>
              <ReTooltip
                formatter={(value) => Number(value).toLocaleString("id-ID")}
              />
            </PieChart>

            <div className="text-xs text-slate-600 space-y-1 w-full lg:w-48">
              <p className="font-semibold">
                {locationDrill ? "Ringkasan lokasi" : "Ringkasan produksi"}
              </p>
              <p>
                Stocked:{" "}
                <span className="font-semibold">
                  {locationSummary.stock.toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                Scrapped:{" "}
                <span className="font-semibold">
                  {locationSummary.scrap.toLocaleString("id-ID")}
                </span>
              </p>
              <p>
                Scrap ratio:{" "}
                <span className="font-semibold">
                  {locationSummary.ratio.toFixed(1)}%
                </span>
              </p>

              {loadingLocationDetail && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Memuat detail...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
