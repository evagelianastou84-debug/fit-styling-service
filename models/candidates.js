const MAX_COMBOS_PER_SHAPE = 12;

function buildCandidates(products, maxPrice) {
  const tops = products.filter((p) => p.category === "top");
  const bottoms = products.filter((p) => p.category === "bottom");
  const shoes = products.filter((p) => p.category === "shoes");
  const dresses = products.filter((p) => p.category === "dress");

  const candidates = [];

  const topBottomCombos = [];
  outer: for (const top of tops) {
    for (const bottom of bottoms) {
      topBottomCombos.push([top, bottom]);
      if (topBottomCombos.length >= MAX_COMBOS_PER_SHAPE) break outer;
    }
  }

  for (const base of topBottomCombos) {
    if (shoes.length > 0) {
      for (const shoe of shoes) {
        const items = [...base, shoe];
        const priceTotal = items.reduce((sum, it) => sum + it.price_amount, 0);
        if (maxPrice && priceTotal > maxPrice) continue;
        candidates.push({ items, priceTotal });
      }
    } else {
      const priceTotal = base.reduce((sum, it) => sum + it.price_amount, 0);
      if (!maxPrice || priceTotal <= maxPrice) {
        candidates.push({ items: base, priceTotal });
      }
    }
  }

  let dressCount = 0;
  for (const dress of dresses) {
    if (shoes.length > 0) {
      for (const shoe of shoes) {
        const items = [dress, shoe];
        const priceTotal = items.reduce((sum, it) => sum + it.price_amount, 0);
        if (maxPrice && priceTotal > maxPrice) continue;
        candidates.push({ items, priceTotal });
        dressCount += 1;
        if (dressCount >= MAX_COMBOS_PER_SHAPE) break;
      }
    } else {
      const priceTotal = dress.price_amount;
      if (!maxPrice || priceTotal <= maxPrice) {
        candidates.push({ items: [dress], priceTotal });
        dressCount += 1;
      }
      if (dressCount >= MAX_COMBOS_PER_SHAPE) break;
    }
  }

  return candidates;
}

export { buildCandidates };
