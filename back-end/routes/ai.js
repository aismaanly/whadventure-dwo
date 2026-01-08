const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db");

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // Definisi skema lengkap dengan instruksi relasi yang lebih detail
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
    
    Relasi Penting: 
    - sales_fact.time_key = time.time_id
    - sales_fact.product_key = product.product_id
    - sales_fact.address_key = address.address_id
    - sales_fact.customer_key = customer.customer_id
    - production_fact.time_key = time.time_id
    - production_fact.location_key = location.location_id
    `;

    /* --- TAHAP 1: GENERASI QUERY SQL --- */
    const sqlGeneration = await axios.post(process.env.OLLAMA_URL, {
      model: process.env.AI_MODEL,
      prompt: `Berdasarkan skema database: ${schemaInfo}
      Tugas: Ubah pertanyaan user "${message}" menjadi query SQL MySQL yang valid.
      
      Aturan WAJIB:
      1. Berikan HANYA query SQL, tanpa penjelasan, tanpa Markdown code blocks, tanpa teks pembuka.
      2. Gunakan alias 'name' untuk kolom kategori/label (sumbu X).
      3. Gunakan alias 'sales' untuk kolom angka/metrik (sumbu Y).
      4. Jika menanyakan tren waktu, gunakan t.months atau t.years.
      5. Contoh format: SELECT p.category AS name, SUM(s.LineTotal) AS sales FROM sales_fact s JOIN product p ON s.product_key = p.product_id GROUP BY p.category`,
      stream: false
    });

    // Membersihkan hasil dari karakter non-SQL (Backticks, narasi, dll)
    let potentialSql = sqlGeneration.data.response.trim();
    potentialSql = potentialSql
      .replace(/```sql/ig, "")
      .replace(/```/g, "")
      .replace(/--.*$/gm, "") // Hapus komentar SQL
      .replace(/\n/g, " ")    // Jadikan satu baris
      .replace(/;$/, "");     // Hapus titik koma di akhir

    // Validasi apakah string mengandung SELECT
    const isQuery = potentialSql.toLowerCase().includes("select");
    
    let chartData = null;
    let dbError = null;

    if (isQuery) {
      try {
        console.log("Executing SQL:", potentialSql); // Log untuk debug di terminal
        const [rows] = await db.query(potentialSql);
        
        if (rows && rows.length > 0) {
          chartData = rows.map(r => {
            // Ambil kunci pertama untuk label, kunci kedua untuk nilai jika alias gagal
            const keys = Object.keys(r);
            return {
              name: String(r.name || r[keys[0]]),
              sales: parseFloat(r.sales || r[keys[1]] || 0)
            };
          });
        }
      } catch (err) {
        console.error("Database Error:", err.message);
        dbError = err.message;
      }
    }

    /* --- TAHAP 2: GENERASI NARASI JAWABAN --- */
    const narasiPrompt = chartData 
      ? `Data dari database: ${JSON.stringify(chartData)}. 
         Pertanyaan user: "${message}". 
         Tugas: Berikan jawaban yang ramah sebagai asisten Smart Reporting. 
         Sajikan data tersebut dalam bentuk tabel Markdown yang rapi. 
         Berikan 2 poin insight singkat dari data tersebut. 
         DILARANG menampilkan query SQL.`
      : `Pertanyaan user: "${message}". 
         Tugas: Jika ini sapaan, balas dengan ramah. 
         Jika ini pertanyaan data, katakan data tidak ditemukan atau terjadi error pada query. 
         Status Error: ${dbError || "Tidak ada data"}.`;

    const finalAnalysis = await axios.post(process.env.OLLAMA_URL, {
      model: process.env.AI_MODEL,
      prompt: narasiPrompt,
      stream: false
    });

    /* --- TAHAP 3: PENENTUAN TIPE CHART --- */
    const msgLower = message.toLowerCase();
    let chartType = "bar"; // Default
    if (
      msgLower.includes("persen") || 
      msgLower.includes("porsi") || 
      msgLower.includes("banding") || 
      msgLower.includes("kategori") ||
      (chartData && chartData.length <= 5)
    ) {
      chartType = "pie";
    }

    res.json({
      reply: finalAnalysis.data.response,
      chartData: chartData,
      chartType: chartType,
      hasChart: !!(chartData && chartData.length > 0),
      debugSql: potentialSql // Opsional: kirim ke FE untuk debugging
    });

  } catch (error) {
    console.error("AI ROUTE ERROR:", error);
    res.status(500).json({ error: "Gagal memproses permintaan AI" });
  }
});

module.exports = router;