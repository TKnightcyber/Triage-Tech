export function calculateEWasteScore(deviceType) {
  const footprints = {
    laptop: 200,
    smartphone: 70,
    tablet: 100,
    default: 120
  };

  const reuseFactor = 0.4;

  const base = footprints[deviceType?.toLowerCase()] || footprints.default;
  const co2Saved = base * reuseFactor;

  return {
    co2Saved: co2Saved.toFixed(1),
    lifespanExtension: "2–4 years"
  };
}

export function calculateEWasteSavedScore(devicesRevived) {
  const scorePerDevice = 10;
  return devicesRevived * scorePerDevice;
}

export function getBadge(score) {
  if (score >= 200) return { label: "Eco Champion", icon: "🏆" };
  if (score >= 100) return { label: "Green Hero", icon: "🥇" };
  if (score >= 50) return { label: "Sustainability Starter", icon: "🥈" };
  return { label: "Beginner", icon: "🌱" };
}
