import mongoose from "mongoose";

const { Schema } = mongoose;

const evaluationSchema = new Schema(
  {
    status: { type: String, enum: ["pending", "in_progress", "done", "archived"], default: "pending" },
    answers: { type: Schema.Types.Mixed, default: {} },
    writtenTest: { type: String, default: "" },
    photo: { type: String, default: "" },
    expectations: { type: String, default: "" },
    comments: { type: String, default: "" },
    score: { type: Number, default: null },
    verdict: { type: String, default: null },
    knockoutFailed: { type: [String], default: [] },
    evaluatedBy: { type: String, default: "" },
    evaluatedAt: { type: Date },
    interviewDurationSeconds: { type: Number, default: null },
    interviewStartedAt: { type: Date },
  },
  { _id: false, minimize: false }
);

const candidateSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, index: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    city: { type: String, default: "", trim: true },
    district: { type: String, default: "", trim: true },
    cvUrl: { type: String, default: "" },
    cvFile: {
      name: { type: String, default: "" },
      mime: { type: String, default: "" },
      size: { type: Number, default: 0 },
    },
    extra: { type: Schema.Types.Mixed, default: {} },
    // "test" pour les candidats de démonstration : supprimés par `npm run clean:test`
    seedTag: { type: String, default: "" },
    evaluation: { type: evaluationSchema, default: () => ({}) },
  },
  { timestamps: true, minimize: false }
);

export const Candidate = mongoose.model("Candidate", candidateSchema);
