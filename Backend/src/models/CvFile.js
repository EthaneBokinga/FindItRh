import mongoose from "mongoose";

const cvFileSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", unique: true, required: true },
    name: String,
    mime: String,
    data: Buffer,
  },
  { timestamps: true }
);

export const CvFile = mongoose.model("CvFile", cvFileSchema);
