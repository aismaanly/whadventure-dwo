"use client";

import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#f43f5e", "#8b5cf6", "#eab308", "#14b8a6", "#f97316", "#3b82f6", "#10b981"];

export default function TerritoryChart({ 
  byTerritory, 
  selectedCategory, 
  selectedSubcategory,
  selectedCountry,
  selectedProvince,
  selectedYear,
  selectedMonth,
  viewMode = "qty"
}) {
  const data = (byTerritory || []).map((item) => ({
    name: item.territory || "Unknown",
    value: viewMode === "revenue" ? Number(item.total_revenue) || 0 : Number(item.total_qty) || 0,
  }));

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col h-full border border-slate-50">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
        SALES BY TERRITORY
        {selectedYear ? ` – ${selectedYear}` : ""}
        {selectedMonth ? ` – ${selectedMonth}` : ""}
        {selectedCategory ? ` – ${selectedCategory}` : ""}
        {selectedSubcategory ? ` > ${selectedSubcategory}` : ""}
        {selectedCountry ? ` – ${selectedCountry}` : ""}
        {selectedProvince ? ` > ${selectedProvince}` : ""}
      </p>
      <p className="text-xs text-slate-400 mb-4">
        Proporsi {viewMode === "revenue" ? "pendapatan" : "volume penjualan"} berdasarkan wilayah operasional (Sales Territory)
      </p>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-400">Tidak ada data teritori.</p>
        </div>
      ) : (
        <div className="flex-1 w-full flex flex-col min-h-[220px]">
          <div className="flex-1 w-full min-h-[160px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={1}
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ReTooltip 
                  formatter={(value) => {
                    if (viewMode === "revenue") {
                      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
                    }
                    return Number(value).toLocaleString("id-ID");
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 w-full max-h-32 overflow-y-auto text-xs grid grid-cols-2 gap-2">
            {data.map((c, idx) => {
              const percentage = total === 0 ? 0 : Math.round((c.value / total) * 100);
              return (
                <div key={c.name} className="flex flex-col gap-1 p-2 rounded-xl bg-slate-50/50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-[10px] font-semibold text-slate-700 truncate">{c.name}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1 px-1">
                    <span className="text-[9px] text-slate-400 font-medium bg-slate-200/50 px-1 py-0.5 rounded-sm">
                      {percentage}%
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {viewMode === "revenue" 
                        ? (c.value >= 1000000 
                            ? `$${(c.value / 1000000).toFixed(1)}M` 
                            : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(c.value))
                        : c.value.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
