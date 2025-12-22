// ENDPOINT BUAT FAC SALES

const express = require("express");
const router = express.Router();
const db = require("../db");

// by category
router.get("/by-category", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.category,
        SUM(fs.OrderQty) AS total_qty
      FROM sales_fact fs
      JOIN product p ON fs.product_key = p.product_id
      GROUP BY p.category
      ORDER BY total_qty DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error /sales/by-category:", error);
    res.status(500).json({ error: error.message });
  }
});

// top product
router.get("/top-products", async (req, res) => {
  const { category, limit } = req.query;
  const topN = Number(limit) || 10;

  try {
    const [rows] = await db.query(
      `
        SELECT 
          p.product_id,
          p.name,
          p.category,
          SUM(fs.OrderQty) AS total_qty
        FROM sales_fact fs
        JOIN product p ON fs.product_key = p.product_id 
        WHERE (? IS NULL OR p.category = ?)
        GROUP BY p.product_id, p.name, p.category
        ORDER BY total_qty DESC
        LIMIT ?    
        `,
      [category || null, category || null, topN]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error /top-products:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

// by country
router.get("/by-country", async (req, res) => {
  const { category } = req.query;

  try {
    const [rows] = await db.query(
      `
        SELECT
          a.country,
          SUM(fs.OrderQty) AS total_qty
        FROM sales_fact fs
        JOIN address a ON fs.address_key = a.address_id 
        JOIN product p ON fs.product_key = p.product_id 
        WHERE (? IS NULL OR p.category = ?)
        GROUP BY a.country
        ORDER BY total_qty DESC
      `,
      [category || null, category || null]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error /by-country:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

// top cities
router.get("/top-cities", async (req, res) => {
  const { country, limit, category } = req.query;
  const topN = Number(limit) || 10;

  if (!country) {
    return res.status(400).json({ error: "Country parameter is required" });
  }

  try {
    const [rows] = await db.query(
      `
        SELECT
          a.city,
          SUM(fs.OrderQty) AS total_qty
        FROM sales_fact fs
        JOIN address a ON fs.address_key = a.address_id 
        JOIN product p ON fs.product_key = p.product_id 
        WHERE a.country = ?
          AND (? IS NULL OR p.category = ?)
        GROUP BY a.city
        ORDER BY total_qty DESC
        LIMIT ?
      `,
      [country, category || null, category || null, topN]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error /top-cities:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

// by date
router.get("/by-date", async (req, res) => {
  const { category } = req.query;

  try {
    const [rows] = await db.query(
      `
        SELECT
          t.fulldates AS date,
          SUM(fs.OrderQty) AS total_qty
        FROM sales_fact fs
        JOIN time t ON fs.time_key = t.time_id 
        JOIN product p ON fs.product_key = p.product_id 
        WHERE (? IS NULL OR p.category = ?)
        GROUP BY t.fulldates
        ORDER BY t.fulldates
      `,
      [category || null, category || null]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error /by-date:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

module.exports = router;

// cek endpoint
// http://localhost:4000/api/sales/by-category
// http://localhost:4000/api/sales/top-products
// http://localhost:4000/api/sales/by-country
// http://localhost:4000/api/sales/top-cities?country=United%20States&limit=10
// http://localhost:4000/api/sales/by-date
