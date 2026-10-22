export type Status = "pending" | "in_progress" | "done" | "archived";
export type VerdictKey = "good" | "mid" | "low" | "eliminated";

export interface User { email: string; name: string; picture: string }
export interface PublicConfig { googleClientId: string }

export interface Criterion {
  id: string;
  group: string;
  weight: number;
  question: string;
  hint?: string;
  knockout?: boolean;
  widget?: "reading" | "writing" | "camera";
}

export interface FormConfig {
  criteria: Criterion[];
  thresholds: { good: number; mid: number };
  readingText: string;
  writingPrompt: string;
  projectPitch: string[];
}

export interface Evaluation {
  status: Status;
  answers: Record<string, boolean>;
  writtenTest: string;
  photo: string;
  expectations: string;
  comments: string;
  score: number | null;
  verdict: VerdictKey | null;
  knockoutFailed: string[];
  evaluatedBy?: string;
  evaluatedAt?: string;
  interviewDurationSeconds?: number | null;
  interviewStartedAt?: string | null;
}

export interface Candidate {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  cvUrl: string;
  cvFile: { name: string; mime: string; size: number };
  extra: Record<string, string>;
  evaluation: Evaluation;
}

export type CandidateListItem = Pick<Candidate, "_id" | "fullName" | "phone" | "city" | "district"> & {
  evaluation: Pick<Evaluation, "status" | "score" | "verdict">;
};

export interface CandidateList {
  items: CandidateListItem[];
  stats: { total: number; pending: number; in_progress: number; done: number; archived: number };
}

export type EvaluationPayload = Pick<Evaluation, "answers" | "writtenTest" | "photo" | "expectations" | "comments"> & {
  status: "in_progress" | "done";
  interviewDurationSeconds?: number | null;
  interviewStartedAt?: string | null;
};
