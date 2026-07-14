"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SalesByCategoryPie from "./salesByPie";
import SalesTrendChart from "./salesTrendChart";
import TopProductsCard from "./topProductChart";
import GeographyChart from "./countryCities"; // Note: file is still countryCities.js but we export GeographyChart
import CustomerTypeChart from "./customerTypeChart";
import ShippingMethodChart from "./shippingMethodChart";
import TopCustomersTable from "./topCustomersTable";
import TerritoryChart from "./territoryChart";

const BASE_URL = "http://localhost:4000";

export default function FactSalesPage() {
  // Category states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  
  // Geography states
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);

  // Time states
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // UI state
  const [viewMode, setViewMode] = useState("qty"); // "qty" | "revenue"

  // Data states
  const [byCategory, setByCategory] = useState([]);
  const [byGeography, setByGeography] = useState([]);
  const [byDate, setByDate] = useState([]);
  const [byTerritory, setByTerritory] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [byCustomerType, setByCustomerType] = useState([]);
  const [byShippingMethod, setByShippingMethod] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to build query string
  const buildQuery = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
    if (selectedCountry) params.append("country", selectedCountry);
    if (selectedProvince) params.append("province", selectedProvince);
    if (selectedYear) params.append("year", selectedYear);
    if (selectedMonth) params.append("month", selectedMonth);
    return params.toString();
  };

  // Unified data loader
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const queryStr = `?${buildQuery()}`;
        const limitStr = queryStr + "&limit=10";

        const endpoints = [
          fetch(`${BASE_URL}/api/sales/by-category${queryStr}`),
          fetch(`${BASE_URL}/api/sales/by-geography${limitStr}`),
          fetch(`${BASE_URL}/api/sales/by-date${queryStr}`),
          fetch(`${BASE_URL}/api/sales/by-territory${queryStr}`),
          fetch(`${BASE_URL}/api/sales/top-products${limitStr}`),
          fetch(`${BASE_URL}/api/sales/by-customer-type${queryStr}`),
          fetch(`${BASE_URL}/api/sales/by-shipping-method${queryStr}`),
          fetch(`${BASE_URL}/api/sales/top-customers${limitStr}`),
        ];

        const responses = await Promise.all(endpoints);

        if (responses.some((res) => !res.ok)) {
          throw new Error("Server mengembalikan status error.");
        }

        const data = await Promise.all(responses.map((res) => res.json()));

        setByCategory(data[0]);
        setByGeography(data[1]);
        setByDate(data[2]);
        setByTerritory(data[3]);
        setTopProducts(data[4]);
        setByCustomerType(data[5]);
        setByShippingMethod(data[6]);
        setTopCustomers(data[7]);

        // Smart reset for geography if current selection is no longer valid
        if (selectedCountry && !data[1].some(c => c.location === selectedCountry || selectedProvince)) {
          // If we are at country level and it disappeared, reset. But if we are at province level, data[1] returns cities.
          // To be safe and simple, we rely on the user to back out if they hit an empty state, 
          // or we can just leave it as is to avoid complex reset logic that might backfire.
        }

      } catch (err) {
        console.error(err);
        setError("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedCategory, selectedSubcategory, selectedCountry, selectedProvince, selectedYear, selectedMonth]);

  // metrics (we can derive totalQty and totalRevenue from byDate since it always contains the filtered sum)
  const totalQty = byDate.reduce((sum, row) => sum + Number(row.total_qty || 0), 0);
  const totalRevenue = byDate.reduce((sum, row) => sum + Number(row.total_revenue || 0), 0);
  const totalCategories = byCategory.length;
  const totalGeoNodes = byGeography.length;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Sales Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analisis komprehensif data transaksi penjualan, performa produk, dan wilayah pelanggan.
          </p>
        </div>
        
        {/* VIEW MODE TOGGLE */}
        <div className="bg-white rounded-lg p-1 border border-slate-100 flex items-center shadow-sm">
          <button 
            onClick={() => setViewMode("qty")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === "qty" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Volume (Qty)
          </button>
          <button 
            onClick={() => setViewMode("revenue")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === "revenue" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Pendapatan (Revenue)
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              TOTAL QTY (FILTERED)
            </p>
            <p className="mt-3 text-3xl font-black text-indigo-600">
              {totalQty.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              TOTAL REVENUE (FILTERED)
            </p>
            <p className="mt-3 text-3xl font-black text-emerald-600">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalRevenue)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {selectedCategory ? "SUBCATEGORIES" : "CATEGORIES"}
            </p>
            <p className="mt-3 text-3xl font-black text-amber-500">
              {totalCategories}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {selectedCountry && selectedProvince ? "CITIES" : (selectedCountry ? "PROVINCES" : "COUNTRIES")}
            </p>
            <p className="mt-3 text-3xl font-black text-rose-500">
              {totalGeoNodes}
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS LAYER 1 */}
      <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="xl:col-span-1">
          <SalesByCategoryPie
            byCategory={byCategory}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={setSelectedCategory}
            onSelectSubcategory={setSelectedSubcategory}
            viewMode={viewMode}
          />
        </div>
        <div className="xl:col-span-2">
          <SalesTrendChart
            byDate={byDate}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedCountry={selectedCountry}
            selectedProvince={selectedProvince}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onSelectYear={setSelectedYear}
            onSelectMonth={setSelectedMonth}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* CHARTS LAYER 2 */}
      <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="xl:col-span-1">
          <GeographyChart
            byGeography={byGeography}
            selectedCountry={selectedCountry}
            selectedProvince={selectedProvince}
            onSelectCountry={setSelectedCountry}
            onSelectProvince={setSelectedProvince}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            viewMode={viewMode}
          />
        </div>
        <div className="xl:col-span-2">
          <TopProductsCard
            topProducts={topProducts}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedCountry={selectedCountry}
            selectedProvince={selectedProvince}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* CHARTS LAYER 3 */}
      <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="xl:col-span-1">
          <TerritoryChart 
            byTerritory={byTerritory}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedCountry={selectedCountry}
            selectedProvince={selectedProvince}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            viewMode={viewMode}
          />
        </div>
        <div className="xl:col-span-1">
          <CustomerTypeChart
            byCustomerType={byCustomerType}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedCountry={selectedCountry}
            selectedProvince={selectedProvince}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            viewMode={viewMode}
          />
        </div>
        <div className="xl:col-span-1">
          <ShippingMethodChart 
            byShippingMethod={byShippingMethod}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            selectedCountry={selectedCountry}
            selectedProvince={selectedProvince}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* CHARTS LAYER 4 */}
      <div className={`grid grid-cols-1 gap-6 pb-10 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        <TopCustomersTable 
          topCustomers={topCustomers}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          selectedCountry={selectedCountry}
          selectedProvince={selectedProvince}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
}
