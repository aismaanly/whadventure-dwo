"use client";

import { useMemo } from "react";

export default function TopCustomersTable({ 
  topCustomers, 
  selectedCategory, 
  selectedSubcategory,
  selectedCountry,
  selectedProvince,
  selectedYear,
  selectedMonth,
  viewMode = "qty"
}) {
  const data = useMemo(() => {
    return (topCustomers || [])
      .map((item) => ({
        account: item.AccountNumber || "Unknown",
        type: item.Type === "S" ? "Store" : item.Type === "I" ? "Individual" : "Unknown",
        revenue: Number(item.total_revenue || 0),
        qty: Number(item.total_qty || 0),
      }))
      .sort((a, b) => viewMode === "revenue" ? b.revenue - a.revenue : b.qty - a.qty);
  }, [topCustomers, viewMode]);

  const formatRevenue = (value) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };
  const formatQty = (value) => Number(value).toLocaleString("id-ID");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col h-full border border-slate-50">
      <div className="w-full mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
          TOP 10 VIP CUSTOMERS
          {selectedYear ? ` – ${selectedYear}` : ""}
          {selectedMonth ? ` – ${selectedMonth}` : ""}
          {selectedCategory ? ` – ${selectedCategory}` : ""}
          {selectedSubcategory ? ` > ${selectedSubcategory}` : ""}
          {selectedCountry ? ` – ${selectedCountry}` : ""}
          {selectedProvince ? ` > ${selectedProvince}` : ""}
        </p>
        <p className="text-xs text-slate-400">
          Pelanggan dengan {viewMode === "revenue" ? "nilai belanja (revenue)" : "volume belanja"} tertinggi.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-400 border-b border-slate-100">
            <tr>
              <th className="pb-2 font-medium">Account Number</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium text-right">
                {viewMode === "revenue" ? "Revenue" : "Order Qty"}
              </th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            {data.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-4 text-center text-slate-400">
                  Tidak ada data pelanggan.
                </td>
              </tr>
            ) : (
              data.map((c, i) => (
                <tr key={c.account} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="py-2.5 font-medium flex items-center gap-2">
                    <span className="text-slate-300 w-4 text-right">{i + 1}.</span>
                    {c.account}
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      c.type === "Store" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    {viewMode === "revenue" ? formatRevenue(c.revenue) : formatQty(c.qty)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
