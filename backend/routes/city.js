const express = require("express");
const router = express.Router();
const { fetchCityInfo } = require("../services/cityService");

// GET /api/city?name=Paris
router.get("/", async (req, res) => {
  const { name } = req.query;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "name query param is required" });
  }

  try {
    const info = await fetchCityInfo(name.trim());
    return res.json(info);
  } catch (err) {
    console.error("[/api/city]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;