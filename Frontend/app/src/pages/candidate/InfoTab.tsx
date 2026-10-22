import { CORE_FIELDS } from "../../config";
import type { Candidate } from "../../types";

export default function InfoTab({ candidate }: { candidate: Candidate }) {
  const extras = Object.entries(candidate.extra ?? {});
  return (
    <section className="card">
      <h3>Tableau de bord du candidat</h3>
      <dl className="info-grid">
        <div><dt>Nom</dt><dd>{candidate.fullName}</dd></div>
        {CORE_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>
              {candidate[key] ? (
                key === "phone" ? <a href={`tel:${candidate.phone}`}>{candidate.phone}</a> : candidate[key]
              ) : "—"}
            </dd>
          </div>
        ))}
        {extras.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
    </section>
  );
}
