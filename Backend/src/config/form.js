export const THRESHOLDS = { good: 70, mid: 50 };

export const CRITERIA = [
  // ---- Équipement
  { id: "smartphone", group: "Équipement", weight: 10, knockout: true,
    question: "A-t-il un bon smartphone qui fonctionne bien ?",
    hint: "Demande-lui de le sortir : écran en bon état, batterie correcte, appareil photo qui marche." },
  { id: "android", group: "Équipement", weight: 8,
    question: "Son téléphone est-il un Android ? (atout)",
    hint: "Demande la marque, le modèle et la version. Android est un atout, pas une obligation." },
  { id: "storage", group: "Équipement", weight: 10, knockout: true,
    question: "A-t-il assez d'espace de stockage sur son téléphone ?",
    hint: "Minimum conseillé : 2 Go libres (photos + application). Fais-lui ouvrir ses paramètres." },
  // ---- Conditions
  { id: "age", group: "Conditions", weight: 4, knockout: true,
    question: "A-t-il entre 18 et 35 ans ?",
    hint: "Vérifie avec sa pièce d'identité ou sa date de naissance." },
  { id: "dataPlan", group: "Conditions", weight: 10, knockout: true,
    question: "Est-il d'accord pour activer un forfait internet pour travailler ?",
    hint: "Il faut être connecté pour envoyer les lieux collectés." },
  { id: "availability", group: "Conditions", weight: 12, knockout: true,
    question: "Est-il disponible pour travailler (jours et horaires) ?",
    hint: "Précise les jours et les heures dans le commentaire si besoin." },
  // ---- Tests
  { id: "reading", group: "Tests sur l'application", weight: 8, knockout: true, widget: "reading",
    question: "Sait-il lire correctement ?",
    hint: "Fais-lui lire le texte ci-dessous à voix haute." },
  { id: "writing", group: "Tests sur l'application", weight: 8, knockout: true, widget: "writing",
    question: "Sait-il écrire correctement ?",
    hint: "Fais-lui écrire la réponse dans la zone ci-dessous, directement sur l'application." },
  { id: "camera", group: "Tests sur l'application", weight: 12, widget: "camera",
    question: "Sait-il cadrer une photo nette (lieu entier, bien centré) ?",
    hint: "Fais-lui prendre en photo un lieu ou un objet depuis l'application." },
  // ---- Profil
  { id: "knowsZone", group: "Profil", weight: 5,
    question: "Connaît-il très bien la ville et son quartier ?",
    hint: "Demande-lui de citer 3 lieux (nom + où ils se trouvent)." },
  { id: "motivation", group: "Profil", weight: 3,
    question: "Est-il dynamique, sérieux et motivé ?",
    hint: "Pourquoi veut-il ce travail ? Comment s'organise-t-il ? Ponctualité à l'entretien." },
  { id: "marketing", group: "Profil", weight: 3,
    question: "A-t-il une expérience en marketing / vente / prospection ?",
    hint: "Utile pour convaincre les commerçants d'être référencés." },
  { id: "usesMaps", group: "Profil", weight: 3,
    question: "Sait-il utiliser Google Maps ou le GPS du téléphone ?",
    hint: "Demande-lui de te montrer sa position sur la carte." },
  { id: "mobility", group: "Profil", weight: 2,
    question: "Peut-il se déplacer facilement à pied ou à moto toute la journée ?" },
  { id: "communication", group: "Profil", weight: 2,
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
    "Find it est un annuaire de lieux avec carte, comme Google Maps, pour le Congo.",
    "Le collecteur photographie et géolocalise les lieux (commerces, services, restaurants…) pour enrichir l'annuaire.",
    "Ce que nous offrons : une rémunération attractive, une grande flexibilité (tu organises ton temps), une expérience enrichissante et une équipe à l'écoute.",
    "Ce qu'il faut : un bon smartphone (Android atout), un forfait internet actif, de l'espace de stockage, savoir lire et écrire, être disponible et rigoureux.",
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
