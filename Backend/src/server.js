import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { assertEnv, env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import routes from "./routes/index.js";

assertEnv(["mongoUri", "jwtSecret", "googleClientId"]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("trust proxy", 1);
// COOP "same-origin-allow-popups" est nécessaire pour la fenêtre de connexion Google
app.use(helmet({ contentSecurityPolicy: false, crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } }));
app.use(compression());
if (env.clientOrigin) app.use(cors({ origin: env.clientOrigin.split(",").map((s) => s.trim()) }));
app.use(express.json({ limit: "2mb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 300 }));
app.use("/api", routes);
app.use("/api", notFound);

// Un seul serveur : Express sert aussi le frontend compilé
const dist = path.resolve(__dirname, "../../Frontend/app/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.use(errorHandler);

await connectDB();
app.listen(env.port, () => console.log(`Serveur prêt sur le port ${env.port}`));
