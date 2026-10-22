import { Archive, ArchiveRestore, ArrowLeft, FileText, Info, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import Header from "../components/Header";
import ScoreRing from "../components/ScoreRing";
import { StatusBadge, VerdictBadge } from "../components/StatusBadge";
import { ROUTES } from "../config";
import type { Candidate, FormConfig } from "../types";
import CvTab from "./candidate/CvTab";
import EvaluationTab from "./candidate/EvaluationTab";
import InfoTab from "./candidate/InfoTab";

const TABS = [
  { key: "info", label: "Infos", Icon: Info },
  { key: "cv", label: "CV", Icon: FileText },
  { key: "interview", label: "Entretien", Icon: Mic },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function CandidatePage() {
  const { id = "" } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [form, setForm] = useState<FormConfig | null>(null);
  const [tab, setTab] = useState<TabKey>("info");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.candidate(id), api.form()])
      .then(([c, f]) => { setCandidate(c); setForm(f); })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const { evaluation } = candidate ?? {};

  async function changeStatus(status: "archived" | "restore") {
    if (!candidate) return;
    setBusy(true); setError("");
    try { setCandidate(await api.setCandidateStatus(candidate._id, status)); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <Header />
      <main className="page">
        <Link to={ROUTES.candidates} className="back"><ArrowLeft size={18} /> Candidats</Link>
        {error && <p className="error">{error}</p>}
        {!candidate || !form ? (!error && <div className="spinner center" />) : (
          <>
            <div className="hero">
              <div className="grow">
                <h2>{candidate.fullName}</h2>
                <span className="muted">{[candidate.phone, candidate.city].filter(Boolean).join(" · ")}</span>
                {evaluation?.status === "done" && evaluation.verdict && <div className="badges"><VerdictBadge verdict={evaluation.verdict} /></div>}
              </div>
              {evaluation?.score !== null && evaluation?.score !== undefined && (
                <ScoreRing score={evaluation.score} tone={evaluation.verdict ? ({ good: "good", mid: "mid", low: "low", eliminated: "bad" } as const)[evaluation.verdict] : "low"} />
              )}
              {evaluation && <div className="badges"><StatusBadge status={evaluation.status} /></div>}
              {evaluation?.status === "archived" ? (
                <button className="btn btn-outline" disabled={busy} onClick={() => changeStatus("restore")}>
                  <ArchiveRestore size={16} /> Réactiver
                </button>
              ) : (
                <button className="btn btn-outline" disabled={busy} onClick={() => changeStatus("archived")}>
                  <Archive size={16} /> Archiver
                </button>
              )}
            </div>

            <nav className="tabs" role="tablist">
              {TABS.map(({ key, label, Icon }) => (
                <button key={key} role="tab" aria-selected={tab === key} className={`tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>
                  <Icon size={17} /> {label}
                </button>
              ))}
            </nav>

            {tab === "info" && <InfoTab candidate={candidate} onChange={setCandidate} />}
            {tab === "cv" && <CvTab candidate={candidate} onChange={setCandidate} />}
            {tab === "interview" && <EvaluationTab key={candidate._id} candidate={candidate} form={form} onSaved={setCandidate} />}
          </>
        )}
      </main>
    </>
  );
}
