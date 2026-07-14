"use client";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { ChevronLeft } from "lucide-react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SalesTrendChart({ 
  byDate, 
  selectedCategory, 
  selectedSubcategory,
  selectedCountry,
  selectedProvince,
  selectedYear,
  selectedMonth,
  onSelectYear,
  onSelectMonth,
  viewMode = "qty"
}) {
  const chartData = useMemo(() => {
    return (byDate || []).map((row) => {
      let label = row.date;

      // Formatting label based on drilldown level
      if (selectedYear && selectedMonth) {
        // Daily level - row.date is full date string
        const d = new Date(row.date);
        label = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
      } else if (selectedYear && !selectedMonth) {
        // Monthly level - row.date is month number like "01", "05"
        const mIdx = parseInt(row.date, 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          label = MONTH_NAMES[mIdx];
        }
      } 
      // Else Yearly level - row.date is year string like "2011", keep as is

      return {
        ...row,
        label,
        value: viewMode === "revenue" ? Number(row.total_revenue || 0) : Number(row.total_qty || 0),
        rawDate: row.date
      };
    });
  }, [byDate, viewMode, selectedYear, selectedMonth]);

  const formatNumberTick = (value) => {
    if (viewMode === "revenue") {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
      return `$${value}`;
    }
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value;
  };

  const formatTooltip = (value) => {
    if (viewMode === "revenue") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
    }
    return Number(value).toLocaleString("id-ID");
  };

  const handleBarClick = (data) => {
    if (!data || !data.rawDate) return;
    
    if (!selectedYear) {
      onSelectYear(data.rawDate);
    } else if (!selectedMonth) {
      onSelectMonth(data.rawDate);
    }
  };

  const handleBack = () => {
    if (selectedMonth) {
      onSelectMonth(null);
    } else if (selectedYear) {
      onSelectYear(null);
    }
  };

  const isDaily = selectedYear && selectedMonth;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 h-full flex flex-col border border-slate-50">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
          {(selectedYear) && (
            <button 
              onClick={handleBack}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              title="Kembali ke level sebelumnya"
            >
              <ChevronLeft size={14} className="text-slate-400 hover:text-indigo-600" />
            </button>
          )}
          SALES TREND
          {selectedYear ? ` – ${selectedYear}` : ""}
          {selectedMonth ? ` – ${MONTH_NAMES[parseInt(selectedMonth)-1]}` : ""}
          {selectedCategory ? ` – ${selectedCategory}` : ""}
          {selectedSubcategory ? ` > ${selectedSubcategory}` : ""}
          {selectedCountry ? ` – ${selectedCountry}` : ""}
          {selectedProvince ? ` > ${selectedProvince}` : ""}
        </p>
      </div>
      
      <p className="text-xs text-slate-400 mb-4">
        Grafik tren {viewMode === "revenue" ? "pendapatan" : "volume penjualan"} {isDaily ? "harian" : (selectedYear ? "bulanan" : "tahunan")}
        {(!isDaily) && ". Klik batang grafik untuk melihat lebih detail."}
      </p>

      {chartData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
           <p className="text-xs text-slate-400">Tidak ada data tren.</p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-[260px] text-xs relative">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              {isDaily ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#6b7280" }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatNumberTick} 
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <ReTooltip
                    formatter={(value) => formatTooltip(value)}
                    labelFormatter={(label) => label}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#6366f1" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#6b7280" }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatNumberTick} 
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <ReTooltip
                    formatter={(value) => formatTooltip(value)}
                    labelFormatter={(label) => label}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    onClick={handleBarClick}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#6366f1" />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
