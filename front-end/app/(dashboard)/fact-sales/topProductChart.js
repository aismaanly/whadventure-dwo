"use client";
import { useMemo } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";

export default function TopProductsCard({ 
  topProducts, 
  selectedCategory, 
  selectedSubcategory,
  selectedCountry,
  selectedProvince,
  selectedYear,
  selectedMonth,
  viewMode = "qty"
}) {
  const chartData = useMemo(() => {
    return [...topProducts].sort(
      (a, b) => viewMode === "revenue" ? Number(a.total_revenue || 0) - Number(b.total_revenue || 0) : Number(a.total_qty || 0) - Number(b.total_qty || 0)
    );
  }, [topProducts, viewMode]);

  const data = chartData.map((p) => ({
    name: p.name || "",
    value: viewMode === "revenue" ? Number(p.total_revenue) || 0 : Number(p.total_qty) || 0,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col h-full">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
        TOP 10 PRODUCTS
        {selectedYear ? ` – ${selectedYear}` : ""}
        {selectedMonth ? ` – ${selectedMonth}` : ""}
        {selectedCategory ? ` – ${selectedCategory}` : ""}
        {selectedSubcategory ? ` > ${selectedSubcategory}` : ""}
        {selectedCountry ? ` – ${selectedCountry}` : ""}
        {selectedProvince ? ` > ${selectedProvince}` : ""}
      </p>
      <p className="text-xs text-slate-400 mb-4">
        Daftar 10 produk terlaris dengan {viewMode === "revenue" ? "pendapatan" : "volume penjualan"} tertinggi
        {selectedCategory || selectedCountry ? (
          <>
            {selectedCategory && (
              <>
                {" "}pada kategori <span className="font-semibold">{selectedCategory}</span>
              </>
            )}
            {selectedCountry && (
              <>
                {" "}di <span className="font-semibold">{selectedCountry}</span>
              </>
            )}
          </>
        ) : (
          " untuk semua data"
        )}
        .
      </p>

      <div className="flex-1 w-full min-h-[260px] relative">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={100}
            />
            <YAxis
              tickFormatter={(v) => {
                if (viewMode === "revenue") {
                  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
                  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
                  return `$${v}`;
                }
                return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v;
              }}
            />
            <ReTooltip
              formatter={(value) => {
                if (viewMode === "revenue") {
                  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
                }
                return Number(value).toLocaleString("id-ID");
              }}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="value" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
