"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
} from "recharts";

export default function TopProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:4000/api/sales/top-products");

        if (!res.ok) {
          console.error("HTTP error:", res.status, res.statusText);
          return;
        }

        const json = await res.json();
        console.log("top-products response:", json);

        const data = Array.isArray(json) ? json : json.data ?? [];

        setProducts(data);
      } catch (err) {
        console.error("Error fetch top products:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const chartData = useMemo(() => {
    return (products || []).map((p, idx) => {
      const name = p.product_name || p.product || p.name || `Produk ${idx + 1}`;
      const total = Number(p.total_qty ?? p.total_orderqty ?? p.value ?? 0);

      const shortName = name.length > 18 ? name.slice(0, 16) + "…" : name;

      return {
        rank: idx + 1,
        name,
        shortName,
        value: total,
      };
    });
  }, [products]);

  const formatNumberTick = (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Top 10 Products
          </h1>
          <p className="text-sm text-slate-500">
            Detail kontribusi 10 produk dengan OrderQty terbesar pada{" "}
            <span className="font-semibold">fact_sales</span>.
          </p>
        </div>
        <Link
          href="/dashboard/fact-sales"
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          ← Kembali ke overview
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        {loading ? (
          <p className="text-sm text-slate-500">Memuat data…</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-slate-500">
            Tidak ada data top products yang dapat ditampilkan.
          </p>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
              TOP 10 PRODUCTS
            </p>
            <p className="text-sm text-slate-600 mb-4">
              Berdasarkan akumulasi{" "}
              <span className="font-semibold">OrderQty</span> pada{" "}
              <span className="font-semibold">fact_sales</span>.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* BAR CHART */}
              <div className="lg:col-span-3">
                <BarChart
                  width={520}
                  height={260}
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickFormatter={formatNumberTick}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <ReTooltip
                    formatter={(value, name, props) => {
                      const d = props?.payload;
                      const label = d ? `${d.rank}. ${d.name}` : name;
                      return [Number(value).toLocaleString("id-ID"), label];
                    }}
                    labelFormatter={() => ""}
                  />
                  <Bar
                    dataKey="value"
                    name="OrderQty"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </div>

              {/* LIST RANKING */}
              <div className="lg:col-span-2 text-xs space-y-2 max-h-64 overflow-y-auto">
                {chartData.map((p) => (
                  <div
                    key={p.rank}
                    className="flex items-start justify-between gap-3 border-b border-slate-100 pb-1"
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-slate-600 mr-1">
                        {p.rank}.
                      </span>
                      <span className="text-slate-600">{p.name}</span>
                    </div>
                    <span className="whitespace-nowrap font-semibold text-slate-900">
                      {p.value.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
