const NAME_KEYWORDS = {
  structured: ["blazer", "tailored", "wrap"],
  wide_leg: ["wide-leg", "wide leg"],
  fitted: ["slim", "skinny", "fitted"],
  flowy: ["silk", "satin", "slip", "flowing"],
};

function nameHas(name, keywords) {
  const lower = name.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function scoreItemForBodyType(bodyType, item) {
  const name = item.name || "";
  let score = 0;
  let reason = null;

  switch (bodyType) {
    case "Hourglass":
      if (item.fit_tags?.includes("regular") || nameHas(name, NAME_KEYWORDS.structured)) {
        score += 2;
        reason = "keeps your natural waistline defined";
      }
      break;

    case "Pear":
      if (item.category === "top" && nameHas(name, NAME_KEYWORDS.structured)) {
        score += 2;
        reason = "adds visual width up top to balance proportions";
      }
      if (item.category === "bottom" && item.color_family === "neutrals") {
        score += 1;
        reason = reason || "keeps the lower half visually quiet";
      }
      break;

    case "Apple":
      if (nameHas(name, NAME_KEYWORDS.structured)) {
        score += 2;
        reason = "adds structure through the torso";
      }
      if (item.category === "bottom" && nameHas(name, NAME_KEYWORDS.wide_leg)) {
        score += 2;
        reason = reason || "elongates the leg line with a straight, vertical cut";
      }
      if (nameHas(name, NAME_KEYWORDS.fitted)) {
        score -= 1;
      }
      break;

    case "Rectangle":
      if (nameHas(name, ["wrap"])) {
        score += 2;
        reason = "creates waist definition through the wrap cut";
      }
      if (item.fit_tags?.includes("relaxed")) {
        score += 1;
        reason = reason || "adds volume contrast to create shape";
      }
      break;

    case "Oval":
      if (nameHas(name, NAME_KEYWORDS.flowy) || item.category === "dress") {
        score += 2;
        reason = "gives a smooth line with easy movement";
      }
      break;

    default:
      break;
  }

  return { score, reason };
}

function scoreOutfit(bodyType, items) {
  let total = 0;
  const reasons = [];

  for (const item of items) {
    const { score, reason } = scoreItemForBodyType(bodyType, item);
    total += score;
    if (reason && !reasons.includes(reason)) reasons.push(reason);
  }

  const avgReadiness =
    items.reduce((sum, it) => sum + (it.image_readiness === "high" ? 1 : it.image_readiness === "medium" ? 0.5 : 0), 0) /
    items.length;
  total += avgReadiness;

  return { score: total, reasons: reasons.slice(0, 2) };
}

export { scoreOutfit, scoreItemForBodyType };
