// Peuple la base avec la liste officielle des candidats.
// Ce script n'utilise AUCUN tag "test" : ces données ne seront jamais supprimées par clean:test.
// Usage : npm run seed:candidates
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Candidate } from "../models/Candidate.js";

const ROWS = [
  ["DIANTSIETÉ Angela", "", "06 819 65 47"],
  ["MANOUANA KOUBA Job Dalau", "N8 Bis rue NZOUGOGOU", "04 60 84 81"],
  ["GALLET LOUNDOU Saint Jérémie", "19 Rue Kayi Q.Massina", "06 688 56 33"],
  ["BOLE Jovey", "10 Bis rue Loutété", "06 587 55 94/ 05 693 96 01"],
  ["PEMBA GASTARD Brel johnnevil", "", "06 420 48 77"],
  ["ITOUMA Virole", "11 Rue Ntima-makazou/ MFILOU", "067664542/069774929"],
  ["BOBIA AMBONGO Christina", "", "06 674 03 43"],
  ["ONGUELE Belich Chadrack", "", "06 827 79 31"],
  ["BIFOUMA Bénicia Gloire", "13 Rue Mbémba Paul Moukoundzi-Ngouaka", "06 610 56 18"],
  ["TSIMPOUZA MIZELÉ Fred derlick", "", "06 431 78 68"],
  ["TSOUMOU Maeche", "", "06 447 04 48"],
  ["MBELO Zachée Jude", "", "06 900 86 84"],
  ["BOPIELE EZENA Netanya", "320 RUE du Marché Mpila Blanche Talangaï", "06 496 65 48"],
  ["MBOUNGOU MOUELE LOÏC LEVI", "33 Rue Makotipoko, Moungali", "06 767 62 59"],
  ["LIPINDA Rolson Harris", "", "06 570 84 04"],
  ["GONI LOEMBE Steve", "", "06 531 27 85"],
  ["BONDZATA KOMBE Frédéric Marel", "Massengo", "064653399/ 069792206"],
  ["BOKABE Mamie Florette", "171 rue Bouenza talangaï", "05 616 62 21 / 865631861"],
  ["POATY Claude", "10 rue Makélékélé Moukondo Mazala", "06 792 50 41"],
  ["MVOULA Herlyche Rapheldie", "", "68041859"],
  ["EKOUEREMBAYE Paule Christevie", "", "06 853 32 34"],
  ["BOUITY Henrika Colombe", "50 rue Epena", "06 960 87 46"],
  ["MASSOUAMA KOUMBA Quessia Merveilles", "Mfilou Mbouala", "04 51 29 99"],
  ["FATELL René", "Makélékélé", "06 402 58 52"],
  ["MISSAMOU Thierli Vann Guyor", "", "04 93 78 65"],
];

const CITY = "Brazzaville";

await connectDB();

let created = 0, skipped = 0;
for (const [fullName, district, phone] of ROWS) {
  const res = await Candidate.updateOne(
    { fullName },
    {
      $setOnInsert: {
        phone,
        city: CITY,
        district,
        cvUrl: "",
        extra: {},
        evaluation: {},
      },
    },
    { upsert: true }
  );
  res.upsertedCount ? created++ : skipped++;
}

console.log(`Import officiel terminé : ${created} candidats créés, ${skipped} déjà existants.`);
await mongoose.disconnect();
