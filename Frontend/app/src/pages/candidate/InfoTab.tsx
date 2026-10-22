import { Check, Clock, Pencil, Trophy, User2, X } from "lucide-react";
import { useState } from "react";
import { api } from "../../api";
import { CORE_FIELDS } from "../../config";
import type { Candidate } from "../../types";

const splitPhones = (value: string) => value.split(/[\/;]/).map((p) => p.trim()).filter(Boolean);

const VERDICT_LABELS = {
  good: "Recommandé",
  mid: "À considérer",
  low: "Non recommandé",
  eliminated: "Éliminatoire",
} as const;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}min${s > 0 ? ` ${s}s` : ""}`;
}

interface Props { candidate: Candidate; onChange: (c: Candidate) => void }

export default function InfoTab({ candidate, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ fullName: "", phone: "", email: "", city: "", district: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const extras = Object.entries(candidate.extra ?? {});
  const ev = candidate.evaluation;

  const startEdit = () => {
    setDraft({
      fullName: candidate.fullName,
      phone: candidate.phone,
      email: candidate.email,
      city: candidate.city,
      district: candidate.district,
    });
    setError("");
    setEditing(true);
  };

  async function save() {
    setSaving(true); setError("");
    try {
      onChange(await api.updateCandidate(candidate._id, draft));
      setEditing(false);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }

  const renderValue = (key: (typeof CORE_FIELDS)[number]["key"]) => {
    const value = candidate[key];
    if (!value) return "—";
    if (key !== "phone") return value;
    return splitPhones(value).map((p, i) => (
      <span key={p}>
        {i > 0 && " · "}
        <a href={`tel:${p.replace(/\s/g, "")}`}>{p}</a>
      </span>
    ));
  };

  return (
    <>
      {/* Fiche candidat */}
      <section className="card">
        <div className="row between">
          <h3>Tableau de bord du candidat</h3>
          {editing ? (
            <span className="row">
              <button className="icon-btn" onClick={() => setEditing(false)} aria-label="Annuler" title="Annuler"><X size={18} /></button>
              <button className="btn" disabled={saving} onClick={save}><Check size={16} /> {saving ? "…" : "Enregistrer"}</button>
            </span>
          ) : (
            <button className="icon-btn" onClick={startEdit} aria-label="Modifier" title="Modifier"><Pencil size={18} /></button>
          )}
        </div>
        {error && <p className="error">{error}</p>}

        {editing ? (
          <div className="info-edit">
            <label className="field"><span>Nom complet</span>
              <input type="text" value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} maxLength={120} />
            </label>
            {CORE_FIELDS.map(({ key, label }) => (
              <label className="field" key={key}><span>{label}</span>
                <input
                  type="text"
                  value={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  maxLength={key === "email" ? 120 : 160}
                  inputMode={key === "phone" ? "tel" : "text"}
                />
              </label>
            ))}
            <p className="muted small">Astuce : deux numéros se séparent par « / ».</p>
          </div>
        ) : (
          <dl className="info-grid">
            <div><dt>Nom</dt><dd>{candidate.fullName}</dd></div>
            {CORE_FIELDS.map(({ key, label }) => (
              <div key={key}><dt>{label}</dt><dd>{renderValue(key)}</dd></div>
            ))}
            {extras.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        )}
      </section>

      {/* Résumé entretien — visible uniquement si entretien terminé */}
      {ev?.status === "done" && ev.verdict && (
        <section className="card interview-summary-card">
          <div className="interview-summary-header">
            <Trophy size={18} className="summary-icon" />
            <h3>Résultat de l'entretien</h3>
          </div>

          <div className="interview-summary-grid">
            <div className="summary-item summary-score">
              <span className="summary-label">Score</span>
              <span className="summary-value summary-score-val">{ev.score ?? 0}<span className="summary-score-max">/100</span></span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Décision</span>
              <span className={`summary-verdict summary-verdict-${ev.verdict}`}>
                {VERDICT_LABELS[ev.verdict]}
              </span>
            </div>

            {ev.knockoutFailed && ev.knockoutFailed.length > 0 && (
              <div className="summary-item">
                <span className="summary-label">Critères éliminatoires échoués</span>
                <span className="summary-value">{ev.knockoutFailed.length}</span>
              </div>
            )}

            {ev.interviewDurationSeconds != null && ev.interviewDurationSeconds > 0 && (
              <div className="summary-item">
                <span className="summary-label"><Clock size={13} /> Durée</span>
                <span className="summary-value">{formatDuration(ev.interviewDurationSeconds)}</span>
              </div>
            )}

            {ev.evaluatedBy && (
              <div className="summary-item">
                <span className="summary-label"><User2 size={13} /> Conduit par</span>
                <span className="summary-value">{ev.evaluatedBy}</span>
              </div>
            )}

            {ev.evaluatedAt && (
              <div className="summary-item">
                <span className="summary-label">Date</span>
                <span className="summary-value">
                  {new Date(ev.evaluatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {ev.expectations && (
              <div className="summary-item summary-full">
                <span className="summary-label">Attentes du candidat</span>
                <p className="summary-text">{ev.expectations}</p>
              </div>
            )}

            {ev.comments && (
              <div className="summary-item summary-full">
                <span className="summary-label">Commentaire recruteur</span>
                <p className="summary-text">{ev.comments}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
