"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from "recharts";

export default function TopProductsCard({ topProducts, selectedCategory }) {
  const data = topProducts.map((p) => ({
    name: p.name || "",
    value: Number(p.total_qty) || 0,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-fit">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
        TOP 10 PRODUCTS
        {selectedCategory ? ` – ${selectedCategory}` : ""}
      </p>
      <p className="text-sm text-slate-600 mb-4">
        Berdasarkan akumulasi OrderQty pada{" "}
        <span className="font-semibold">fact_sales</span>
        {selectedCategory && (
          <>
            {" "}
            untuk kategori{" "}
            <span className="font-semibold">{selectedCategory}</span>.
          </>
        )}
      </p>

      <div className="w-full flex justify-center">
        <BarChart
          width={560}
          height={230}
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          <ReTooltip
            formatter={(value) => Number(value).toLocaleString("id-ID")}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="value" fill="#22c55e" />
        </BarChart>
      </div>
    </div>
  );
}
