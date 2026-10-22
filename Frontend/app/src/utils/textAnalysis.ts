// Analyse intelligente du test écrit du candidat Find it
// Consigne : « Écris en quelques lignes : le nom d'un lieu que tu connais bien dans ton quartier,
// son adresse précise et ce que l'on y trouve. »

export interface TextAnalysisResult {
  wordCount: number;
  charCount: number;
  score: number; // 0 - 100
  passed: boolean;
  verdict: "Validé" | "À améliorer" | "Insuffisant";
  criteriaMet: {
    hasPlaceName: boolean;
    hasAddress: boolean;
    hasDescription: boolean;
  };
  issuesCount: number;
  issues: string[];
}

const PLACE_KEYWORDS = [
  "pharmacie", "restaurant", "boutique", "hotel", "hôtel", "ecole", "école", "eglise", "église",
  "marche", "marché", "hopital", "hôpital", "bar", "salon", "station", "kiosque", "boulangerie",
  "cyber", "snack", "maquis", "agence", "centre", "stade", "clinique", "quincaillerie",
  "depot", "dépôt", "magasin", "alimentaire", "espace", "complexe", "supermarché", "terrasse",
];

const ADDRESS_KEYWORDS = [
  "rue", "avenue", "quartier", "arret", "arrêt", "rond-point", "rondpoint", "croisement",
  "face", "vers", "près", "pres", "derriere", "derrière", "devant", "côté", "cote", "zone",
  "moungali", "bacongo", "talangaï", "talangai", "mfilou", "ouenzé", "ouenze", "makelekele",
  "makélékélé", "madibou", "djiri", "kintélé", "kintele", "mpila", "poto-poto", "potopoto",
  "massengo", "mouhoumi", "mansimou", "sadelmi", "texaco", "château", "marche", "marché",
  "total", "gendarmerie", "commissariat", "mairie", "bloc", "case", "ngoyo", "tié-tié",
];

const DESCRIPTION_KEYWORDS = [
  "trouve", "vend", "propose", "sert", "achète", "achete", "médicament", "medicament",
  "produit", "nourriture", "boisson", "repas", "habit", "soin", "pain", "service",
  "chambre", "essence", "fourniture", "plat", "café", "bière", "biere", "article",
  "coiffure", "téléphone", "telephone", "carte", "beauté", "aliment", "viande", "poisson",
];

export function analyzeCandidateText(text: string): TextAnalysisResult {
  const clean = text.trim();
  if (!clean) {
    return {
      wordCount: 0,
      charCount: 0,
      score: 0,
      passed: false,
      verdict: "Insuffisant",
      criteriaMet: { hasPlaceName: false, hasAddress: false, hasDescription: false },
      issuesCount: 0,
      issues: ["Aucun texte saisi"],
    };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = clean.length;
  const lower = clean.toLowerCase();

  // Détection du respect des consignes
  const hasPlaceName = PLACE_KEYWORDS.some((k) => lower.includes(k)) || /[A-Z][a-z]+/.test(clean);
  const hasAddress = ADDRESS_KEYWORDS.some((k) => lower.includes(k));
  const hasDescription = DESCRIPTION_KEYWORDS.some((k) => lower.includes(k)) || wordCount >= 20;

  // Détection des erreurs courantes
  const issues: string[] = [];

  // 1. Longueur minimale
  if (wordCount < 10) {
    issues.push("Texte trop court (moins de 10 mots)");
  }

  // 2. Majuscule au début
  if (!/^[A-ZÀ-ÖØ-ß]/.test(clean)) {
    issues.push("Pas de majuscule au début de la phrase");
  }

  // 3. Ponctuation finale
  if (!/[.!?]$/.test(clean)) {
    issues.push("Pas de point final");
  }

  // 4. Mots répétés consécutifs (ex: « le le » ou « dans dans »)
  const repeated = clean.match(/\b([a-zA-ZÀ-ÿ]{2,})\s+\1\b/gi);
  if (repeated) {
    issues.push(`Mot répété consécutivement : "${repeated[0]}"`);
  }

  // 5. Confusions fréquentes en français
  if (/\b(a)\s+[a-zà-öø-ÿ]+(\s+la|\s+le|\s+l'|\s+son|\s+sa)/i.test(clean) && !/\b(a)\s+(un|une|des|été)/i.test(clean)) {
    // Ex: « il habite a brazzaville » au lieu de « à »
    if (/\ba\s+(brazzaville|pointe-noire|talangaï|mfilou|bacongo|moungali|la|l'|côté|proximité)\b/i.test(clean)) {
      issues.push("Confusion fréquente : « a » sans accent au lieu de « à »");
    }
  }

  if (/\b(sa)\s+(va|fait|marche|permet|se)\b/i.test(clean)) {
    issues.push("Confusion fréquente : « sa » au lieu de « ça »");
  }

  // 6. Présence des éléments demandés
  if (!hasAddress) {
    issues.push("Adresse ou repère de localisation peu précis ou manquant");
  }
  if (!hasDescription && wordCount < 15) {
    issues.push("Description des activités/produits incomplète");
  }

  // Calcul du score (base 100)
  let score = 30; // base de départ pour avoir écrit

  // Points pour la longueur
  if (wordCount >= 25) score += 30;
  else if (wordCount >= 18) score += 25;
  else if (wordCount >= 12) score += 15;
  else if (wordCount >= 8) score += 10;
  else score -= 15;

  // Points pour les 3 critères de la consigne
  if (hasPlaceName) score += 15;
  if (hasAddress) score += 15;
  if (hasDescription) score += 15;

  // Pénalités pour les fautes détectées
  score -= issues.length * 4;

  // Bornes 0 - 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Décision automatique :
  // Le test est validé si le candidat écrit au moins 12 mots, a mentionné un repère et a un score >= 60.
  const passed = wordCount >= 12 && hasAddress && score >= 55;
  const verdict = score >= 70 ? "Validé" : score >= 50 ? "À améliorer" : "Insuffisant";

  return {
    wordCount,
    charCount,
    score,
    passed,
    verdict,
    criteriaMet: { hasPlaceName, hasAddress, hasDescription },
    issuesCount: issues.length,
    issues,
  };
}
