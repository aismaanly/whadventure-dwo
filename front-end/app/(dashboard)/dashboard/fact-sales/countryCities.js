"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
} from "recharts";

export default function CountryCitiesSection({
  byCountry,
  topCities,
  selectedCountry,
  onSelectCountry,
  selectedCategory,
}) {
  const sortedCountries = [...byCountry].sort(
    (a, b) => Number(b.total_qty || 0) - Number(a.total_qty || 0)
  );
  const topCountries = sortedCountries.slice(0, 8);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col h-fit">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
        COUNTRY & CITIES
        {selectedCategory ? ` – ${selectedCategory}` : " – All Categories"}
      </p>
      <p className="text-sm text-slate-600 mb-3">
        Pilih negara untuk melihat kota dengan penjualan tertinggi{" "}
        {selectedCategory && (
          <>
            pada kategori{" "}
            <span className="font-semibold">{selectedCategory}</span>.
          </>
        )}
      </p>

      {/* TOP COUNTRIES */}
      <div className="mb-3">
        <p className="text-[11px] text-slate-500 mb-1 font-semibold uppercase">
          Top Countries
        </p>
        <div className="flex flex-wrap gap-2">
          {topCountries.map((c) => (
            <button
              key={`top-${c.country}`}
              onClick={() => onSelectCountry(c.country)}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                selectedCountry === c.country
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {c.country} ({Number(c.total_qty).toLocaleString("id-ID")})
            </button>
          ))}
        </div>
      </div>

      {/* DROPDOWN SEMUA NEGARA */}
      <div className="mb-3">
        <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
          Semua Negara
        </label>
        <select
          value={selectedCountry || ""}
          onChange={(e) => onSelectCountry(e.target.value)}
          className="w-full text-xs border text-slate-700 border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
        >
          {sortedCountries.map((c) => (
            <option key={c.country} value={c.country}>
              {c.country} ({Number(c.total_qty).toLocaleString("id-ID")})
            </option>
          ))}
        </select>
      </div>

      {/* CHART TOP CITIES */}
      <div className="w-full flex justify-center text-xs">
        <BarChart
          width={520}
          height={230}
          data={topCities}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="city"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={0}
            textAnchor="middle"
          />
          <YAxis />
          <ReTooltip
            formatter={(value) => Number(value).toLocaleString("id-ID")}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="total_qty" fill="#0ea5e9" />
        </BarChart>
      </div>
    </div>
  );
}
