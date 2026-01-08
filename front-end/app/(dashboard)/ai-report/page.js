"use client";
import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIReport() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  // Daftar warna untuk Pie Chart agar setiap irisan berbeda warna
  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const handleSend = async () => {
    if (!input) return;
    setLoading(true);
    
    const userMessage = { role: "user", content: input };
    setChat((prev) => [...prev, userMessage]);

    try {
      const res = await fetch(process.env.NEXT_PUBLIC_AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      setChat((prev) => [...prev, { 
        role: "ai", 
        content: data.reply,
        chartData: data.chartData || null,
        // Ambil chartType dari backend (bar atau pie), default ke bar
        chartType: data.chartType || "bar", 
        hasChart: !!(data.chartData && data.chartData.length > 0) 
      }]);
    } catch (err) {
      setChat((prev) => [...prev, { role: "ai", content: "Maaf, gagal terhubung ke Ollama. Pastikan server Ollama sudah aktif." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Smart Reporting</h1>
        <p className="text-sm text-slate-500">
          Tanyakan apapun tentang database warehouse Adventureworks. AI akan membantu menganalisis secara instan.
        </p>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 flex flex-col h-[600px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                 </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">Belum ada percakapan.<br/>Cobalah ketik: "Tampilkan tren penjualan tahun 2011"</p>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-4 shadow-sm ${
                msg.role === "user" 
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-none" 
                : "bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-100"
              }`}>
                <div className="prose prose-sm max-w-none text-inherit">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                
                {msg.hasChart && msg.chartData && (
                  <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {msg.chartType === "pie" ? (
                        <PieChart>
                          <Pie
                            data={msg.chartData}
                            dataKey="sales"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={{ fontSize: 10 }}
                          >
                            {msg.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      ) : (
                        <BarChart data={msg.chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar 
                            dataKey="sales" 
                            fill="#2563eb" 
                            radius={[4, 4, 0, 0]} 
                            barSize={30} 
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                </div>
                <span className="text-xs text-slate-400 font-medium italic">Ollama sedang menganalisis...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik instruksi laporan di sini..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="flex-1 p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 font-medium placeholder:text-slate-400 disabled:bg-slate-50 transition-all"
          />
          <button 
            onClick={handleSend} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 rounded-xl font-bold transition-colors shadow-md shadow-blue-200 flex items-center justify-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "KIRIM"}
          </button>
        </div>
      </div>
    </div>
  );
}