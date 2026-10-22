import { CheckCircle2, Clock, Trophy, User2, X } from "lucide-react";
import type { Evaluation, VerdictKey } from "../types";

const VERDICT_LABELS: Record<VerdictKey, string> = {
  good: "Recommandé ✔",
  mid: "À considérer",
  low: "Non recommandé",
  eliminated: "Éliminatoire ✗",
};

const VERDICT_COLORS: Record<VerdictKey, string> = {
  good: "result-good",
  mid: "result-mid",
  low: "result-low",
  eliminated: "result-bad",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}min ${s > 0 ? `${s}s` : ""}`.trim();
}

interface Props {
  evaluation: Evaluation;
  candidateName: string;
  onClose: () => void;
}

export default function InterviewResultModal({ evaluation, candidateName, onClose }: Props) {
  const verdict = evaluation.verdict as VerdictKey;
  const duration = evaluation.interviewDurationSeconds;
  const evaluatedBy = evaluation.evaluatedBy;

  return (
    <div className="modal-backdrop">
      <div className="result-modal">
        <button type="button" className="result-modal-close icon-btn" onClick={onClose} aria-label="Fermer">
          <X size={22} />
        </button>

        <div className="result-modal-header">
          <CheckCircle2 size={44} className="result-check-icon" />
          <h2>Entretien terminé</h2>
          <p className="muted">{candidateName}</p>
        </div>

        {/* Score */}
        <div className={`result-score-box ${verdict ? VERDICT_COLORS[verdict] : ""}`}>
          <div className="result-score-number">{evaluation.score ?? 0}<span>/100</span></div>
          <div className={`result-verdict-label`}>{verdict ? VERDICT_LABELS[verdict] : "—"}</div>
        </div>

        {/* Détails */}
        <div className="result-details">
          {evaluation.knockoutFailed && evaluation.knockoutFailed.length > 0 && (
            <div className="result-detail-row result-warning">
              <span className="result-detail-label">Critères éliminatoires échoués</span>
              <span className="result-detail-value">{evaluation.knockoutFailed.length}</span>
            </div>
          )}

          {duration != null && duration > 0 && (
            <div className="result-detail-row">
              <span className="result-detail-label"><Clock size={14} /> Durée de l'entretien</span>
              <span className="result-detail-value">{formatDuration(duration)}</span>
            </div>
          )}

          {evaluatedBy && (
            <div className="result-detail-row">
              <span className="result-detail-label"><User2 size={14} /> Mené par</span>
              <span className="result-detail-value">{evaluatedBy}</span>
            </div>
          )}

          {evaluation.evaluatedAt && (
            <div className="result-detail-row">
              <span className="result-detail-label">Date</span>
              <span className="result-detail-value">
                {new Date(evaluation.evaluatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        <button type="button" className="btn result-modal-btn" onClick={onClose}>
          <Trophy size={18} /> Voir la fiche complète
        </button>
      </div>
    </div>
  );
}
