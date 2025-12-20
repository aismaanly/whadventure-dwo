const express = require("express");
const router = express.Router();
const db = require("../db");

// by location
router.get("/by-location", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.name AS location,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp -- Perubahan nama tabel
      JOIN location l ON fp.location_key = l.location_id -- Perubahan join key
      GROUP BY l.location_id, l.name
      ORDER BY total_stock DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error /by-location:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// by-location-detail
router.get("/by-location-detail", async (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: "location parameter is required" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.category,
        SUM(fp.StockedQty) AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp -- Perubahan nama tabel
      JOIN product p  ON fp.product_key  = p.product_id -- Perubahan join key
      JOIN location l ON fp.location_key = l.location_id -- Perubahan join key
      WHERE l.name = ?
        AND p.category IS NOT NULL
      GROUP BY p.category
      ORDER BY total_stock DESC
    `,
      [location]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error /by-location-detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// by category
router.get("/by-category", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.category,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp -- Perubahan nama tabel
      JOIN product p ON fp.product_key = p.product_id -- Perubahan join key
      WHERE p.category IS NOT NULL
      GROUP BY p.category
      ORDER BY total_stock DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error /by-category (production):", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// by category detail
router.get("/by-category-detail", async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ error: "category parameter is required" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.name AS product_name,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp -- Perubahan nama tabel
      JOIN product p ON fp.product_key = p.product_id -- Perubahan join key
      WHERE p.category = ?
      GROUP BY p.product_id, p.name
      ORDER BY total_stock DESC
    `,
      [category]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error /by-category-detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// by-date
router.get("/by-date", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.fulldates AS date,
        SUM(fp.StockedQty)  AS total_stock,
        SUM(fp.ScrappedQty) AS total_scrap
      FROM production_fact fp -- Perubahan nama tabel
      JOIN time t ON fp.time_key = t.time_id -- Perubahan join key
      GROUP BY t.fulldates
      ORDER BY t.fulldates
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error /by-date (production):", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;