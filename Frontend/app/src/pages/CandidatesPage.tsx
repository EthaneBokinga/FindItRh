import { CheckCircle2, ChevronRight, Clock, Search, UserX, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Header from "../components/Header";
import { StatusBadge, VerdictBadge } from "../components/StatusBadge";
import { ROUTES, SEARCH_DEBOUNCE_MS, STATUS_FILTERS } from "../config";
import type { CandidateList } from "../types";

const VERDICT_COLORS: Record<string, string> = {
  good: "#0ba67c",
  mid: "#e0932b",
  low: "#d64545",
  eliminated: "#d64545",
};

function ScoreBadge({ score, verdict }: { score: number | null; verdict: string | null }) {
  if (score === null || score === undefined) return null;
  const color = verdict ? VERDICT_COLORS[verdict] ?? "#6b7a72" : "#6b7a72";
  return (
    <div className="card-score-badge" style={{ background: color }}>
      {score}
    </div>
  );
}

function InitialsAvatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return <div className="candidate-avatar">{initials}</div>;
}

export default function CandidatesPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState<CandidateList | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      api.candidates({ q, status })
        .then((d) => { setData(d); setError(""); })
        .catch((e: Error) => setError(e.message));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q, status]);

  return (
    <>
      <Header />
      <main className="page">
        {/* Titre section */}
        <div className="page-header">
          <div className="page-header-left">
            <h2 className="page-title">Candidats</h2>
            {data && (
              <span className="page-count">{data.stats.total} enregistrés</span>
            )}
          </div>
        </div>

        {/* Stats */}
        {data && (
          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-icon"><Users size={20} /></div>
              <div>
                <strong>{data.stats.total}</strong>
                <span>Total</span>
              </div>
            </div>
            <div className="stat-card stat-done">
              <div className="stat-icon"><CheckCircle2 size={20} /></div>
              <div>
                <strong>{data.stats.done}</strong>
                <span>Terminés</span>
              </div>
            </div>
            <div className="stat-card stat-pending">
              <div className="stat-icon"><Clock size={20} /></div>
              <div>
                <strong>{data.stats.in_progress + data.stats.pending}</strong>
                <span>Restants</span>
              </div>
            </div>
          </div>
        )}

        {/* Recherche */}
        <label className="search-bar">
          <Search size={17} className="search-icon" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un candidat…"
            inputMode="search"
          />
          {q && (
            <button className="search-clear" onClick={() => setQ("")} aria-label="Effacer">
              <X size={14} />
            </button>
          )}
        </label>

        {/* Filtres — scrollable horizontalement sur mobile */}
        <div className="filter-bar" role="group" aria-label="Filtrer par statut">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-chip ${status === f.key ? "active" : ""}`}
              onClick={() => setStatus(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        {!data && !error && <div className="spinner center" />}
        {data?.items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><UserX size={40} className="muted" /></div>
            <p>Aucun candidat trouvé.</p>
          </div>
        )}

        <ul className="candidate-list">
          {data?.items.map((c) => (
            <li key={c._id}>
              <Link to={ROUTES.candidate(c._id)} className="candidate-card">
                {/* Score en haut à droite */}
                <ScoreBadge score={c.evaluation.score} verdict={c.evaluation.verdict} />

                <div className="candidate-card-body">
                  <InitialsAvatar name={c.fullName} />
                  <div className="candidate-card-info">
                    <strong className="candidate-name">{c.fullName}</strong>
                    <span className="candidate-meta">
                      {[c.phone, c.city || c.district].filter(Boolean).join(" · ")}
                    </span>
                    <div className="candidate-badges">
                      <StatusBadge status={c.evaluation.status} />
                      {c.evaluation.status === "done" && c.evaluation.verdict && (
                        <VerdictBadge verdict={c.evaluation.verdict} />
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} className="candidate-arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
