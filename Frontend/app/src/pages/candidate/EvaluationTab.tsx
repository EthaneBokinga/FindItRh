import { Camera } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { api } from "../../api";
import CriterionItem from "../../components/CriterionItem";
import ScoreRing from "../../components/ScoreRing";
import { VerdictBadge } from "../../components/StatusBadge";
import { PHOTO, VERDICTS } from "../../config";
import type { Candidate, Criterion, FormConfig } from "../../types";
import { compressImage } from "../../utils/image";
import { computeLive } from "../../utils/verdict";

interface Props { candidate: Candidate; form: FormConfig; onSaved: (c: Candidate) => void }

export default function EvaluationTab({ candidate, form, onSaved }: Props) {
  const ev = candidate.evaluation;
  const [answers, setAnswers] = useState<Record<string, boolean>>(ev.answers ?? {});
  const [writtenTest, setWrittenTest] = useState(ev.writtenTest ?? "");
  const [photo, setPhoto] = useState(ev.photo ?? "");
  const [expectations, setExpectations] = useState(ev.expectations ?? "");
  const [comments, setComments] = useState(ev.comments ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const camera = useRef<HTMLInputElement>(null);

  const live = useMemo(() => computeLive(form, answers), [form, answers]);
  const groups = useMemo(() => [...new Set(form.criteria.map((c) => c.group))], [form]);

  async function onPhoto(file?: File) {
    if (!file) return;
    try { setPhoto(await compressImage(file, PHOTO.maxSize, PHOTO.quality)); }
    catch (e) { setError((e as Error).message); }
  }

  async function save(status: "in_progress" | "done") {
    setSaving(true); setError(""); setMessage("");
    try {
      onSaved(await api.saveEvaluation(candidate._id, { answers, writtenTest, photo, expectations, comments, status }));
      setMessage(status === "done" ? "Entretien terminé et score enregistré ✔" : "Brouillon enregistré ✔");
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }

  function widget(c: Criterion) {
    if (c.widget === "reading") return <blockquote className="reading">{form.readingText}</blockquote>;
    if (c.widget === "writing") {
      return (
        <>
          <p className="small"><em>{form.writingPrompt}</em></p>
          <textarea rows={5} value={writtenTest} onChange={(e) => setWrittenTest(e.target.value)} placeholder="Le candidat écrit ici…" maxLength={2000} />
        </>
      );
    }
    if (c.widget === "camera") {
      return (
        <>
          <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
          <button type="button" className="btn btn-outline" onClick={() => camera.current?.click()}>
            <Camera size={16} /> {photo ? "Reprendre la photo" : "Prendre une photo"}
          </button>
          {photo && <img src={photo} alt="Photo test du candidat" className="test-photo" />}
        </>
      );
    }
    return null;
  }

  return (
    <div className="evaluation">
      <section className="card pitch">
        <h3>1. Explique le projet</h3>
        <ul>{form.projectPitch.map((p) => <li key={p}>{p}</li>)}</ul>
      </section>

      {groups.map((group, i) => (
        <section key={group} className="card">
          <h3>{i + 2}. {group}</h3>
          {form.criteria.filter((c) => c.group === group).map((c) => (
            <CriterionItem key={c.id} criterion={c} checked={Boolean(answers[c.id])} onToggle={(v) => setAnswers((a) => ({ ...a, [c.id]: v }))}>
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
            {live.knockoutFailed.length > 0 && <span className="small muted block">{live.knockoutFailed.length} critère(s) éliminatoire(s)</span>}
          </div>
        </div>
        <div className="savebar-actions">
          <button className="btn btn-outline" disabled={saving} onClick={() => save("in_progress")}>Brouillon</button>
          <button className="btn" disabled={saving} onClick={() => save("done")}>{saving ? "…" : "Terminer"}</button>
        </div>
        {(message || error) && <p className={error ? "error" : "ok"}>{error || message}</p>}
      </div>
    </div>
  );
}
