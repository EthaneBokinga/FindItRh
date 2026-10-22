import { ExternalLink, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../api";
import { CV_ACCEPT } from "../../config";
import type { Candidate } from "../../types";

interface Props { candidate: Candidate; onChange: (c: Candidate) => void }

export default function CvTab({ candidate, onChange }: Props) {
  const [url, setUrl] = useState("");
  const [mime, setMime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const hasFile = Boolean(candidate.cvFile?.name);

  useEffect(() => {
    if (!hasFile) return;
    let objectUrl = "";
    api.cvBlob(candidate._id)
      .then((blob) => { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); setMime(blob.type); })
      .catch((e: Error) => setError(e.message));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [candidate._id, candidate.cvFile?.name, hasFile]);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    try { onChange(await api.uploadCv(candidate._id, file)); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }

  return (
    <section className="card">
      <div className="row between">
        <h3>CV</h3>
        <button className="btn btn-outline" disabled={busy} onClick={() => input.current?.click()}>
          <Upload size={16} /> {hasFile ? "Remplacer" : "Ajouter le CV"}
        </button>
        <input ref={input} type="file" accept={CV_ACCEPT} hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {busy && <p className="muted">Envoi en cours…</p>}
      {error && <p className="error">{error}</p>}

      {hasFile && url && (mime === "application/pdf"
        ? <iframe title="CV" src={url} className="cv-frame" />
        : <img src={url} alt="CV" className="cv-img" />)}

      {!hasFile && candidate.cvUrl && (
        <a className="btn" href={candidate.cvUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Ouvrir le CV (lien)</a>
      )}
      {!hasFile && !candidate.cvUrl && <p className="muted">Aucun CV pour ce candidat. Ajoute un PDF ou une photo (5 Mo max).</p>}
      {hasFile && url && mime === "application/pdf" && (
        <a className="btn btn-outline mt" href={url} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Ouvrir en plein écran</a>
      )}
    </section>
  );
}
