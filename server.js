// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Sert les fichiers statiques (HTML, CSS, JS, JSON)
app.use(express.static('.'));

// Fonction pour filtrer les configs côté serveur (propre, robuste)
function getSuggestions(budget, usage) {
  const jsonPath = path.join(__dirname, 'prebuild_pc.json');
  let pcs = [];
  try {
    pcs = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  } catch (err) {
    return [];
  }
  usage = usage ? usage.toLowerCase() : '';
  return pcs.filter(pc => {
    const prix = pc.prix_special ?? pc.prix_normal;
    if (prix === undefined) return false;
    const usageTxt = (pc.usage_recommande || '').toLowerCase();
    return prix <= budget && usageTxt.includes(usage);
  });
}

// Endpoint API pour suggestions filtrées
app.get('/api/suggestions', (req, res) => {
  const budget = parseInt(req.query.budget, 10);
  const usage = req.query.usage;
  res.json(getSuggestions(budget, usage));
});

// Démarre le serveur
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
