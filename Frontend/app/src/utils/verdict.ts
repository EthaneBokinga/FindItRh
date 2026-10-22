import type { Criterion, FormConfig, VerdictKey } from "../types";

// Même règle que le backend (Backend/src/config/form.js) pour afficher le score en direct.
export function computeLive(form: FormConfig, answers: Record<string, boolean>) {
  const score = form.criteria.reduce((s: number, c: Criterion) => s + (answers[c.id] ? c.weight : 0), 0);
  const knockoutFailed = form.criteria.filter((c) => c.knockout && !answers[c.id]);
  let verdict: VerdictKey = "low";
  if (knockoutFailed.length) verdict = "eliminated";
  else if (score >= form.thresholds.good) verdict = "good";
  else if (score >= form.thresholds.mid) verdict = "mid";
  return { score, knockoutFailed, verdict };
}
