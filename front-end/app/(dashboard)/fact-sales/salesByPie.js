"use client";

import { PieChart, Pie, Cell, Tooltip as ReTooltip } from "recharts";
import { ChevronLeft } from "lucide-react";

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#0ea5e9", "#a855f7"];

export default function SalesByCategoryPie({
  byCategory,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  viewMode = "qty"
}) {
  const data = (byCategory || []).map((c) => ({
    name: c.category || "Unknown", // the backend returns `subcategory AS category` when filtered
    value: viewMode === "revenue" ? Number(c.total_revenue) || 0 : Number(c.total_qty) || 0,
  }));

  const formatValue = (value) => {
    if (viewMode === "revenue") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
    }
    return Number(value).toLocaleString("id-ID");
  };

  const handleSliceClick = (entry) => {
    if (!selectedCategory) {
      // We are in Category mode
      onSelectCategory((prev) => (prev === entry.name ? null : entry.name));
    } else {
      // We are in Subcategory mode
      onSelectSubcategory((prev) => (prev === entry.name ? null : entry.name));
    }
  };

  const handleBack = () => {
    onSelectSubcategory(null);
    onSelectCategory(null);
  };

  // Determine active item to highlight
  const activeItem = selectedCategory ? selectedSubcategory : selectedCategory;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center h-full border border-slate-50 relative">
      <div className="w-full">
        <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
          {selectedCategory && (
            <button 
              onClick={handleBack}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              title="Kembali ke Kategori"
            >
              <ChevronLeft size={14} className="text-slate-400 hover:text-indigo-600" />
            </button>
          )}
          SALES BY {selectedCategory ? "SUBCATEGORY" : "CATEGORY"}
        </p>
        <p className="text-xs text-slate-400 mb-3">
          {selectedCategory 
            ? `Subkategori dari ${selectedCategory}. Klik untuk memfilter data lebih spesifik.`
            : "Klik kategori untuk memfilter trend, top products, dan country & cities."}
        </p>
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-slate-400 mt-4">Tidak ada data.</p>
      ) : (
        <PieChart width={260} height={220}>
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
            {data.map((entry, index) => {
              const isActive = !activeItem || activeItem === entry.name;
              return (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={isActive ? 1 : 0.35}
                  className="cursor-pointer"
                  onClick={() => handleSliceClick(entry)}
                />
              );
            })}
          </Pie>
          <ReTooltip
            formatter={(value) => formatValue(value)}
          />
        </PieChart>
      )}

      {/* LIST ITEM */}
      <div className="mt-3 w-full max-h-28 overflow-y-auto text-xs">
        {data.map((c, idx) => {
          const isActive = activeItem === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => handleSliceClick(c)}
              className={`w-full flex justify-between items-center py-1.5 border-b border-slate-50 text-left px-2 transition-colors rounded-md ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span>{c.name}</span>
              </div>
              <span>{formatValue(c.value)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
