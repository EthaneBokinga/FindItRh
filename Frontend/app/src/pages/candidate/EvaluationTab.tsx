import { AlertCircle, Camera, CheckCircle2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../api";
import CameraCapture from "../../components/CameraCapture";
import CandidateTestMode from "../../components/CandidateTestMode";
import CriterionItem from "../../components/CriterionItem";
import InterviewResultModal from "../../components/InterviewResultModal";
import { InterviewTimer } from "../../components/InterviewTimer";
import ScoreRing from "../../components/ScoreRing";
import { VerdictBadge } from "../../components/StatusBadge";
import { VERDICTS } from "../../config";
import type { Candidate, Criterion, FormConfig } from "../../types";
import { analyzeCandidateText } from "../../utils/textAnalysis";
import { computeLive } from "../../utils/verdict";

interface Props {
  candidate: Candidate;
  form: FormConfig;
  onSaved: (c: Candidate) => void;
}

export default function EvaluationTab({ candidate, form, onSaved }: Props) {
  const isDone = candidate.evaluation?.status === "done";

  const ev = candidate.evaluation;
  const [answers, setAnswers] = useState<Record<string, boolean>>(ev.answers ?? {});
  const [writtenTest, setWrittenTest] = useState(ev.writtenTest ?? "");
  const [photo, setPhoto] = useState(ev.photo ?? "");
  const [expectations, setExpectations] = useState(ev.expectations ?? "");
  const [comments, setComments] = useState(ev.comments ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [candidateMode, setCandidateMode] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // Chronomètre
  const timerDurationRef = useRef<number | null>(ev.interviewDurationSeconds ?? null);
  const timerStartedAtRef = useRef<string | null>(ev.interviewStartedAt ?? null);

  const live = useMemo(() => computeLive(form, answers), [form, answers]);
  const groups = useMemo(() => [...new Set(form.criteria.map((c) => c.group))], [form]);
  const textAnalysis = useMemo(() => analyzeCandidateText(writtenTest), [writtenTest]);

  useEffect(() => {
    if (writtenTest.trim().length > 0) {
      setAnswers((prev) => {
        if (prev.writing === textAnalysis.passed) return prev;
        return { ...prev, writing: textAnalysis.passed };
      });
    }
  }, [textAnalysis.passed, writtenTest]);

  async function save(status: "in_progress" | "done") {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = await api.saveEvaluation(candidate._id, {
        answers,
        writtenTest,
        photo,
        expectations,
        comments,
        status,
        interviewDurationSeconds: timerDurationRef.current,
        interviewStartedAt: timerStartedAtRef.current,
      });
      onSaved(saved);
      if (status === "done") {
        setShowResultModal(true);
      } else {
        setMessage("Brouillon enregistré ✔");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function widget(c: Criterion) {
    if (c.widget === "reading") return <blockquote className="reading">{form.readingText}</blockquote>;

    if (c.widget === "writing") {
      return (
        <div className="writing-eval-wrap">
          <p className="small"><em>{form.writingPrompt}</em></p>
          <textarea
            rows={5}
            value={writtenTest}
            onChange={(e) => setWrittenTest(e.target.value)}
            placeholder="Le candidat écrit ici…"
            maxLength={2000}
            disabled={isDone}
          />
          {writtenTest.trim().length > 0 && (
            <div className={`text-analysis-summary ${textAnalysis.passed ? "passed" : "warning"}`}>
              <div className="analysis-header">
                <span className="analysis-badge">
                  {textAnalysis.passed ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  Calcul automatique : <strong>{textAnalysis.verdict}</strong> ({textAnalysis.score}/100)
                </span>
                <span className="small muted">{textAnalysis.wordCount} mot{textAnalysis.wordCount > 1 ? "s" : ""}</span>
              </div>
              <div className="analysis-checks">
                <span className={textAnalysis.criteriaMet.hasPlaceName ? "check-ok" : "check-missing"}>
                  {textAnalysis.criteriaMet.hasPlaceName ? "✓" : "✗"} Nom du lieu
                </span>
                <span className={textAnalysis.criteriaMet.hasAddress ? "check-ok" : "check-missing"}>
                  {textAnalysis.criteriaMet.hasAddress ? "✓" : "✗"} Repère / quartier
                </span>
                <span className={textAnalysis.criteriaMet.hasDescription ? "check-ok" : "check-missing"}>
                  {textAnalysis.criteriaMet.hasDescription ? "✓" : "✗"} Description
                </span>
              </div>
              {textAnalysis.issues.length > 0 && (
                <ul className="analysis-issues">
                  {textAnalysis.issues.map((issue, idx) => <li key={idx}>{issue}</li>)}
                </ul>
              )}
              <p className="small muted auto-notice">
                ⚡ Le critère est mis à jour automatiquement à partir du texte.
              </p>
            </div>
          )}
        </div>
      );
    }

    if (c.widget === "camera") {
      return (
        <div className="camera-widget-wrap">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowCamera(true)}
            disabled={isDone}
          >
            <Camera size={16} /> {photo ? "Reprendre la photo (Ouvrir l'appareil)" : "Ouvrir l'appareil photo"}
          </button>
          {photo && <img src={photo} alt="Photo test du candidat" className="test-photo" />}
        </div>
      );
    }

    return null;
  }

  // ---- Entretien déjà terminé : vue lecture seule
  if (isDone) {
    return (
      <div className="evaluation">
        <div className="interview-done-banner">
          <CheckCircle2 size={20} />
          <span>Entretien terminé — résultats en lecture seule</span>
        </div>

        {groups.map((group, i) => (
          <section key={group} className="card">
            <h3>{i + 2}. {group}</h3>
            {form.criteria.filter((c) => c.group === group).map((c) => (
              <CriterionItem
                key={c.id}
                criterion={c}
                checked={Boolean(answers[c.id])}
                onToggle={() => {}}
                readonly
              >
                {widget(c)}
              </CriterionItem>
            ))}
          </section>
        ))}

        {(ev.expectations || ev.comments) && (
          <section className="card">
            <h3>{groups.length + 2}. Attentes et commentaires</h3>
            {ev.expectations && (
              <div className="done-field">
                <span className="done-field-label">Attentes du candidat</span>
                <p>{ev.expectations}</p>
              </div>
            )}
            {ev.comments && (
              <div className="done-field">
                <span className="done-field-label">Commentaire du recruteur</span>
                <p>{ev.comments}</p>
              </div>
            )}
          </section>
        )}
      </div>
    );
  }

  // ---- Entretien en cours
  return (
    <div className="evaluation">
      {candidateMode && (
        <CandidateTestMode
          form={form}
          writtenTest={writtenTest}
          onWrittenChange={setWrittenTest}
          photo={photo}
          onPhotoChange={setPhoto}
          onExit={() => setCandidateMode(false)}
        />
      )}

      {showCamera && (
        <CameraCapture
          onCapture={(img) => { setPhoto(img); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showResultModal && (
        <InterviewResultModal
          evaluation={candidate.evaluation}
          candidateName={candidate.fullName}
          onClose={() => setShowResultModal(false)}
        />
      )}

      {/* Chronomètre */}
      <section className="card timer-card">
        <InterviewTimer
          onStart={(startedAt) => { timerStartedAtRef.current = startedAt; }}
          onStop={(duration) => { timerDurationRef.current = duration; }}
        />
      </section>

      <section className="card pitch">
        <h3>1. Explique le projet</h3>
        <ul>{form.projectPitch.map((p) => <li key={p}>{p}</li>)}</ul>
      </section>

      {groups.map((group, i) => (
        <section key={group} className="card">
          <h3>{i + 2}. {group}</h3>

          {group === "Tests sur l'application" && (
            <div className="candidate-mode-callout">
              <div className="candidate-mode-callout-text">
                <strong>Vous passez l'appareil au candidat ?</strong>
                <p className="small muted">Mode candidat : masque les notes, critères et le score.</p>
              </div>
              <button type="button" className="btn btn-candidate-mode" onClick={() => setCandidateMode(true)}>
                <Smartphone size={18} /> Mode Candidat
              </button>
            </div>
          )}

          {form.criteria.filter((c) => c.group === group).map((c) => (
            <CriterionItem
              key={c.id}
              criterion={c}
              checked={Boolean(answers[c.id])}
              onToggle={(v) => setAnswers((a) => ({ ...a, [c.id]: v }))}
            >
              {widget(c)}
            </CriterionItem>
          ))}
        </section>
      ))}

      <section className="card">
        <h3>{groups.length + 2}. Attentes et commentaires</h3>
        <label className="field">
          <span>Ce que le candidat attend de l'équipe Find it</span>
          <textarea rows={3} value={expectations} onChange={(e) => setExpectations(e.target.value)} maxLength={2000} placeholder="Salaire, formation, matériel, horaires…" />
        </label>
        <label className="field">
          <span>Commentaire du recruteur</span>
          <textarea rows={3} value={comments} onChange={(e) => setComments(e.target.value)} maxLength={3000} placeholder="Impressions, jours disponibles, points à vérifier…" />
        </label>
      </section>

      <div className="savebar">
        <div className="savebar-score">
          <ScoreRing score={live.score} size={48} tone={VERDICTS[live.verdict].tone} />
          <div>
            <VerdictBadge verdict={live.verdict} />
            {live.knockoutFailed.length > 0 && (
              <span className="small muted block">{live.knockoutFailed.length} critère(s) éliminatoire(s)</span>
            )}
          </div>
        </div>
        <div className="savebar-actions">
          <button className="btn btn-outline" disabled={saving} onClick={() => save("in_progress")}>Brouillon</button>
          <button className="btn" disabled={saving} onClick={() => save("done")}>{saving ? "…" : "Terminer ✔"}</button>
        </div>
        {(message || error) && <p className={error ? "error" : "ok"}>{error || message}</p>}
      </div>
    </div>
  );
}
