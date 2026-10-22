import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Charge d'abord un .env du répertoire courant (Render n'en a pas : variables d'env)
// puis Backend/.env comme solution de repli, pour que `npm start` marche depuis la racine.
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const toList = (v) => (v || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  allowedEmails: toList(process.env.ALLOWED_EMAILS),
  clientOrigin: process.env.CLIENT_ORIGIN || "",
};

export function assertEnv(keys) {
  const missing = keys.filter((k) => !env[k]);
  if (missing.length) {
    console.error(`Variables d'environnement manquantes : ${missing.join(", ")}`);
    process.exit(1);
  }
}
