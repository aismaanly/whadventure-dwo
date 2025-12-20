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
  ReferenceLine,
} from "recharts";

export default function TotalQtyPage() {
  const [rawByDate, setRawByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("monthly");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:4000/api/sales/by-date");

        if (!res.ok) {
          setError(`Server mengembalikan status ${res.status}`);
          setRawByDate([]);
          return;
        }

        const json = await res.json();
        const data = Array.isArray(json) ? json : [];
        if (data.length === 0) {
          setError("Tidak ada data yang ditampilkan.");
        }
        setRawByDate(data);
      } catch (err) {
        console.error("Gagal load api/sales/by-date:", err);
        setError("Gagal memuat data dari server.");
        setRawByDate([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // data harian dengan angka yang sudah dipastikan Number
  const dailyData = useMemo(
    () =>
      rawByDate.map((d) => ({
        ...d,
        total_qty: Number(d.total_qty || 0),
      })),
    [rawByDate]
  );

  // agregasi bulanan: kunci YYYY-MM, label "Jan 2013", dst.
  const monthlyData = useMemo(() => {
    const map = new Map();

    dailyData.forEach((d) => {
      const dt = new Date(d.date);
      if (Number.isNaN(dt.getTime())) return;

      const key = `${dt.getFullYear()}-${String(
        dt.getMonth() + 1
      ).padStart(2, "0")}`;
      const label = dt.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });

      const prev = map.get(key) || { key, label, total_qty: 0 };
      prev.total_qty += d.total_qty;
      map.set(key, prev);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.key.localeCompare(b.key)
    );
  }, [dailyData]);

  const chartData = mode === "daily" ? dailyData : monthlyData;
  const xKey = mode === "daily" ? "date" : "label";
  const xFormatter =
    mode === "daily"
      ? (value) => {
          try {
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return value;
            return d.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            });
          } catch {
            return value;
          }
        }
      : (v) => v;

  const formatNumberTick = (v) =>
    v >= 1000 ? `${Math.round(v / 1000)}k` : v;

  // ringkasan statistik berdasarkan data harian (total, max, avg per hari)
  const stats = dailyData.length
    ? dailyData.reduce(
        (acc, d) => {
          const qty = Number(d.total_qty || 0);
          acc.total += qty;
          acc.max = Math.max(acc.max, qty);
          return acc;
        },
        { total: 0, max: 0 }
      )
    : { total: 0, max: 0 };

  const avgPerDay = dailyData.length
    ? stats.total / dailyData.length
    : 0;

  const chartWidth =
    mode === "daily"
      ? Math.max(900, chartData.length * 4)
      : 720;
  const barSize = mode === "daily" ? 5 : 18;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Total Qty (All Dates)
          </h1>
          <p className="text-sm text-slate-500">
            Detail tren kuantitas penjualan dari{" "}
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

      {/* CARD CHART */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Trend Penjualan
            </p>
            <p className="text-sm text-slate-600">
              {mode === "daily"
                ? "Total OrderQty per hari (berdasarkan dimensi time)."
                : "Total OrderQty per bulan (diringkas dari dimensi time)."}
            </p>
          </div>

          {/* Toggle mode Harian/Bulanan */}
          <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
            <button
              onClick={() => setMode("daily")}
              className={`px-3 py-1 rounded-full transition ${
                mode === "daily"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setMode("monthly")}
              className={`px-3 py-1 rounded-full transition ${
                mode === "monthly"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Bulanan
            </button>
          </div>
        </div>

        {/* Ringkasan mini */}
        {!loading && !error && dailyData.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-500">Total Qty</p>
              <p className="font-semibold text-slate-800">
                {stats.total.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-500">Rata-rata / hari</p>
              <p className="font-semibold text-slate-800">
                {Math.round(avgPerDay).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-500">Qty tertinggi (harian)</p>
              <p className="font-semibold text-slate-800">
                {stats.max.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <p className="text-xs text-slate-700 mt-2">Memuat data…</p>
        )}

        {!loading && error && (
          <p className="text-xs text-rose-500 mt-2">{error}</p>
        )}

        {!loading && !error && chartData.length > 0 && (
          <div className="w-full overflow-x-auto">
            <BarChart
              width={chartWidth}
              height={280}
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 35 }}
            >
              <defs>
                <linearGradient id="qtyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis
                dataKey={xKey}
                tickFormatter={xFormatter}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                minTickGap={mode === "daily" ? 25 : 10}
              />
              <YAxis
                tickFormatter={formatNumberTick}
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />

              {mode === "daily" && avgPerDay > 0 && (
                <ReferenceLine
                  y={avgPerDay}
                  stroke="#a5b4fc"
                  strokeDasharray="3 3"
                  label={{
                    value: "",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "#6b7280",
                  }}
                />
              )}

              <ReTooltip
                formatter={(value) =>
                  Number(value).toLocaleString("id-ID")
                }
                labelFormatter={(label) =>
                  mode === "daily" ? xFormatter(label) : label
                }
              />

              <Bar
                dataKey="total_qty"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                barSize={barSize}
              />
            </BarChart>
          </div>
        )}

        {!loading && !error && chartData.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">
            Tidak ada data untuk ditampilkan.
          </p>
        )}
      </div>
    </div>
  );
}
