"use client";

import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#10b981"]; // Blue for Store, Emerald for Individual (or vice-versa)

export default function CustomerTypeChart({ 
  byCustomerType, 
  selectedCategory, 
  selectedSubcategory,
  selectedCountry,
  selectedProvince,
  selectedYear,
  selectedMonth,
  viewMode = "qty"
}) {
  // mapping data from DB where Type 'S' = Store, 'I' = Individual
  const data = (byCustomerType || []).map((item) => ({
    name: item.Type === "S" ? "Store (B2B)" : item.Type === "I" ? "Individual (B2C)" : "Unknown",
    value: viewMode === "revenue" ? Number(item.total_revenue) || 0 : Number(item.total_qty) || 0,
  }));

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col h-full border border-slate-50">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
        SALES BY CUSTOMER TYPE
        {selectedYear ? ` – ${selectedYear}` : ""}
        {selectedMonth ? ` – ${selectedMonth}` : ""}
        {selectedCategory ? ` – ${selectedCategory}` : ""}
        {selectedSubcategory ? ` > ${selectedSubcategory}` : ""}
        {selectedCountry ? ` – ${selectedCountry}` : ""}
        {selectedProvince ? ` > ${selectedProvince}` : ""}
      </p>
      <p className="text-xs text-slate-400 mb-4">
        Proporsi {viewMode === "revenue" ? "pendapatan" : "volume penjualan"} berdasarkan tipe pelanggan (Toko vs Individu)
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

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-slate-400">Tidak ada data pelanggan.</p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-[220px] flex flex-col">
          <div className="flex-1 w-full min-h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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

          {/* Legend Khusus */}
          {!data.length ? null : (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {data.map((entry, index) => {
                const percentage = total === 0 ? 0 : Math.round((entry.value / total) * 100);
                return (
                  <div key={entry.name} className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-xs font-semibold text-slate-700">{entry.name}</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1 px-1">
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-200/50 px-1.5 py-0.5 rounded-md">
                        {percentage}%
                      </span>
                      <span className="text-lg font-bold text-slate-700">
                        {viewMode === "revenue" 
                          ? (entry.value >= 1000000 
                              ? `$${(entry.value / 1000000).toFixed(1)}M` 
                              : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(entry.value))
                          : entry.value.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
