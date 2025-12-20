"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from "recharts";

export default function SalesTrendChart({ byDate, selectedCategory }) {
  // agregasi harian -> bulanan
  const monthlySales = (() => {
    const map = {};

    byDate.forEach((row) => {
      const d = new Date(row.date);
      if (Number.isNaN(d.getTime())) return;

      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      if (!map[ym]) {
        map[ym] = {
          key: ym,
          label: d.toLocaleDateString("id-ID", {
            month: "short",
            year: "2-digit",
          }),
          total_qty: 0,
          ts: d.getTime(),
        };
      }
      map[ym].total_qty += Number(row.total_qty || 0);
    });

    return Object.values(map).sort((a, b) => a.ts - b.ts);
  })();

  const formatNumberTick = (value) => {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
        TREND PENJUALAN
        {selectedCategory ? ` – ${selectedCategory}` : ""}
      </p>
      <p className="text-sm text-slate-600 mb-4">
        Total OrderQty per bulan
        {selectedCategory && (
          <>
            {" "}
            untuk kategori{" "}
            <span className="font-semibold">{selectedCategory}</span>
          </>
        )}
        .
      </p>

      <div className="w-full flex justify-center">
        <BarChart
          width={820}
          height={280}
          data={monthlySales}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6366f1" }}
            minTickGap={20}
          />
          <YAxis
            tickFormatter={formatNumberTick}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <ReTooltip
            formatter={(value) => Number(value).toLocaleString("id-ID")}
            labelFormatter={(label) => label}
          />
          <Bar
            dataKey="total_qty"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            barSize={14}
          />
        </BarChart>
      </div>
    </div>
  );
}
