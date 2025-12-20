const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/summary", async (req, res) => {
  try {
    const { prodCat, salesCat } = req.query;

    // --- 1. QUERY PRODUCTION ---
    // Menggunakan fp.product_key = p.product_id sesuai production.js kamu
    let prodQuery = `
      SELECT 
        IFNULL(SUM(fp.OrderQty), 0) as total_order_qty, 
        IFNULL(SUM(fp.StockedQty), 0) as total_stocked_qty, 
        IFNULL(SUM(fp.ScrappedQty), 0) as total_scrapped_qty, 
        IFNULL(ROUND(SUM(fp.ProductionCost), 2), 0) as total_production_cost 
      FROM production_fact fp
      JOIN product p ON fp.product_key = p.product_id
    `;
    
    if (prodCat && prodCat !== 'All') {
      prodQuery += ` WHERE p.category = ${db.escape(prodCat)}`;
    }

    // --- 2. QUERY SALES ---
    // Menggunakan fs.product_key = p.product_id sesuai sales.js kamu
    let salesQuery = `
      SELECT 
        IFNULL(SUM(fs.OrderQty), 0) as total_order_qty, 
        IFNULL(ROUND(SUM(fs.LineTotal), 2), 0) as total_incomes 
      FROM sales_fact fs
      JOIN product p ON fs.product_key = p.product_id
    `;

    if (salesCat && salesCat !== 'All') {
      salesQuery += ` WHERE p.category = ${db.escape(salesCat)}`;
    }

    // Eksekusi query
    const [prodRows] = await db.query(prodQuery);
    const [salesRows] = await db.query(salesQuery);

    res.json({
      production: prodRows[0],
      sales: salesRows[0]
    });

  } catch (error) {
    console.error("ERROR BACKEND HOME:", error);
    res.status(500).json({ 
      error: "Gagal mengambil data", 
      message: error.sqlMessage || error.message 
    });
  }
});

module.exports = router;