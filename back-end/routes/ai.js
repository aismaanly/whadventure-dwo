const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db");

const MONTH_NAMES = {
  "1": "Januari", "2": "Februari", "3": "Maret", "4": "April",
  "5": "Mei", "6": "Juni", "7": "Juli", "8": "Agustus",
  "9": "September", "10": "Oktober", "11": "November", "12": "Desember"
};

// Helper function to call Groq API with failover models in case of rate limits
async function callGroqWithFallback(payload, headers) {
  const models = [
    process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "llama-3.2-3b-preview",
    "llama-3.2-1b-preview",
    "deepseek-r1-distill-llama-70b"
  ];

  const uniqueModels = Array.from(new Set(models));
  let lastError = null;

  for (const model of uniqueModels) {
    try {
      console.log(`[Groq Failover] Trying model: ${model}`);
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        { ...payload, model: model },
        { headers }
      );
      console.log(`[Groq Failover] Success with model: ${model}`);
      return response;
    } catch (error) {
      const errStatus = error.response?.status;
      const errDataStr = JSON.stringify(error.response?.data || "").toLowerCase();
      
      // Deteksi jika model terkena rate limit, dinonaktifkan (decommissioned), atau tidak didukung
      const shouldFallback = 
        errStatus === 429 || 
        errStatus === 400 || 
        errStatus === 404 ||
        errDataStr.includes("rate_limit_exceeded") ||
        errDataStr.includes("decommissioned") ||
        errDataStr.includes("no longer supported") ||
        errDataStr.includes("not found");
      
      if (shouldFallback) {
        console.warn(`[Groq Failover] Model ${model} failed (status: ${errStatus || 'unknown'}). Error: ${error.message}. Trying next candidate...`);
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!groqApiKey) {
    console.error("AI ROUTE ERROR: GROQ_API_KEY is not configured.");
    return res.status(500).json({ error: "GROQ_API_KEY belum dikonfigurasi di file .env" });
  }

  try {
    const schemaInfo = `
    Database: whadventure
    
    Tabel Dimensi:
    - product (product_id, name, subcategory, category)
    - time (time_id, years, months, dates, fulldates, days)
    - location (location_id, name)
    - address (address_id, city, province, country, street)
    - customer (customer_id, AccountNumber, territory, Type)
    - shipping_method (shippingMethod_id, name)
    
    Tabel Fakta:
    - sales_fact (time_key, product_key, shippingMethod_key, customer_key, address_key, OrderQty, LineTotal)
    - production_fact (time_key, location_key, product_key, StockedQty, ScrappedQty, OrderQty, productionCost)
    
    Relasi (Foreign Key):
    - sales_fact.time_key = time.time_id
    - sales_fact.product_key = product.product_id
    - sales_fact.shippingMethod_key = shipping_method.shippingMethod_id
    - sales_fact.customer_key = customer.customer_id
    - sales_fact.address_key = address.address_id
    - production_fact.time_key = time.time_id
    - production_fact.location_key = location.location_id
    - production_fact.product_key = product.product_id
    `;

    /* --- TAHAP 1: GENERASI QUERY SQL & CHART TYPE --- */
    const sqlGeneration = await callGroqWithFallback({
      messages: [
        {
          role: "user",
          content: `Berdasarkan skema database: ${schemaInfo}
          Tugas: Ubah pertanyaan user "${message}" menjadi query SQL MySQL yang valid, tentukan jenis grafik yang cocok, dan tentukan label kolom yang tepat.
          
          Aturan WAJIB:
          1. Jika pertanyaan user di luar konteks database warehouse AdventureWorks (Sales dan Production), atau tidak dapat dijawab menggunakan skema tabel di atas, atau merupakan pertanyaan umum di luar topik perusahaan (seperti tokoh politik, presiden, cuaca, walikota, dll), JANGAN hasilkan query SQL. Cukup jawab dengan kata persis: OUT_OF_CONTEXT.
          2. Jika pertanyaan sesuai konteks, berikan HANYA query SQL pada baris pertama, tanpa penjelasan, tanpa Markdown code blocks, tanpa teks pembuka.
          3. Gunakan alias 'name' untuk kolom kategori/label (sumbu X).
          4. Gunakan alias 'sales' untuk kolom angka/metrik (sumbu Y).
          5. Jika menanyakan tren waktu, gunakan t.months atau t.years.
          6. Tentukan jenis grafik yang paling cocok ('bar', 'pie', atau 'line') pada baris kedua dengan format persis: CHART_TYPE: tipe.
             - Gunakan 'line' jika menanyakan tren waktu, analisis dari waktu ke waktu, pertumbuhan bulanan/tahunan.
             - Gunakan 'pie' jika membandingkan kontribusi/proporsi (perbandingan kategori kecil <= 5).
             - Gunakan 'bar' jika membandingkan nilai antar kategori diskrit atau banyak kategori (> 5).
          7. Tentukan label metrik (kolom angka) dalam bahasa Indonesia pada baris ketiga: METRIC_LABEL: label.
             - productionCost → METRIC_LABEL: Biaya Produksi
             - StockedQty → METRIC_LABEL: Kuantitas Produksi
             - ScrappedQty → METRIC_LABEL: Kuantitas Scrap
             - OrderQty dari sales_fact → METRIC_LABEL: Kuantitas Penjualan
             - LineTotal → METRIC_LABEL: Total Penjualan
          8. Tentukan label kolom kategori (kolom nama/label) dalam bahasa Indonesia pada baris keempat: NAME_LABEL: label.
             - Jika kolom 'name' berasal dari tabel location → NAME_LABEL: Nama Lokasi
             - Jika kolom 'name' berasal dari tabel product → NAME_LABEL: Nama Produk
             - Jika kolom berasal dari product.category → NAME_LABEL: Kategori
             - Jika kolom berasal dari product.subcategory → NAME_LABEL: Subkategori
             - Jika kolom berasal dari address.country → NAME_LABEL: Negara
             - Jika kolom berasal dari address.city → NAME_LABEL: Kota
             - Jika kolom berasal dari customer.AccountNumber atau customer → NAME_LABEL: Customer
             - Jika kolom berasal dari time.months → NAME_LABEL: Bulan
             - Jika kolom berasal dari time.years → NAME_LABEL: Tahun
             - Jika kolom berasal dari shipping_method → NAME_LABEL: Metode Pengiriman
             
          Contoh format output untuk pertanyaan sesuai konteks:
          SELECT l.name AS name, SUM(pf.StockedQty) AS sales FROM production_fact pf JOIN location l ON pf.location_key = l.location_id GROUP BY l.name ORDER BY sales DESC
          CHART_TYPE: bar
          METRIC_LABEL: Kuantitas Produksi
          NAME_LABEL: Nama Lokasi`
        }
      ],
      temperature: 0.1
    }, {
      "Authorization": `Bearer ${groqApiKey}`,
      "Content-Type": "application/json"
    });

    let rawOutput = sqlGeneration.data.choices[0].message.content.trim();
    
    let isOutOfContext = rawOutput.toUpperCase().includes("OUT_OF_CONTEXT");
    let chartType = "bar";
    let metricLabel = "Nilai";
    let nameLabel = "Nama";
    let potentialSql = "";

    if (!isOutOfContext) {
      const lines = rawOutput.split("\n");
      for (let line of lines) {
        const cleanLine = line.trim();
        if (cleanLine.toUpperCase().startsWith("CHART_TYPE:")) {
          const match = cleanLine.match(/CHART_TYPE:\s*(bar|pie|line)/i);
          if (match) chartType = match[1].toLowerCase();
        } else if (cleanLine.toUpperCase().startsWith("METRIC_LABEL:")) {
          metricLabel = cleanLine.replace(/METRIC_LABEL:/i, "").trim();
        } else if (cleanLine.toUpperCase().startsWith("NAME_LABEL:")) {
          nameLabel = cleanLine.replace(/NAME_LABEL:/i, "").trim();
        } else if (cleanLine && !cleanLine.startsWith("`") && !cleanLine.startsWith("-")) {
          potentialSql += " " + cleanLine;
        }
      }

      potentialSql = potentialSql.trim();
      
      // Ekstraksi SQL yang aman (jika masih terbungkus markdown)
      const sqlMatch = potentialSql.match(/```sql([\s\S]*?)```/i) || potentialSql.match(/```([\s\S]*?)```/);
      if (sqlMatch) {
        potentialSql = sqlMatch[1].trim();
      }
      
      potentialSql = potentialSql
        .replace(/--.*$/gm, "") // Hapus komentar SQL
        .replace(/\n/g, " ")    // Jadikan satu baris
        .trim();

      // Ambil mulai dari SELECT jika ada teks pembuka di luar markdown
      const selectIdx = potentialSql.toUpperCase().indexOf("SELECT");
      if (selectIdx !== -1) {
        potentialSql = potentialSql.substring(selectIdx);
      }
      
      // Hapus titik koma di akhir jika ada
      potentialSql = potentialSql.replace(/;$/, "").trim();
    }

    // Validasi apakah string mengandung SELECT
    const isQuery = !isOutOfContext && potentialSql.toLowerCase().includes("select");
    
    let chartData = null;
    let dbError = null;

    if (isQuery) {
      try {
        console.log("Executing SQL:", potentialSql);
        console.log("Chart Type:", chartType, "| Metric Label:", metricLabel);
        const [rows] = await db.query(potentialSql);
        
        if (rows && rows.length > 0) {
          let mappedRows = rows.map(r => {
            const keys = Object.keys(r);
            return {
              name: String(r.name || r[keys[0]]),
              sales: Math.round(parseFloat(r.sales || r[keys[1]] || 0))
            };
          });

          const isMonthly = mappedRows.every(item => {
            const num = parseInt(item.name, 10);
            return !isNaN(num) && num >= 1 && num <= 12;
          });

          if (isMonthly) {
            mappedRows.sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10));
            mappedRows = mappedRows.map(item => ({
              ...item,
              name: MONTH_NAMES[item.name] || item.name
            }));
          }

          chartData = mappedRows;
        }
      } catch (err) {
        console.error("Database Error:", err.message);
        dbError = err.message;
      }
    }

    /* --- TAHAP 2: GENERASI NARASI JAWABAN --- */
    let narasiPrompt = "";
    if (isOutOfContext) {
      narasiPrompt = `Pertanyaan user: "${message}". 
         Tugas: Beritahu pengguna dengan sangat sopan dan ramah bahwa Anda adalah asisten khusus untuk database warehouse AdventureWorks (domain Sales dan Production). Katakan bahwa Anda tidak dapat menjawab pertanyaan umum atau di luar konteks bisnis perusahaan tersebut.
         DILARANG keras menuliskan kalimat pembuka basa-basi seperti "Berikut adalah jawaban..." atau "Sebagai asisten...". Langsung jawab inti penolakannya secara sopan.`;
    } else {
      narasiPrompt = chartData 
        ? `Data dari database: ${JSON.stringify(chartData)}. 
           Pertanyaan user: "${message}". 
           Label kolom pertama (kategori/nama): "${nameLabel}"
           Label kolom kedua (metrik/angka): "${metricLabel}"
           Tugas: Berikan analisis data sebagai asisten Smart Reporting yang langsung dan to-the-point.
           
           Aturan WAJIB:
           1. DILARANG keras menuliskan kalimat pembuka basa-basi atau meta-penjelasan (seperti "Halo!", "Saya dengan senang hati membantu...", atau "Berikut adalah tabel yang menampilkan...").
           2. Langsung mulai dengan kalimat pengantar yang tepat, contoh: "Berikut adalah data [topik] dalam bentuk tabel:" lalu tampilkan tabelnya.
           3. DILARANG menuliskan kata "Markdown". Cukup sebutkan "tabel".
           4. Semua angka numerik di tabel WAJIB diformat dengan pemisah ribuan titik (format Indonesia), contoh: 7.670.721.
           5. Header kolom tabel WAJIB menggunakan label yang tepat: kolom pertama (kategori) gunakan "${nameLabel}", kolom kedua (angka) gunakan "${metricLabel}". JANGAN gunakan 'name', 'sales', atau 'penjualan' sebagai header kolom.
           6. Setelah tabel, tampilkan dua bagian secara berurutan:
              - **Temuan:** (2 hingga 4 poin temuan menarik, dalam bullet list, gunakan **bold** untuk kata kunci penting.)
              - **Rekomendasi:** (2 hingga 3 saran tindakan bisnis konkret, dalam bullet list, gunakan **bold** untuk kata kerja tindakan.)
              JANGAN mengawali dengan kalimat meta seperti "Berikut adalah dua insight:". Langsung gunakan judul bold tersebut.
           7. DILARANG menampilkan query SQL.`
        : `Pertanyaan user: "${message}". 
           Tugas: Jika ini sapaan, balas dengan ramah. 
           Jika ini pertanyaan data, katakan data tidak ditemukan atau terjadi error pada query. 
           Status Error: ${dbError || "Tidak ada data"}.`;
    }

    const finalAnalysis = await callGroqWithFallback({
      messages: [
        {
          role: "user",
          content: narasiPrompt
        }
      ],
      temperature: 0.7
    }, {
      "Authorization": `Bearer ${groqApiKey}`,
      "Content-Type": "application/json"
    });

    let reply = finalAnalysis.data.choices[0].message.content;

    // Proteksi ekstra: Hapus kata "Markdown" secara paksa dari respons AI jika masih lolos
    reply = reply
      .replace(/tabel Markdown/gi, "tabel")
      .replace(/format Markdown/gi, "tabel")
      .replace(/Markdown/gi, "");

    res.json({
      reply: reply,
      chartData: chartData,
      chartType: chartType,
      hasChart: !!(chartData && chartData.length > 0),
      debugSql: potentialSql // Opsional: kirim ke FE untuk debugging
    });

  } catch (error) {
    console.error("AI ROUTE ERROR:", error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.error?.message || error.message || "Gagal memproses permintaan AI dengan Groq";
    res.status(500).json({ error: errorMessage });
  }
});

module.exports = router;