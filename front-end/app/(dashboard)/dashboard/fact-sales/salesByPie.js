"use client";

import { PieChart, Pie, Cell, Tooltip as ReTooltip } from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#0ea5e9", "#a855f7"];

export default function SalesByCategoryPie({
  byCategory,
  selectedCategory,
  onSelectCategory,
}) {
  const data = byCategory.map((c) => ({
    name: c.category || "Unknown",
    value: Number(c.total_qty) || 0,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col items-center">
      <div className="w-full">
        <p className="text-xs font-semibold text-slate-500 uppercase">
          SALES BY CATEGORY
        </p>
        <p className="text-sm text-slate-600 mb-3">
          Klik kategori untuk memfilter trend, top products, dan country & cities.
        </p>
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-slate-400 mt-4">Tidak ada data kategori.</p>
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
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}-${index}`}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={
                  !selectedCategory || selectedCategory === entry.name ? 1 : 0.35
                }
                className="cursor-pointer"
                onClick={() =>
                  onSelectCategory((prev) =>
                    prev === entry.name ? null : entry.name
                  )
                }
              />
            ))}
          </Pie>
          <ReTooltip
            formatter={(value) => Number(value).toLocaleString("id-ID")}
          />
        </PieChart>
      )}

      {/* LIST KATEGORI */}
      <div className="mt-3 w-full max-h-28 overflow-y-auto text-xs">
        {data.map((c) => {
          const active = selectedCategory === c.name;
          return (
            <button
              key={c.name}
              type="button"
              onClick={() =>
                onSelectCategory((prev) => (prev === c.name ? null : c.name))
              }
              className={`w-full flex justify-between py-1 border-b border-slate-100 text-left px-1 ${
                active
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-slate-700"
              }`}
            >
              <span>{c.name}</span>
              <span>{c.value.toLocaleString("id-ID")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
