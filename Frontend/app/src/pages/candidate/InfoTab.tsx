import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { api } from "../../api";
import { CORE_FIELDS } from "../../config";
import type { Candidate } from "../../types";

// Certains candidats ont deux numéros séparés par « / » ou « ; »
const splitPhones = (value: string) => value.split(/[\/;]/).map((p) => p.trim()).filter(Boolean);

interface Props { candidate: Candidate; onChange: (c: Candidate) => void }

export default function InfoTab({ candidate, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ fullName: "", phone: "", email: "", city: "", district: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const extras = Object.entries(candidate.extra ?? {});

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
    <section className="card">
      <div className="row between">
        <h3>Tableau de bord du candidat</h3>
        {editing ? (
          <span className="row">
            <button className="icon-btn" onClick={() => setEditing(false)} aria-label="Annuler" title="Annuler"><X size={18} /></button>
            <button className="btn" disabled={saving} onClick={save}><Check size={16} /> {saving ? "…" : "Enregistrer"}</button>
          </span>
        ) : (
          <button className="icon-btn" onClick={startEdit} aria-label="Modifier les informations" title="Modifier les informations">
            <Pencil size={18} />
          </button>
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
          <p className="muted small">Astuce : deux numéros se séparent par « / » (affichés chacun comme un lien d'appel).</p>
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
  );
}
