"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SalesByCategoryPie from "./salesByPie";
import SalesTrendChart from "./salesTrendChart";
import TopProductsCard from "./topProductChart";
import CountryCitiesSection from "./countryCities";

const BASE_URL = "http://localhost:4000";

export default function FactSalesPage() {
  const [byCategory, setByCategory] = useState([]);
  const [byDate, setByDate] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [byCountry, setByCountry] = useState([]);
  const [topCities, setTopCities] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //Load kategori (pie chart) sekali di awal
  useEffect(() => {
    fetch(`${BASE_URL}/api/sales/by-category`)
      .then((res) => res.json())
      .then(setByCategory)
      .catch((err) => {
        console.error(err);
        setByCategory([]);
      });
  }, []);

  // Load data yang bergantung kategori by-date, top-products, by-country
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const encCat = selectedCategory
          ? encodeURIComponent(selectedCategory)
          : null;

        const byDateUrl = encCat
          ? `${BASE_URL}/api/sales/by-date?category=${encCat}`
          : `${BASE_URL}/api/sales/by-date`;

        const topProductsUrl = encCat
          ? `${BASE_URL}/api/sales/top-products?category=${encCat}&limit=10`
          : `${BASE_URL}/api/sales/top-products?limit=10`;

        const byCountryUrl = encCat
          ? `${BASE_URL}/api/sales/by-country?category=${encCat}`
          : `${BASE_URL}/api/sales/by-country`;

        const [byDateRes, topProdRes, byCountryRes] = await Promise.all([
          fetch(byDateUrl),
          fetch(topProductsUrl),
          fetch(byCountryUrl),
        ]);

        if (!byDateRes.ok || !topProdRes.ok || !byCountryRes.ok) {
          throw new Error("Server mengembalikan status error.");
        }

        const [byDateJson, topProductsJson, byCountryJson] = await Promise.all([
          byDateRes.json(),
          topProdRes.json(),
          byCountryRes.json(),
        ]);

        setByDate(byDateJson);
        setTopProducts(topProductsJson);
        setByCountry(byCountryJson);

        // jika selectedCountry sekarang tidak ada di hasil baru, pilih yg pertama
        if (
          !selectedCountry ||
          !byCountryJson.some((c) => c.country === selectedCountry)
        ) {
          setSelectedCountry(byCountryJson[0]?.country || null);
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data dashboard.");
        setByDate([]);
        setTopProducts([]);
        setByCountry([]);
        setTopCities([]);
        setSelectedCountry(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedCategory, selectedCountry]);

  useEffect(() => {
    if (!selectedCountry) {
      setTopCities([]);
      return;
    }

    const loadCities = async () => {
      try {
        const encCountry = encodeURIComponent(selectedCountry);
        const encCat = selectedCategory
          ? encodeURIComponent(selectedCategory)
          : null;

        const url =
          `${BASE_URL}/api/sales/top-cities?country=${encCountry}&limit=6` +
          (encCat ? `&category=${encCat}` : "");

        const res = await fetch(url);
        if (!res.ok) throw new Error("Server error");
        const json = await res.json();
        setTopCities(json);
      } catch (err) {
        console.error(err);
        setTopCities([]);
      }
    };

    loadCities();
  }, [selectedCountry, selectedCategory]);

  // ====== overview card yang ada duatas sendiri ======
  const totalQty = byDate.reduce(
    (sum, row) => sum + Number(row.total_qty || 0),
    0
  );

  const totalOrders = topProducts.reduce(
    (sum, row) => sum + Number(row.total_qty || 0),
    0
  );

  const totalCategories = byCategory.length;
  const totalCountries = byCountry.length;

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">
            Fact Sales Overview
          </h1>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Store</span>
          </div>
        </div>
      </div>

      {/* card atas sendiri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <Link href="/dashboard/fact-sales/total-qty">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                TOTAL QTY (FILTERED)
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {totalQty.toLocaleString("id-ID")}
              </p>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Diakumulasikan dari seluruh baris faktur penjualan
              {selectedCategory && (
                <>
                  {" "}
                  pada kategori{" "}
                  <span className="font-semibold">{selectedCategory}</span>.
                </>
              )}
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 text-white flex flex-col justify-between">
          <Link href="/dashboard/fact-sales/top-products">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-900">
                TOTAL ORDER QTY (TOP 10)
                {selectedCategory ? ` – ${selectedCategory}` : ""}
              </p>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {totalOrders.toLocaleString("id-ID")}
              </p>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Akumulasi kuantitas dari 10 produk terlaris
              {selectedCategory && (
                <>
                  {" "}
                  pada kategori{" "}
                  <span className="font-semibold">{selectedCategory}</span>.
                </>
              )}
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            JUMLAH KATEGORI
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {totalCategories}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Kategori produk yang terlibat dalam transaksi penjualan.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            NEGARA TERDAFTAR
            {selectedCategory ? ` – ${selectedCategory}` : ""}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {totalCountries}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Negara tujuan pengiriman berdasarkan dimensi address.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error} (cek konsol untuk detail error).
        </p>
      )}

      {/* TREND + PIE CATEGORY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <SalesTrendChart
            byDate={byDate}
            selectedCategory={selectedCategory}
          />
        </div>

        <SalesByCategoryPie
          byCategory={byCategory}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* BOTTOM: TOP PRODUCTS + COUNTRY & CITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsCard
          topProducts={topProducts}
          selectedCategory={selectedCategory}
        />

        <CountryCitiesSection
          byCountry={byCountry}
          topCities={topCities}
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
          selectedCategory={selectedCategory}
        />
      </div>
    </div>
  );
}
