import { ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Header from "../components/Header";
import { StatusBadge, VerdictBadge } from "../components/StatusBadge";
import { ROUTES, SEARCH_DEBOUNCE_MS, STATUS_FILTERS } from "../config";
import type { CandidateList } from "../types";

export default function CandidatesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState<CandidateList | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      api.candidates({ q, status }).then((d) => { setData(d); setError(""); }).catch((e: Error) => setError(e.message));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q, status]);

  return (
    <>
      <Header />
      <main className="page">
        <h2>Candidats</h2>
        {data && (
          <div className="stats">
            <div><strong>{data.stats.total}</strong><span>Total</span></div>
            <div><strong>{data.stats.done}</strong><span>Terminés</span></div>
            <div><strong>{data.stats.in_progress + data.stats.pending}</strong><span>Restants</span></div>
          </div>
        )}

        <label className="search">
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, téléphone ou email…" inputMode="search" />
        </label>

        <div className="chips">
          {STATUS_FILTERS.map((f) => (
            <button key={f.key} className={`chip ${status === f.key ? "active" : ""}`} onClick={() => setStatus(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        {!data && !error && <div className="spinner center" />}
        {data?.items.length === 0 && <p className="muted center-text">Aucun candidat trouvé.</p>}

        <ul className="list">
          {data?.items.map((c) => (
            <li key={c._id}>
              <Link to={ROUTES.candidate(c._id)} className="card row">
                <div className="grow">
                  <strong>{c.fullName}</strong>
                  <span className="muted small">{[c.phone, c.city || c.district].filter(Boolean).join(" · ")}</span>
                  <div className="badges">
                    <StatusBadge status={c.evaluation.status} />
                    {c.evaluation.status === "done" && c.evaluation.verdict && <VerdictBadge verdict={c.evaluation.verdict} />}
                  </div>
                </div>
                {c.evaluation.score !== null && <span className="score-pill">{c.evaluation.score}</span>}
                <ChevronRight size={18} className="muted" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
