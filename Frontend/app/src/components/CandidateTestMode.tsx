import { BookOpen, Camera, Check, ChevronRight, PenTool, X } from "lucide-react";
import { useState } from "react";
import type { FormConfig } from "../types";
import CameraCapture from "./CameraCapture";

interface Props {
  form: FormConfig;
  writtenTest: string;
  onWrittenChange: (text: string) => void;
  photo: string;
  onPhotoChange: (photoBase64: string) => void;
  onExit: () => void;
}

export default function CandidateTestMode({
  form,
  writtenTest,
  onWrittenChange,
  photo,
  onPhotoChange,
  onExit,
}: Props) {
  const [activeStep, setActiveStep] = useState<"all" | "reading" | "writing" | "camera">("all");
  const [showCamera, setShowCamera] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const words = writtenTest.trim() ? writtenTest.trim().split(/\s+/).length : 0;

  return (
    <div className="candidate-mode-overlay">
      <header className="candidate-mode-header">
        <div>
          <h2>Espace Candidat</h2>
          <p className="muted small">Test pratique · Collecteur Find it</p>
        </div>
        <button
          type="button"
          className="btn btn-outline small-btn"
          onClick={() => setShowExitConfirm(true)}
          title="Rendre l'appareil au recruteur"
        >
          Terminer l'exercice
        </button>
      </header>

      <main className="candidate-mode-content">
        {/* Exercice 1 : Lecture */}
        <section className="candidate-exercise-card">
          <div className="exercise-header">
            <span className="exercise-icon"><BookOpen size={20} /></span>
            <div>
              <h3>Exercice 1 : Lecture</h3>
              <p className="muted small">Lisez le texte suivant à voix haute calmement :</p>
            </div>
          </div>
          <div className="candidate-reading-box">
            {form.readingText}
          </div>
        </section>

        {/* Exercice 2 : Écriture */}
        <section className="candidate-exercise-card">
          <div className="exercise-header">
            <span className="exercise-icon"><PenTool size={20} /></span>
            <div>
              <h3>Exercice 2 : Rédaction</h3>
              <p className="muted small">{form.writingPrompt}</p>
            </div>
          </div>
          <div className="candidate-input-wrap">
            <textarea
              rows={6}
              value={writtenTest}
              onChange={(e) => onWrittenChange(e.target.value)}
              placeholder="Écrivez votre texte ici directement…"
              className="candidate-textarea"
              maxLength={2000}
            />
            <div className="candidate-word-counter">
              <span>{words} mot{words > 1 ? "s" : ""}</span>
              <span>{writtenTest.length} caractère{writtenTest.length > 1 ? "s" : ""}</span>
            </div>
          </div>
        </section>

        {/* Exercice 3 : Photo */}
        <section className="candidate-exercise-card">
          <div className="exercise-header">
            <span className="exercise-icon"><Camera size={20} /></span>
            <div>
              <h3>Exercice 3 : Prise de vue</h3>
              <p className="muted small">Prenez en photo nette un lieu ou un objet autour de vous.</p>
            </div>
          </div>

          <div className="candidate-photo-section">
            {photo ? (
              <div className="candidate-photo-preview">
                <img src={photo} alt="Photo du candidat" className="candidate-preview-img" />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCamera(true)}
                >
                  <Camera size={16} /> Reprendre la photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary candidate-camera-btn"
                onClick={() => setShowCamera(true)}
              >
                <Camera size={20} /> Ouvrir l'appareil photo
              </button>
            )}
          </div>
        </section>

        {/* Bouton de fin de test pour le candidat */}
        <div className="candidate-finish-section">
          <button
            type="button"
            className="btn btn-primary candidate-finish-btn"
            onClick={() => setShowExitConfirm(true)}
          >
            <Check size={20} /> J'ai terminé, rendre l'appareil
          </button>
        </div>
      </main>

      {/* Caméra directe */}
      {showCamera && (
        <CameraCapture
          onCapture={(img) => {
            onPhotoChange(img);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Confirmation avant de rendre l'appareil */}
      {showExitConfirm && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Remettre l'appareil au recruteur</h3>
            <p className="muted">
              Avez-vous bien terminé vos 3 exercices (lecture, écriture et photo) ?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowExitConfirm(false)}
              >
                Continuer mes exercices
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
              >
                Oui, remettre au recruteur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
