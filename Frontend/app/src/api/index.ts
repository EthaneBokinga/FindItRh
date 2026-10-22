import type { Candidate, CandidateList, EvaluationPayload, FormConfig, PublicConfig, User } from "../types";
import { http } from "./http";

let formCache: Promise<FormConfig> | null = null;

export const api = {
  config: () => http<PublicConfig>("/config"),
  googleLogin: (credential: string) =>
    http<{ token: string; user: User }>("/auth/google", { method: "POST", body: { credential } }),
  me: () => http<{ user: User }>("/auth/me"),

  form: () => {
    formCache ??= http<FormConfig>("/form").catch((e) => { formCache = null; throw e; });
    return formCache;
  },

  candidates: (params: { q?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.status) qs.set("status", params.status);
    return http<CandidateList>(`/candidates?${qs.toString()}`);
  },
  candidate: (id: string) => http<Candidate>(`/candidates/${id}`),
  updateCandidate: (id: string, info: Partial<Pick<Candidate, "fullName" | "phone" | "email" | "city" | "district">>) =>
    http<Candidate>(`/candidates/${id}`, { method: "PATCH", body: info }),
  setCandidateStatus: (id: string, status: "archived" | "restore") =>
    http<Candidate>(`/candidates/${id}/status`, { method: "PUT", body: { status } }),
  saveEvaluation: (id: string, payload: EvaluationPayload) =>
    http<Candidate>(`/candidates/${id}/evaluation`, { method: "PUT", body: payload }),
  uploadCv: (id: string, file: File) => {
    const form = new FormData();
    form.append("cv", file);
    return http<Candidate>(`/candidates/${id}/cv`, { method: "POST", form });
  },
  cvBlob: (id: string) => http<Blob>(`/candidates/${id}/cv`, { blob: true }),
};
