"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#f43f5e", "#d946ef", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b"];

export default function ShippingMethodChart({ 
  byShippingMethod, 
  selectedCategory, 
  selectedSubcategory,
  selectedCountry,
  selectedProvince,
  selectedYear,
  selectedMonth,
  viewMode = "qty"
}) {
  const data = useMemo(() => {
    return (byShippingMethod || []).map((item) => ({
      name: item.name || "Unknown",
      value: viewMode === "revenue" ? Number(item.total_revenue) : Number(item.total_qty),
    }));
  }, [byShippingMethod, viewMode]);

  const formatter = (value) => {
    if (viewMode === "revenue") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
    }
    return Number(value).toLocaleString("id-ID");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center h-full border border-slate-50">
      <div className="w-full">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
          SALES BY SHIPPING METHOD
          {selectedYear ? ` – ${selectedYear}` : ""}
          {selectedMonth ? ` – ${selectedMonth}` : ""}
          {selectedCategory ? ` – ${selectedCategory}` : ""}
          {selectedSubcategory ? ` > ${selectedSubcategory}` : ""}
          {selectedCountry ? ` – ${selectedCountry}` : ""}
          {selectedProvince ? ` > ${selectedProvince}` : ""}
        </p>
        <p className="text-xs text-slate-400 mb-3">
          Distribusi {viewMode === "revenue" ? "pendapatan" : "kuantitas"} berdasarkan kurir pengiriman.
        </p>
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-slate-400 mt-4">Tidak ada data.</p>
      ) : (
        <>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ReTooltip formatter={(value) => formatter(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 w-full grid grid-cols-2 gap-2 text-xs">
            {data.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
