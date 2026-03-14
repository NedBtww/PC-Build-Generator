// script.js — Générateur de PC prébuild (frontend)
// Utilise prebuild_pc.json et génère 1 à 2 cartes (sous / au-dessus budget).

let pcs = [];

// Chargement JSON au démarrage
async function loadPCs() {
  try {
    const response = await fetch('prebuild_pc.json');
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
    pcs = await response.json();
  } catch (err) {
    console.error('Erreur lors du chargement du JSON :', err);
  }
}

// Normalisation + filtrage: même logique que la description du projet
function filterPCs(budget, usage) {
  const norm = str =>
    (str || '')
      .normalize('NFD')
      .replace(/-/g, '')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const usageNorm = norm(usage);

  const resolutionLevels = [
    { key: '1080p', mots: ['1080p', 'e-sport', 'esport', 'gaming', 'streaming'] },
    { key: '1440p', mots: ['1440p', '2k'] },
    { key: '4k', mots: ['4k', 'ultra'] }
  ];

  function getUsagesInclusifs(u) {
    u = norm(u);
    let idx = resolutionLevels.findIndex(r => r.key === u.replace(/\s.*$/, ''));
    if (idx === -1) return [u];
    return resolutionLevels.slice(0, idx + 1).flatMap(r => r.mots);
  }

  const motsUsage = getUsagesInclusifs(usageNorm);

  let filtered = pcs.filter(pc => {
    const prix = pc.prix_special ?? pc.prix_normal ?? 0;
    if (!prix) return false;
    const concat = norm(
      [pc.usage_recommande, pc.nom, pc.carte_graphique, pc.processeur].join(' ')
    );
    return motsUsage.some(mot => concat.includes(mot));
  });

  // 1) PC <= budget (triés du plus proche au plus cher)
  let sous = filtered
    .filter(pc => (pc.prix_special ?? pc.prix_normal ?? 0) <= budget)
    .sort(
      (a, b) =>
        (b.prix_special ?? b.prix_normal ?? 0) -
        (a.prix_special ?? a.prix_normal ?? 0)
    );

  // 2) PC > budget et <= budget + 100 (triés du moins cher au plus cher)
  let sur = filtered
    .filter(pc => {
      const prix = pc.prix_special ?? pc.prix_normal ?? 0;
      return prix > budget && prix <= budget + 100;
    })
    .sort(
      (a, b) =>
        (a.prix_special ?? a.prix_normal ?? 0) -
        (b.prix_special ?? b.prix_normal ?? 0)
    );

  const results = [];

  // On prend au max 1 sous + 1 au-dessus si les deux existent
  if (sous.length) results.push(sous[0]);
  if (sur.length) results.push(sur[0]);

  // Si on n’a toujours qu’UNE seule carte mais qu’il reste d’autres PC filtrés,
  // on complète pour en afficher 2 (par ex. un deuxième sous-budget).
  if (results.length < 2) {
    const idsDejaPris = new Set(results.map(pc => pc.id || pc.nom));
    const restants = filtered.filter(pc => !idsDejaPris.has(pc.id || pc.nom));
    if (restants.length) {
      results.push(restants[0]);
    }
  }

  // Toujours max 2 cartes
  return results.slice(0, 2);
}

// Rendu des cartes UI
function renderResults(results) {
  const resultsSection = document.getElementById('results-section');
  const resultsDiv = document.getElementById('results');

  resultsDiv.innerHTML = '';

  if (!results || results.length === 0) {
    resultsSection.style.display = 'block';
    resultsDiv.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
        <h3 style="margin-bottom:12px;">Aucune configuration trouvée</h3>
        <p>Essaie d'ajuster le budget ou l'usage.</p>
      </div>
    `;
    return;
  }

  results.forEach((pc, index) => {
    const prix = pc.prix_special ?? pc.prix_normal ?? 0;
    const usage = pc.usage_recommande || '';
    const url = pc.url_affilie || pc.lien || pc.url || '#';

    const card = document.createElement('div');
    card.className = 'pc-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const badgeText =
      prix <= Number(document.getElementById('budget').value || 0)
        ? '✓ Under budget'
        : `+${Math.max(0, prix - Number(document.getElementById('budget').value || 0))} € above`;

    card.innerHTML = `
      <div class="pc-card-header">
        <h3>${pc.nom || 'PC recommandé'}</h3>
        <span class="budget-badge">${badgeText}</span>
      </div>

      <div class="specs-list">
        <div class="spec-item">
          <div class="spec-icon icon-cpu">🔷</div>
          <div class="spec-content">
            <div class="spec-label">CPU</div>
            <div class="spec-value">${pc.processeur || '—'}</div>
          </div>
        </div>

        <div class="spec-item">
          <div class="spec-icon icon-gpu">🟢</div>
          <div class="spec-content">
            <div class="spec-label">GPU</div>
            <div class="spec-value">${pc.carte_graphique || '—'}</div>
          </div>
        </div>

        <div class="spec-item">
          <div class="spec-icon icon-ram">🟣</div>
          <div class="spec-content">
            <div class="spec-label">RAM</div>
            <div class="spec-value">${pc.ram || '—'}</div>
          </div>
        </div>

        <div class="spec-item">
          <div class="spec-icon icon-storage">💾</div>
          <div class="spec-content">
            <div class="spec-label">Storage</div>
            <div class="spec-value">${pc.stockage || '—'}</div>
          </div>
        </div>
      </div>

      <div class="pc-card-footer">
        <div class="usage-tags">
          <span class="usage-tag">${usage}</span>
        </div>
        <div class="price-section">
          <div class="price-label">Price</div>
          <div class="price-value">€${prix}</div>
        </div>
      </div>

      <button class="btn-view" ${url !== '#' ? `onclick="window.open('${url}','_blank')"` : ''}>
        View PC
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      </button>
    `;

    const pcCardHeader = card.querySelector('.pc-card-header');
    if (pc.image) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'pc-card-image';

      const img = document.createElement('img');
      img.src = pc.image;
      img.alt = pc.nom || 'PC image';
      img.loading = 'lazy';

      imgWrap.appendChild(img);
      if (pcCardHeader) pcCardHeader.insertBefore(imgWrap, pcCardHeader.firstChild);
    }

    resultsDiv.appendChild(card);
  });

  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Gestion du bouton
function setupSearch() {
  const btn = document.getElementById('searchBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const budgetInput = document.getElementById('budget');
    const usageSelect = document.getElementById('usage');
    const budget = Number(budgetInput.value || 0);
    const usage = usageSelect.value;

    if (!budget || budget < 200) {
      alert('Mets un budget valide (au moins 200€).');
      return;
    }

    const results = filterPCs(budget, usage);
    renderResults(results);
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadPCs();
  setupSearch();
});
 