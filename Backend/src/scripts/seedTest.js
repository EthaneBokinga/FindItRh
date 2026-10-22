// Peuple la base avec 3 faux candidats purement fictifs de test (marqués seedTag="test").
// Usage : npm run seed:test
// Nettoyage : npm run clean:test
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Candidate } from "../models/Candidate.js";

const TEST_ROWS = [
  ["Candidat Test Alpha", "Centre-ville", "06 000 00 01"],
  ["Candidat Test Beta", "Plateau", "06 000 00 02"],
  ["Candidat Test Gamma", "Bacongo", "06 000 00 03"],
];

const CITY = "Brazzaville";

await connectDB();

let created = 0, skipped = 0;
for (const [fullName, district, phone] of TEST_ROWS) {
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
