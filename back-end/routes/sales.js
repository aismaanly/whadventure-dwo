// ENDPOINT BUAT FAC SALES

const express = require("express");
const router = express.Router();
const db = require("../db");

// Helper for common filters (to keep code clean)
const getCommonFilters = () => `
  (? IS NULL OR p.category = ?)
  AND (? IS NULL OR p.subcategory = ?)
  AND (? IS NULL OR a.country = ?)
  AND (? IS NULL OR a.province = ?)
  AND (? IS NULL OR t.years = ?)
  AND (? IS NULL OR t.months = ?)
`;

const getCommonParams = (q) => [
  q.category || null, q.category || null,
  q.subcategory || null, q.subcategory || null,
  q.country || null, q.country || null,
  q.province || null, q.province || null,
  q.year || null, q.year || null,
  q.month || null, q.month || null
];

// by category (if category is provided, group by subcategory)
router.get("/by-category", async (req, res) => {
  try {
    const groupBy = req.query.category ? "p.subcategory" : "p.category";
    const selectField = req.query.category ? "p.subcategory AS category" : "p.category";

    const [rows] = await db.query(
      `
        SELECT 
          ${selectField},
          SUM(fs.OrderQty) AS total_qty,
          SUM(fs.LineTotal) AS total_revenue
        FROM sales_fact fs
        JOIN product p ON fs.product_key = p.product_id
        JOIN address a ON fs.address_key = a.address_id
        JOIN time t ON fs.time_key = t.time_id
        WHERE ${getCommonFilters()}
        GROUP BY ${groupBy}
        ORDER BY total_qty DESC
      `,
      getCommonParams(req.query)
    );
    res.json(rows);
  } catch (error) {
    console.error("Error /by-category:", error);
    res.status(500).json({ error: error.message });
  }
});

// top product
router.get("/top-products", async (req, res) => {
  const topN = Number(req.query.limit) || 10;
  try {
    const [rows] = await db.query(
      `
        SELECT 
          p.product_id,
          p.name,
          p.category,
          p.subcategory,
          SUM(fs.OrderQty) AS total_qty,
          SUM(fs.LineTotal) AS total_revenue
        FROM sales_fact fs
        JOIN product p ON fs.product_key = p.product_id 
        JOIN address a ON fs.address_key = a.address_id
        JOIN time t ON fs.time_key = t.time_id
        WHERE ${getCommonFilters()}
        GROUP BY p.product_id, p.name, p.category, p.subcategory
        ORDER BY total_qty DESC
        LIMIT ?    
        `,
      [...getCommonParams(req.query), topN]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error /top-products:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

// by geography (replaces by-country and top-cities)
router.get("/by-geography", async (req, res) => {
  const { country, province, limit } = req.query;
  const topN = Number(limit) || 10;

  try {
    let groupBy = "a.country";
    let selectField = "a.country AS location";
    
    if (country && !province) {
      groupBy = "a.province";
      selectField = "a.province AS location";
    } else if (country && province) {
      groupBy = "a.city";
      selectField = "a.city AS location";
    }

    const query = `
      SELECT
        ${selectField},
        SUM(fs.OrderQty) AS total_qty,
        SUM(fs.LineTotal) AS total_revenue
      FROM sales_fact fs
      JOIN address a ON fs.address_key = a.address_id 
      JOIN product p ON fs.product_key = p.product_id 
      JOIN time t ON fs.time_key = t.time_id
      WHERE ${getCommonFilters()}
      GROUP BY ${groupBy}
      ORDER BY total_qty DESC
      ${(country && province) ? 'LIMIT ?' : ''}
    `;

    const params = [...getCommonParams(req.query)];
    if (country && province) params.push(topN);

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error /by-geography:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

// by date
router.get("/by-date", async (req, res) => {
  const { year, month } = req.query;
  try {
    let groupBy = "t.years";
    let selectField = "t.years AS date";
    let orderBy = "t.years";
    
    if (year && !month) {
      groupBy = "t.months";
      selectField = "t.months AS date";
      orderBy = "t.months";
    } else if (year && month) {
      groupBy = "t.fulldates";
      selectField = "t.fulldates AS date";
      orderBy = "t.fulldates";
    }

    const [rows] = await db.query(
      `
        SELECT
          ${selectField},
          SUM(fs.OrderQty) AS total_qty,
          SUM(fs.LineTotal) AS total_revenue
        FROM sales_fact fs
        JOIN time t ON fs.time_key = t.time_id 
        JOIN product p ON fs.product_key = p.product_id 
        JOIN address a ON fs.address_key = a.address_id
        WHERE ${getCommonFilters()}
        GROUP BY ${groupBy}
        ORDER BY ${orderBy}
      `,
      getCommonParams(req.query)
    );
    res.json(rows);
  } catch (error) {
    console.error("Error /by-date:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

// by territory
router.get("/by-territory", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        SELECT
          c.territory,
          SUM(fs.OrderQty) AS total_qty,
          SUM(fs.LineTotal) AS total_revenue
        FROM sales_fact fs
        JOIN customer c ON fs.customer_key = c.customer_id
        JOIN product p ON fs.product_key = p.product_id 
        JOIN address a ON fs.address_key = a.address_id
        JOIN time t ON fs.time_key = t.time_id
        WHERE ${getCommonFilters()}
        GROUP BY c.territory
        ORDER BY total_qty DESC
      `,
      getCommonParams(req.query)
    );
    res.json(rows);
  } catch (error) {
    console.error("Error /by-territory:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

// by customer type
router.get("/by-customer-type", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        SELECT
          c.Type,
          SUM(fs.OrderQty) AS total_qty,
          SUM(fs.LineTotal) AS total_revenue
        FROM sales_fact fs
        JOIN customer c ON fs.customer_key = c.customer_id 
        JOIN product p ON fs.product_key = p.product_id 
        JOIN address a ON fs.address_key = a.address_id
        JOIN time t ON fs.time_key = t.time_id
        WHERE ${getCommonFilters()}
        GROUP BY c.Type
      `,
      getCommonParams(req.query)
    );
    res.json(rows);
  } catch (error) {
    console.error("Error /by-customer-type:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

// by shipping method
router.get("/by-shipping-method", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
        SELECT
          sm.name,
          SUM(fs.OrderQty) AS total_qty,
          SUM(fs.LineTotal) AS total_revenue
        FROM sales_fact fs
        JOIN shipping_method sm ON fs.shippingMethod_key = sm.shippingMethod_id
        JOIN product p ON fs.product_key = p.product_id 
        JOIN address a ON fs.address_key = a.address_id
        JOIN time t ON fs.time_key = t.time_id
        WHERE ${getCommonFilters()}
        GROUP BY sm.name
        ORDER BY total_qty DESC
      `,
      getCommonParams(req.query)
    );
    res.json(rows);
  } catch (error) {
    console.error("Error /by-shipping-method:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

// top customers
router.get("/top-customers", async (req, res) => {
  const topN = Number(req.query.limit) || 10;
  try {
    const [rows] = await db.query(
      `
        SELECT
          c.AccountNumber,
          c.Type,
          SUM(fs.OrderQty) AS total_qty,
          SUM(fs.LineTotal) AS total_revenue
        FROM sales_fact fs
        JOIN customer c ON fs.customer_key = c.customer_id
        JOIN product p ON fs.product_key = p.product_id 
        JOIN address a ON fs.address_key = a.address_id
        JOIN time t ON fs.time_key = t.time_id
        WHERE ${getCommonFilters()}
        GROUP BY c.customer_id, c.AccountNumber, c.Type
        ORDER BY total_revenue DESC
        LIMIT ?
      `,
      [...getCommonParams(req.query), topN]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error /top-customers:", error);
    res.status(500).json({ error: "DB ERROR" });
  }
});

module.exports = router;
