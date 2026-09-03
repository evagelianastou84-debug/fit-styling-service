const MAX_COMBOS_PER_SHAPE = 12;

function buildCandidates(products, maxPrice) {
  const tops = products.filter((p) => p.category === "top");
  const bottoms = products.filter((p) => p.category === "bottom");
  const shoes = products.filter((p) => p.category === "shoes");
  const dresses = products.filter((p) => p.category === "dress");

  const candidates = [];

  outer: for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const items = [top, bottom, shoe];
        const priceTotal = items.reduce((sum, it) => sum + it.price_amount, 0);
        if (maxPrice && priceTotal > maxPrice) continue;
        candidates.push({ items, priceTotal });
        if (candidates.length >= MAX_COMBOS_PER_SHAPE) break outer;
      }
    }
  }

  let dressCount = 0;
  for (const dress of dresses) {
    for (const shoe of shoes) {
      const items = [dress, shoe];
      const priceTotal = items.reduce((sum, it) => sum + it.price_amount, 0);
      if (maxPrice && priceTotal > maxPrice) continue;
      candidates.push({ items, priceTotal });
      dressCount += 1;
      if (dressCount >= MAX_COMBOS_PER_SHAPE) break;
    }
  }

  return candidates;
}

export { buildCandidates };
