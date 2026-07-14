"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Square, Sparkles, HelpCircle } from "lucide-react";

const QUICK_TEXTS = [
  "Tampilkan total sales berdasarkan kategori produk",
  "Bandingkan kuantitas produksi di berbagai lokasi",
  "Siapa 5 customer dengan pembelian terbesar?",
  "Bagaimana tren penjualan bulanan selama tahun 2011?",
  "Tampilkan 5 produk dengan biaya produksi tertinggi"
];

const MONTH_NAMES = {
  "1": "Januari", "2": "Februari", "3": "Maret", "4": "April",
  "5": "Mei", "6": "Juni", "7": "Juli", "8": "Agustus",
  "9": "September", "10": "Oktober", "11": "November", "12": "Desember"
};

export default function AIReport() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [controller, setController] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Daftar warna untuk Pie/Bar Chart
  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  // Hitung jika label sumbu X perlu dimiringkan
  const chartData = report?.chartData;
  const needsAngle = chartData && (
    chartData.length > 6 ||
    chartData.some(d => String(d.name || '').length > 10)
  );
  const xAxisAngle = needsAngle ? -15 : 0;
  const xAxisTextAnchor = needsAngle ? "end" : "middle";

  // Margin dinamis untuk mencegah label sumbu X (kiri/bawah) terpotong
  const chartMargin = {
    top: 15,
    right: 15,
    left: needsAngle ? 15 : 5,
    bottom: needsAngle ? 40 : 5
  };

  const formatChartData = (data) => {
    if (!data) return null;

    // Cek apakah data ini bulanan (semua name adalah angka 1-12)
    const isMonthly = data.every(item => {
      const num = parseInt(item.name, 10);
      return !isNaN(num) && num >= 1 && num <= 12;
    });

    let processed = [...data];

    if (isMonthly) {
      // Urutkan berdasarkan angka bulan secara kronologis (1-12)
      processed.sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10));
      // Ubah angka bulan menjadi nama bulan
      processed = processed.map(item => ({
        ...item,
        name: MONTH_NAMES[item.name] || item.name
      }));
    }

    return processed;
  };

  const handleSend = async (customInput) => {
    const textToSend = typeof customInput === "string" ? customInput : input;
    if (!textToSend.trim()) return;

    setLoading(true);
    setReport(null); // Reset report lama saat memuat yang baru
    setApiError(null); // Reset error alert lama
    const abortController = new AbortController();
    setController(abortController);
    setInput("");

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
        signal: abortController.signal
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses permintaan AI.");
      }

      setReport({
        query: textToSend,
        reply: data.reply,
        chartData: formatChartData(data.chartData) || null,
        chartType: data.chartType || "bar",
        hasChart: !!(data.chartData && data.chartData.length > 0)
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        setReport({
          query: textToSend,
          reply: "*Analisis dibatalkan oleh pengguna.*",
          hasChart: false
        });
      } else {
        setApiError(err.message || "Maaf, gagal terhubung ke API Server. Pastikan server backend sudah aktif.");
      }
    } finally {
      setLoading(false);
      setController(null);
    }
  };

  const handleStop = () => {
    if (controller) {
      controller.abort();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Analytics</h1>
        <p className="text-sm text-slate-500">
          Analisis data warehouse Adventureworks secara cerdas dan interaktif dengan dukungan AI.
        </p>
      </div>

      {/* Alert Error */}
      {apiError && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in duration-300">
          <div className="bg-rose-100 p-1.5 rounded-lg text-rose-600 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-sm">Layanan AI Mengalami Kendala</h5>
          </div>
          <button
            onClick={() => setApiError(null)}
            className="text-rose-400 hover:text-rose-600 shrink-0 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input Area di Atas */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="flex gap-3 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pertanyaan atau instruksi analisis data warehouse di sini..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="flex-1 px-4 h-12 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-900 font-medium placeholder:text-slate-400 disabled:bg-slate-50 transition-all text-sm"
          />
          <div className="shrink-0">
            {loading ? (
              <button
                onClick={handleStop}
                type="button"
                className="w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors shadow-md shadow-rose-100 flex items-center justify-center"
                title="Hentikan Analisis"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-100 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Text / Rekomendasi Pertanyaan */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Rekomendasi:
          </span>
          {QUICK_TEXTS.map((text, idx) => (
            <button
              key={idx}
              onClick={() => setInput(text)}
              disabled={loading}
              className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-1.5 rounded-full transition-all border border-slate-200/60 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Area Laporan di Bawah */}
      {loading && !report ? (
        /* Loading Skeleton Split-Layout */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[400px] flex flex-col justify-between animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">
            {/* Kiri: Skeleton Grafik */}
            <div className="lg:col-span-7 bg-slate-50/50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[350px]">
              <div className="flex justify-between items-center mb-4">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
              <div className="flex-1 flex items-end justify-around gap-2 px-4">
                <div className="w-8 bg-slate-200 rounded-t h-[40%]"></div>
                <div className="w-8 bg-slate-200 rounded-t h-[60%]"></div>
                <div className="w-8 bg-slate-200 rounded-t h-[85%]"></div>
                <div className="w-8 bg-slate-200 rounded-t h-[50%]"></div>
                <div className="w-8 bg-slate-200 rounded-t h-[70%]"></div>
              </div>
            </div>
            {/* Kanan: Skeleton Insight */}
            <div className="lg:col-span-5 flex flex-col justify-between lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 space-y-4">
              <div>
                <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-11/12"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-100 rounded w-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                AI sedang merumuskan insight analisis...
              </div>
            </div>
          </div>
        </div>
      ) : report ? (
        /* Kotak Tunggal Hasil Laporan */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 min-h-[400px] flex flex-col justify-between">
          {report.hasChart && report.chartData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Kiri: Grafik */}
              <div className="lg:col-span-7 bg-slate-50/50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[350px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">Visualisasi Grafik</span>
                    </div>
                  </div>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {report.chartType === "pie" ? (
                        <PieChart>
                          <Pie
                            data={report.chartData}
                            dataKey="sales"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={{ fontSize: 9, fontWeight: 600 }}
                          >
                            {report.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#0f172a', fontWeight: '600' }}
                            formatter={(value) => value.toLocaleString('id-ID')}
                          />
                          <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
                        </PieChart>
                      ) : report.chartType === "line" ? (
                        <LineChart data={report.chartData} margin={chartMargin}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="name"
                            fontSize={9}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b' }}
                            interval={0}
                            angle={xAxisAngle}
                            textAnchor={xAxisTextAnchor}
                            padding={{ left: 10, right: 10 }}
                          />
                          <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => value.toLocaleString('id-ID')} />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#0f172a', fontWeight: '600' }}
                            formatter={(value) => value.toLocaleString('id-ID')}
                          />
                          <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 6 }} />
                        </LineChart>
                      ) : (
                        <BarChart data={report.chartData} margin={chartMargin}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                            dataKey="name"
                            fontSize={9}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b' }}
                            interval={0}
                            angle={xAxisAngle}
                            textAnchor={xAxisTextAnchor}
                          />
                          <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => value.toLocaleString('id-ID')} />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#0f172a', fontWeight: '600' }}
                            formatter={(value) => value.toLocaleString('id-ID')}
                          />
                          <Bar
                            dataKey="sales"
                            fill="#2563eb"
                            radius={[4, 4, 0, 0]}
                            barSize={28}
                          >
                            {report.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Kanan: Insight */}
              <div className="lg:col-span-5 flex flex-col justify-between lg:pl-6 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">Analisis & Insight AI</span>
                  </div>
                  {/* Judul Query diletakkan di bawah judul Analisis & Insight AI */}
                  <h3 className="text-sm font-bold text-slate-800 mb-4 leading-snug bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{report.query}"
                  </h3>
                  <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed overflow-y-auto max-h-[280px] pr-1
                    [&_p]:text-[13.5px]
                    [&_li]:text-[13.5px] [&_li]:my-0.5 [&_li]:leading-snug
                    [&_ul]:my-2 [&_ul]:space-y-1 [&_ul]:pl-4
                    [&_ul>li]:relative [&_ul>li]:pl-3
                    [&_ul>li::before]:content-['•'] [&_ul>li::before]:absolute [&_ul>li::before]:left-0 [&_ul>li::before]:top-0 [&_ul>li::before]:text-slate-700 [&_ul>li::before]:font-bold [&_ul>li::before]:text-[12px] [&_ul>li::before]:mt-[1px]
                    [&_strong]:text-slate-800 [&_strong]:font-semibold
                    [&_th]:text-[13px] [&_td]:text-[13px] [&_table]:text-[13px]
                    [&_h3]:text-[14px] [&_h4]:text-[14px]
                  ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {report.reply}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Layout Tanpa Grafik */
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">Hasil Analisis</span>
                  <h4 className="text-sm font-semibold text-slate-700 mt-0.5">"{report.query}"</h4>
                </div>
                <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed
                  [&_p]:text-[13.5px]
                  [&_li]:text-[13.5px] [&_li]:my-0.5 [&_li]:leading-snug
                  [&_ul]:my-2 [&_ul]:space-y-1 [&_ul]:pl-4
                  [&_ul>li]:relative [&_ul>li]:pl-3
                  [&_ul>li::before]:content-['•'] [&_ul>li::before]:absolute [&_ul>li::before]:left-0 [&_ul>li::before]:top-0 [&_ul>li::before]:text-slate-700 [&_ul>li::before]:font-bold [&_ul>li::before]:text-[12px] [&_ul>li::before]:mt-[1px]
                  [&_strong]:text-slate-800 [&_strong]:font-semibold
                  [&_th]:text-[13px] [&_td]:text-[13px] [&_table]:text-[13px]
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {report.reply}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tampilan Awal (Kosong) */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[350px]">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-700">Belum ada analisis yang dibuat</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              Gunakan kolom input di atas atau klik salah satu rekomendasi pertanyaan untuk mulai menganalisis data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}