export const THRESHOLDS = { good: 70, mid: 50 };

export const CRITERIA = [
  // ---- Équipement
  { id: "android", group: "Équipement", weight: 12, knockout: true,
    question: "As-tu un téléphone Android ?",
    hint: "Demande la marque, le modèle et la version. Il doit pouvoir installer l'application." },
  { id: "storage", group: "Équipement", weight: 10, knockout: true,
    question: "As-tu assez d'espace de stockage sur ton téléphone ?",
    hint: "Minimum conseillé : 2 Go libres (photos + application). Fais-lui ouvrir ses paramètres." },
  // ---- Conditions
  { id: "dataPlan", group: "Conditions", weight: 10, knockout: true,
    question: "Es-tu d'accord pour activer un forfait internet pour travailler ?",
    hint: "Il faut être connecté pour envoyer les lieux collectés." },
  { id: "availability", group: "Conditions", weight: 12, knockout: true,
    question: "Es-tu disponible pour travailler (jours et horaires) ?",
    hint: "Précise les jours et les heures dans le commentaire si besoin." },
  // ---- Tests
  { id: "reading", group: "Tests sur l'application", weight: 8, widget: "reading",
    question: "Sait-il lire correctement ?",
    hint: "Fais-lui lire le texte ci-dessous à voix haute." },
  { id: "writing", group: "Tests sur l'application", weight: 8, widget: "writing",
    question: "Sait-il écrire correctement ?",
    hint: "Fais-lui écrire la réponse dans la zone ci-dessous, directement sur l'application." },
  { id: "camera", group: "Tests sur l'application", weight: 12, widget: "camera",
    question: "Sait-il cadrer une photo nette (lieu entier, bien centré) ?",
    hint: "Fais-lui prendre en photo un lieu ou un objet depuis l'application." },
  // ---- Profil
  { id: "marketing", group: "Profil", weight: 6,
    question: "As-tu déjà une expérience en marketing / vente / prospection ?",
    hint: "Utile pour convaincre les commerçants d'être référencés." },
  { id: "knowsZone", group: "Profil", weight: 8,
    question: "Connais-tu très bien ton quartier / ta zone de travail ?",
    hint: "Demande-lui de citer 3 lieux (nom + où ils se trouvent)." },
  { id: "usesMaps", group: "Profil", weight: 6,
    question: "Sais-tu utiliser Google Maps ou le GPS du téléphone ?",
    hint: "Demande-lui de te montrer sa position sur la carte." },
  { id: "mobility", group: "Profil", weight: 4,
    question: "Peux-tu te déplacer facilement à pied ou à moto toute la journée ?" },
  { id: "communication", group: "Profil", weight: 4,
    question: "Communique-t-il clairement et poliment ?",
    hint: "Impression générale pendant l'entretien." },
];

export const FORM = {
  criteria: CRITERIA,
  thresholds: THRESHOLDS,
  readingText:
    "Find it est une application qui aide les gens à trouver rapidement les lieux autour d'eux : restaurants, pharmacies, hôtels, boutiques et services. Le collecteur parcourt son quartier, prend des photos nettes et renseigne le nom, l'adresse et les horaires de chaque lieu.",
  writingPrompt:
    "Écris en quelques lignes : le nom d'un lieu que tu connais bien dans ton quartier, son adresse précise et ce que l'on y trouve.",
  projectPitch: [
    "Find it est une application de recherche de lieux, comme Google Maps, mais pensée pour notre ville.",
    "Le collecteur parcourt les rues, repère les lieux (commerces, services, restaurants...), prend des photos et remplit une fiche.",
    "Il faut un téléphone Android, un forfait internet actif et de l'espace de stockage.",
    "Le travail demande de la rigueur : photos nettes, informations exactes, bonne lecture et écriture.",
  ],
};

export const CRITERIA_IDS = CRITERIA.map((c) => c.id);

export function computeResult(answers) {
  const score = CRITERIA.reduce((sum, c) => sum + (answers[c.id] ? c.weight : 0), 0);
  const knockoutFailed = CRITERIA.filter((c) => c.knockout && !answers[c.id]).map((c) => c.id);
  let verdict = "low";
  if (knockoutFailed.length) verdict = "eliminated";
  else if (score >= THRESHOLDS.good) verdict = "good";
  else if (score >= THRESHOLDS.mid) verdict = "mid";
  return { score, knockoutFailed, verdict };
}
