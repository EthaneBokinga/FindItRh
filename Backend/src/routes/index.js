import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { googleLogin, me, publicConfig } from "../controllers/auth.controller.js";
import {
  cvUpload, getCandidate, getCv, getForm, listCandidates, saveEvaluation, uploadCv,
} from "../controllers/candidates.controller.js";

const router = Router();

// Public
router.get("/health", (_req, res) => res.json({ ok: true }));
router.get("/config", publicConfig);
router.post("/auth/google", googleLogin);

// Protégé
router.use(requireAuth);
router.get("/auth/me", me);
router.get("/form", getForm);
router.get("/candidates", listCandidates);
router.get("/candidates/:id", getCandidate);
router.put("/candidates/:id/evaluation", saveEvaluation);
router.post("/candidates/:id/cv", cvUpload, uploadCv);
router.get("/candidates/:id/cv", getCv);

export default router;
