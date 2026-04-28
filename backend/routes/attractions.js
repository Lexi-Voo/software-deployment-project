const express = require("express");
const router = express.Router();
const { fetchAttractions } = require("../services/serpService");

// GET /api/attractions?city=Paris
router.get("/", async (req, res) => {
  const { city } = req.query;

  if (!city || !city.trim()) {
    return res.status(400).json({ error: "city query param is required" });
  }

  try {
    const attractions = await fetchAttractions(city.trim());
    return res.json(attractions);
  } catch (err) {
    console.error("[/api/attractions]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;