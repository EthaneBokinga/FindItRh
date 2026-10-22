// Usage : npm run import -- ./Backend/data/candidats.xlsx   (ajoute --dry pour tester sans écrire)
import path from "node:path";
import mongoose from "mongoose";
import XLSX from "xlsx";
import { connectDB } from "../config/db.js";
import { assertEnv } from "../config/env.js";
import { Candidate } from "../models/Candidate.js";

assertEnv(["mongoUri"]);

const DEFAULT_CITY = "Brazzaville";

// Les en-têtes Excel sont normalisés (minuscules, sans accents ni espaces) puis comparés à ces alias.
// Ajoute simplement un alias si une de tes colonnes n'est pas reconnue.
const ALIASES = {
  fullName: ["nom", "noms", "nomcomplet", "nometprenom", "nomprenom", "nometprenoms", "prenomnom", "name", "fullname", "candidat"],
  firstName: ["prenom", "prenoms", "firstname"],
  phone: ["telephone", "tel", "phone", "numero", "numeros", "numerotelephone", "contact", "whatsapp", "numerowhatsapp"],
  email: ["email", "mail", "adressemail", "adresseemail", "courriel"],
  city: ["ville", "city", "commune"],
  district: ["quartier", "arrondissement", "zone", "adresse", "localisation"],
  cvUrl: ["cv", "lien", "liencv", "cvlink", "cvurl", "lienducv"],
};

const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const fieldOf = (header) => Object.keys(ALIASES).find((f) => ALIASES[f].includes(norm(header)));

const file = process.argv[2];
const dry = process.argv.includes("--dry");
if (!file) {
  console.error("Indique le fichier : npm run import -- ./chemin/candidats.xlsx");
  process.exit(1);
}

const wb = XLSX.readFile(path.resolve(file));
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "", raw: false });
console.log(`${rows.length} lignes lues dans la feuille « ${wb.SheetNames[0]} »`);
if (rows[0]) console.log("Colonnes :", Object.keys(rows[0]).map((h) => `${h} → ${fieldOf(h) || "extra"}`).join(" | "));

let created = 0, updated = 0, skipped = 0;
if (!dry) await connectDB();

for (const row of rows) {
  const doc = { extra: {} };
  for (const [header, raw] of Object.entries(row)) {
    const value = String(raw).replace(/\s+/g, " ").trim();
    if (!value) continue;
    const field = fieldOf(header);
    if (field) doc[field] = doc[field] ? `${doc[field]} ${value}` : value;
    else doc.extra[String(header).trim()] = value;
  }
  if (doc.firstName) {
    doc.fullName = [doc.fullName, doc.firstName].filter(Boolean).join(" ");
    delete doc.firstName;
  }
  if (!doc.fullName) { skipped++; continue; }
  if (!doc.city) doc.city = DEFAULT_CITY;
  if (dry) { console.log(`  ${doc.fullName} | ${doc.phone || "—"} | ${doc.district || "—"}`); created++; continue; }

  // Le nom complet sert de clé : relancer l'import met à jour sans créer de doublons
  const res = await Candidate.updateOne({ fullName: doc.fullName }, { $set: doc, $setOnInsert: { evaluation: {} } }, { upsert: true });
  res.upsertedCount ? created++ : updated++;
}

console.log(`Terminé : ${created} créés, ${updated} mis à jour, ${skipped} ignorés (sans nom)${dry ? " [simulation]" : ""}`);
if (!dry) await mongoose.disconnect();
