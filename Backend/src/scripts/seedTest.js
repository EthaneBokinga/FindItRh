// Peuple la base avec des candidats FICTIFS de test (seedTag="test").
// Usage : npm run seed:test
// Nettoyage : npm run clean:test
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Candidate } from "../models/Candidate.js";

const TEST_CANDIDATES = [
  { fullName: "Candidat Test Alpha", district: "Centre-ville", phone: "06 000 00 01" },
  { fullName: "Candidat Test Beta", district: "Plateau des 15 ans", phone: "06 000 00 02" },
  { fullName: "Candidat Test Gamma", district: "Bacongo", phone: "06 000 00 03" },
  { fullName: "Candidat Test Delta", district: "Moungali", phone: "06 000 00 04" },
  { fullName: "Candidat Test Epsilon", district: "Talangaï", phone: "06 000 00 05" },
  { fullName: "Candidat Test Zeta", district: "Mfilou", phone: "06 000 00 06" },
  { fullName: "Candidat Test Eta", district: "Makélékélé", phone: "06 000 00 07" },
  { fullName: "Candidat Test Theta", district: "Ouenzé", phone: "06 000 00 08" },
  { fullName: "Candidat Test Iota", district: "Poto-Poto", phone: "06 000 00 09" },
  { fullName: "Candidat Test Kappa", district: "Djiri", phone: "06 000 00 10" },
];

const CITY = "Brazzaville";

await connectDB();

let created = 0, skipped = 0;
for (const { fullName, district, phone } of TEST_CANDIDATES) {
  const res = await Candidate.updateOne(
    { fullName },
    {
      $setOnInsert: {
        phone,
        city: CITY,
        district,
        cvUrl: "",
        extra: {},
        seedTag: "test",
        evaluation: {},
      },
    },
    { upsert: true }
  );
  res.upsertedCount ? created++ : skipped++;
}

console.log(`Seed test terminé : ${created} faux candidats créés (tag: test), ${skipped} déjà présents.`);
await mongoose.disconnect();
