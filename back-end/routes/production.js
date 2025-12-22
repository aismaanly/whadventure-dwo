const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. BY LOCATION (Dukungan Top N + Other)
router.get("/by-location", async (req, res) => {
  const topN = Number(req.query.top) || 0; 

  try {
    const [rows] = await db.query(`
      SELECT 
        l.name AS location,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp
      JOIN location l ON fp.location_key = l.location_id
      GROUP BY l.location_id, l.name
      ORDER BY total_stock DESC
    `);

    if (!topN || rows.length <= topN) {
      return res.json(rows);
    }

    const top = rows.slice(0, topN);
    const others = rows.slice(topN);

    const otherRow = {
      location: "Other",
      total_stock: others.reduce((sum, r) => sum + Number(r.total_stock || 0), 0),
      total_scrap: others.reduce((sum, r) => sum + Number(r.total_scrap || 0), 0),
      __other: true,
    };

    return res.json([...top, otherRow]);
  } catch (err) {
    console.error("Error /by-location:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. DAFTAR LOKASI DALAM "OTHER"
router.get("/by-location-other", async (req, res) => {
  const topN = Number(req.query.top) || 10;

  try {
    const [rows] = await db.query(`
      SELECT 
        l.name AS location,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp
      JOIN location l ON fp.location_key = l.location_id
      GROUP BY l.location_id, l.name
      ORDER BY total_stock DESC
    `);

    if (rows.length <= topN) return res.json([]);
    return res.json(rows.slice(topN));
  } catch (err) {
    console.error("Error /by-location-other:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. BY LOCATION DETAIL
router.get("/by-location-detail", async (req, res) => {
  const { location, top } = req.query;
  if (!location) return res.status(400).json({ error: "location parameter is required" });

  const topN = Number(top) || 0;

  try {
    const [rows] = await db.query(`
      SELECT 
        p.category,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp
      JOIN product p  ON fp.product_key  = p.product_id
      JOIN location l ON fp.location_key = l.location_id
      WHERE l.name = ?
        AND p.category IS NOT NULL
      GROUP BY p.category
      ORDER BY total_stock DESC
    `, [location]);

    const result = topN && rows.length > topN ? rows.slice(0, topN) : rows;
    res.json(result);
  } catch (err) {
    console.error("Error /by-location-detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. BY CATEGORY OVERVIEW
router.get("/by-category", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.category,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp 
      JOIN product p ON fp.product_key = p.product_id
      WHERE p.category IS NOT NULL
      GROUP BY p.category
      ORDER BY total_stock DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error /by-category:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 5. BY CATEGORY DETAIL (Top N + Other)
router.get("/by-category-detail", async (req, res) => {
  const { category, top } = req.query;
  const topN = Number(top) || 0;

  if (!category) return res.status(400).json({ error: "category parameter is required" });

  try {
    const [rows] = await db.query(`
      SELECT 
        p.name AS product_name,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp
      JOIN product p ON fp.product_key = p.product_id
      WHERE p.category = ?
      GROUP BY p.product_id, p.name
      ORDER BY total_stock DESC
    `, [category]);

    if (!topN || rows.length <= topN) {
      return res.json(rows);
    }

    const topRows = rows.slice(0, topN);
    const otherRows = rows.slice(topN);

    const otherRow = {
      product_name: "Other",
      total_stock: otherRows.reduce((sum, r) => sum + Number(r.total_stock || 0), 0),
      total_scrap: otherRows.reduce((sum, r) => sum + Number(r.total_scrap || 0), 0),
      __other: true,
    };

    return res.json([...topRows, otherRow]);
  } catch (err) {
    console.error("Error /by-category-detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 6. DAFTAR PRODUK DALAM "OTHER" KATEGORI
router.get("/by-category-other", async (req, res) => {
  const { category, top } = req.query;
  const topN = Number(top) || 10;

  if (!category) return res.status(400).json({ error: "category parameter is required" });

  try {
    const [rows] = await db.query(`
      SELECT 
        p.name AS product_name,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp
      JOIN product p ON fp.product_key = p.product_id
      WHERE p.category = ?
      GROUP BY p.product_id, p.name
      ORDER BY total_stock DESC
    `, [category]);

    if (rows.length <= topN) return res.json([]);
    return res.json(rows.slice(topN));
  } catch (err) {
    console.error("Error /by-category-other:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 7. BY DATE
router.get("/by-date", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.fulldates AS date,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp
      JOIN time t ON fp.time_key = t.time_id
      GROUP BY t.fulldates
      ORDER BY t.fulldates
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error /by-date:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;