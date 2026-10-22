// Supprime UNIQUEMENT les candidats de test (seedTag="test") — les vraies données restent.
// Usage : npm run clean:test
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Candidate } from "../models/Candidate.js";
import { CvFile } from "../models/CvFile.js";

await connectDB();

const tests = await Candidate.find({ seedTag: "test" }).select("_id fullName").lean();
if (!tests.length) {
  console.log("Aucun candidat de test à supprimer.");
  await mongoose.disconnect();
  process.exit(0);
}

const ids = tests.map((c) => c._id);
const { deletedCount } = await Candidate.deleteMany({ _id: { $in: ids } });
const cv = await CvFile.deleteMany({ candidate: { $in: ids } });

console.log(`${deletedCount} candidats de test supprimés :`);
tests.forEach((c) => console.log(`  − ${c.fullName}`));
if (cv.deletedCount) console.log(`${cv.deletedCount} CV associés supprimés.`);

await mongoose.disconnect();
