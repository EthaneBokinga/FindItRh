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
  if (["pending", "in_progress", "done"].includes(status)) filter["evaluation.status"] = status;

  const [items, grouped] = await Promise.all([
    Candidate.find(filter)
      .select("fullName phone city district evaluation.status evaluation.score evaluation.verdict")
      .sort({ fullName: 1 })
      .limit(500)
      .lean(),
    Candidate.aggregate([{ $group: { _id: "$evaluation.status", n: { $sum: 1 } } }]),
  ]);

  const stats = { total: 0, pending: 0, in_progress: 0, done: 0 };
  grouped.forEach((g) => {
    stats[g._id] = g.n;
    stats.total += g.n;
  });
  res.json({ items, stats });
});

export const getCandidate = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const candidate = await Candidate.findById(req.params.id).lean();
  if (!candidate) throw httpError(404, "Candidat introuvable");
  res.json(candidate);
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
