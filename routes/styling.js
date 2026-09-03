import { Router } from "express";
import fetch from "node-fetch";
import { buildCandidates } from "../models/candidates.js";
import { scoreOutfit } from "../models/scoring.js";

const router = Router();
const CATALOG_URL = process.env.CATALOG_URL || "https://fit-catalog-service.onrender.com";

router.post("/recommend-outfits", async (req, res) => {
  const { body_type, occasion, season, budget_eur } = req.body || {};

  if (!body_type) {
    return res.status(400).json({ error: "body_type is required" });
  }

  const params = new URLSearchParams();
  if (occasion) params.set("occasion", String(occasion).toLowerCase());
  if (season) params.set("season", String(season).toLowerCase());

  let products;
  try {
    const catalogRes = await fetch(`${CATALOG_URL}/products?${params.toString()}`);
    if (!catalogRes.ok) throw new Error(`Catalog Service returned ${catalogRes.status}`);
    const catalogData = await catalogRes.json();
    products = catalogData.products;
  } catch (err) {
    return res.status(502).json({ error: `Could not reach Catalog Service: ${err.message}` });
  }

  const candidates = buildCandidates(products, budget_eur);

  if (candidates.length === 0) {
    return res.json({ outfits: [], message: "No outfits found for this combination of occasion/season/budget." });
  }

  const scored = candidates
    .map((c) => {
      const { score, reasons } = scoreOutfit(body_type, c.items);
      return { ...c, score, reasons };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  const midIndex = Math.floor(scored.length / 2);
  const mid = scored[midIndex] || scored[Math.min(1, scored.length - 1)];
  const cheapestOfTopHalf = [...scored]
    .slice(0, Math.max(1, Math.ceil(scored.length / 2)))
    .sort((a, b) => a.priceTotal - b.priceTotal)[0];

  const picks = [
    { label: "Safe", combo: cheapestOfTopHalf },
    { label: "Balanced", combo: mid },
    { label: "Statement", combo: top },
  ].filter((p, idx, arr) => arr.findIndex((x) => x.combo.items.map((i) => i.id).join() === p.combo.items.map((i) => i.id).join()) === idx);

  const outfits = picks.map((p, i) => ({
    label: p.label,
    number: String(i + 1).padStart(2, "0"),
    items: p.combo.items,
    priceTotal: Math.round(p.combo.priceTotal * 100) / 100,
    currency: p.combo.items[0]?.price_currency || "EUR",
    score: Math.round(p.combo.score * 10) / 10,
    why: p.combo.reasons.length
      ? p.combo.reasons.join("; ")
      : `A solid pick for ${occasion || "this occasion"}.`,
  }));

  res.json({ outfits, body_type, candidates_considered: candidates.length });
});

export default router;
