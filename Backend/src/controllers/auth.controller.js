import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const client = new OAuth2Client(env.googleClientId);

export const publicConfig = (_req, res) => res.json({ googleClientId: env.googleClientId });

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ message: "Jeton Google manquant" });

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch (err) {
    console.error("Erreur verifyIdToken:", err?.message || err);
    return res.status(401).json({ message: "Jeton Google invalide" });
  }

  const email = payload?.email?.toLowerCase();
  if (!email || !payload.email_verified) return res.status(401).json({ message: "Email Google non vérifié" });

  // Liste vide = accès ouvert à tout compte Google vérifié ; sinon seuls les emails de ALLOWED_EMAILS entrent
  const allowed = !env.allowedEmails.length || env.allowedEmails.includes(email);
  if (!allowed) return res.status(403).json({ message: "Accès réservé aux recruteurs autorisés" });

  try {
    const user = { email, name: payload.name || email, picture: payload.picture || "" };
    const token = jwt.sign(user, env.jwtSecret, { expiresIn: "12h" });
    res.json({ token, user });
  } catch (err) {
    console.error("Erreur génération JWT:", err);
    res.status(500).json({ message: `Erreur de session: ${err.message}` });
  }
});

export const me = (req, res) => {
  const { email, name, picture } = req.user;
  res.json({ user: { email, name, picture } });
};
