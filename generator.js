const pcs = require('./prebuild_pc.json');

/**
 * Retourne une liste (max 2) : la config < budget la plus proche
 * + éventuellement celle au-dessus du budget (max +100 €)
 * L’usage est inclusif (1080p ⇒ 1440p/4K, e-sport ⇒ gaming/1080p…)
 */
function getSuggestions(budget, usage) {
  if (!budget || !usage) return [];
  const norm = str => (str || '').normalize('NFD').replace(/-/g,'').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const usageNorm = norm(usage);

  const usageEquiv = {
    "1080p": ["1080p", "1440p", "4k", "ultra"],
    "1440p": ["Gaming 1440p, 1440p", "4k", "ultra"],
    "4k": ["Gaming 4k","4k", "ultra"],
    "e-sport": ["e sport", "esport", "e-sport", "gaming", "1080p", "1440p", "4k"],
    "esport": ["e sport", "esport", "e-sport", "gaming", "1080p", "1440p", "4k"],
    "gaming": ["gaming", "1080p", "1440p", "4k"]
  };
  const equivalences = usageEquiv[usageNorm] || [usageNorm];

  // Filtre avancé (champ usage_recommande + GPU/CPU/Nom inclusifs)
  let filtered = pcs.filter(pc => {
    const prix = pc.prix_special ?? pc.prix_normal ?? 0;
    if (!prix) return false;
    const usageText = norm(
      [pc.usage_recommande, pc.nom, pc.carte_graphique, pc.processeur].join(' ')
    );
    return equivalences.some(u => usageText.includes(u));
  });

  // La config ≤ budget la plus chère
  let pcSous = filtered
    .filter(pc => (pc.prix_special ?? pc.prix_normal ?? 0) <= budget)
    .sort((a, b) => ((b.prix_special ?? b.prix_normal ?? 0) - (a.prix_special ?? a.prix_normal ?? 0)));
  pcSous = pcSous.length ? [pcSous[0]] : [];

  // La config > budget la moins chère, max +100€
  let pcSur = filtered
    .filter(pc => {
      const prix = pc.prix_special ?? pc.prix_normal ?? 0;
      return prix > budget && prix <= budget + 100;
    })
    .sort((a, b) => ((a.prix_special ?? a.prix_normal ?? 0) - (b.prix_special ?? b.prix_normal ?? 0)));
  pcSur = pcSur.length ? [pcSur[0]] : [];

  return pcSous.concat(pcSur);
}

// Pour test/démo en node generator.js
if (require.main === module) {
  const budget = 800; // Exemple budget
  const usage = 'gaming'; // Exemple usage
  console.log(getSuggestions(budget, usage));
}

module.exports = getSuggestions;
