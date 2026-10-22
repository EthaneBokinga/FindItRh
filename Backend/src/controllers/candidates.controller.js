import mongoose from "mongoose";
import multer from "multer";
import { Candidate } from "../models/Candidate.js";
import { CvFile } from "../models/CvFile.js";
import { CRITERIA_IDS, FORM, computeResult } from "../config/form.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const clip = (v, n) => String(v ?? "").slice(0, n);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const httpError = (status, message) => Object.assign(new Error(message), { status });

function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, "Identifiant invalide");
}

export const getForm = (_req, res) => res.json(FORM);

export const listCandidates = asyncHandler(async (req, res) => {
  const { q = "", status = "" } = req.query;
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(String(q).trim()), "i");
    filter.$or = [{ fullName: rx }, { phone: rx }, { email: rx }];
  }
  const STATUSES = ["pending", "in_progress", "done", "archived"];
  if (STATUSES.includes(status)) filter["evaluation.status"] = status;
  else filter["evaluation.status"] = { $ne: "archived" }; // par défaut, les archivés sont masqués

  const [items, grouped] = await Promise.all([
    Candidate.find(filter)
      .select("fullName phone city district evaluation.status evaluation.score evaluation.verdict")
      .sort({ fullName: 1 })
      .limit(500)
      .lean(),
    Candidate.aggregate([{ $group: { _id: "$evaluation.status", n: { $sum: 1 } } }]),
  ]);

  const stats = { total: 0, pending: 0, in_progress: 0, done: 0, archived: 0 };
  grouped.forEach((g) => { if (g._id in stats) stats[g._id] = g.n; });
  stats.total = stats.pending + stats.in_progress + stats.done; // les archivés ne comptent pas dans le total
  res.json({ items, stats });
});

export const getCandidate = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const candidate = await Candidate.findById(req.params.id).lean();
  if (!candidate) throw httpError(404, "Candidat introuvable");
  res.json(candidate);
});

// Modification d'informations depuis l'interface recruteur (pas de suppression possible)
const EDITABLE = {
  fullName: 120, phone: 60, email: 120, city: 60, district: 160, cvUrl: 500,
};

export const updateCandidateInfo = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const body = req.body || {};
  const set = {};
  for (const [field, max] of Object.entries(EDITABLE)) {
    if (body[field] === undefined) continue;
    const value = clip(body[field], max).trim();
    if (field === "fullName" && !value) throw httpError(400, "Le nom est obligatoire");
    set[field] = field === "email" ? value.toLowerCase() : value;
  }
  if (!Object.keys(set).length) throw httpError(400, "Aucune information à mettre à jour");
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, { $set: set }, { new: true, runValidators: true }).lean();
  if (!candidate) throw httpError(404, "Candidat introuvable");
  res.json(candidate);
});

// Archiver / réactiver : aucun delete, juste un changement de statut
const NEXT_STATUSES = ["pending", "in_progress", "done", "archived"];

export const setCandidateStatus = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const { status } = req.body || {};
  const candidate = await Candidate.findById(req.params.id).lean();
  if (!candidate) throw httpError(404, "Candidat introuvable");

  let next = status;
  if (status === "restore") {
    const ev = candidate.evaluation || {};
    next = ev.verdict
      ? "done"
      : Object.values(ev.answers || {}).some(Boolean) || ev.writtenTest
        ? "in_progress"
        : "pending";
  }
  if (!NEXT_STATUSES.includes(next)) throw httpError(400, "Statut invalide");

  const updated = await Candidate.findByIdAndUpdate(
    req.params.id,
    { $set: { "evaluation.status": next } },
    { new: true }
  ).lean();
  res.json(updated);
});

export const saveEvaluation = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const body = req.body || {};
  const answers = Object.fromEntries(CRITERIA_IDS.map((id) => [id, Boolean(body.answers?.[id])]));
  const photo =
    typeof body.photo === "string" && body.photo.startsWith("data:image/") && body.photo.length < 400_000
      ? body.photo
      : "";

  const evaluation = {
    status: body.status === "done" ? "done" : "in_progress",
    answers,
    writtenTest: clip(body.writtenTest, 2000),
    photo,
    expectations: clip(body.expectations, 2000),
    comments: clip(body.comments, 3000),
    ...computeResult(answers),
    evaluatedBy: req.user.email,
    evaluatedAt: new Date(),
  };

  const candidate = await Candidate.findByIdAndUpdate(req.params.id, { $set: { evaluation } }, { new: true }).lean();
  if (!candidate) throw httpError(404, "Candidat introuvable");
  res.json(candidate);
});

// ---- CV
const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED_MIME.includes(file.mimetype) ? cb(null, true) : cb(httpError(400, "Format accepté : PDF, JPG, PNG, WEBP")),
}).single("cv");

export const uploadCv = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  if (!req.file) throw httpError(400, "Aucun fichier reçu");
  const { originalname, mimetype, buffer, size } = req.file;

  await CvFile.findOneAndUpdate(
    { candidate: req.params.id },
    { name: originalname, mime: mimetype, data: buffer },
    { upsert: true }
  );
  const candidate = await Candidate.findByIdAndUpdate(
    req.params.id,
    { $set: { cvFile: { name: originalname, mime: mimetype, size } } },
    { new: true }
  ).lean();
  if (!candidate) throw httpError(404, "Candidat introuvable");
  res.json(candidate);
});

export const getCv = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const file = await CvFile.findOne({ candidate: req.params.id });
  if (!file) throw httpError(404, "Aucun CV déposé");
  res.set("Content-Type", file.mime);
  res.set("Content-Disposition", `inline; filename="${encodeURIComponent(file.name || "cv")}"`);
  res.send(file.data);
});
