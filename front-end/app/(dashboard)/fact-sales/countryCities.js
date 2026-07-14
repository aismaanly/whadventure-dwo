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
  Cell
} from "recharts";
import { ChevronLeft } from "lucide-react";

export default function GeographyChart({
  byGeography,
  selectedCountry,
  selectedProvince,
  onSelectCountry,
  onSelectProvince,
  selectedCategory,
  selectedSubcategory,
  selectedYear,
  selectedMonth,
  viewMode = "qty"
}) {
  const chartData = useMemo(() => {
    const sorted = [...(byGeography || [])].sort(
      (a, b) => viewMode === "revenue" ? Number(b.total_revenue || 0) - Number(a.total_revenue || 0) : Number(b.total_qty || 0) - Number(a.total_qty || 0)
    );
    // Limit to top 10 for readability
    return sorted.slice(0, 10).map(c => ({
      ...c,
      value: viewMode === "revenue" ? Number(c.total_revenue) : Number(c.total_qty)
    }));
  }, [byGeography, viewMode]);

  const handleBarClick = (data) => {
    if (!data || !data.location) return;
    
    if (!selectedCountry) {
      onSelectCountry(data.location);
    } else if (!selectedProvince) {
      onSelectProvince(data.location);
    }
  };

  const handleBack = () => {
    if (selectedProvince) {
      onSelectProvince(null);
    } else if (selectedCountry) {
      onSelectCountry(null);
    }
  };

  const isCityLevel = selectedCountry && selectedProvince;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col h-full border border-slate-50">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
          {(selectedCountry) && (
            <button 
              onClick={handleBack}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              title="Kembali ke level sebelumnya"
            >
              <ChevronLeft size={14} className="text-slate-400 hover:text-indigo-600" />
            </button>
          )}
          SALES BY GEOGRAPHY
          {selectedCountry ? ` – ${selectedCountry}` : ""}
          {selectedProvince ? ` > ${selectedProvince}` : ""}
          {selectedCategory ? ` – ${selectedCategory}` : ""}
          {selectedSubcategory ? ` > ${selectedSubcategory}` : ""}
        </p>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Sebaran {isCityLevel ? "kota" : (selectedCountry ? "provinsi" : "negara")} dengan {viewMode === "revenue" ? "pendapatan" : "volume penjualan"} tertinggi
        {(!isCityLevel) && ". Klik batang grafik untuk melihat area yang lebih spesifik."}
      </p>

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
           <p className="text-xs text-slate-400">Tidak ada data wilayah.</p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-[260px] text-xs relative">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="location" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
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
                  cursor={{ fill: "transparent" }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  onClick={handleBarClick}
                  className={isCityLevel ? "" : "cursor-pointer hover:opacity-80 transition-opacity"}
                >
                   {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#0ea5e9" />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
