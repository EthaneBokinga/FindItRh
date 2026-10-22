import { Clock, Pause, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onStart: (startedAt: string) => void;  // ISO string
  onStop: (durationSeconds: number) => void;
  disabled?: boolean;
}

export function InterviewTimer({ onStart, onStop, disabled }: Props) {
  const [state, setState] = useState<"idle" | "running" | "paused" | "stopped">("idle");
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedAtRef = useRef<number>(0);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function formatTime(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function start() {
    const now = new Date().toISOString();
    startedAtRef.current = now;
    setElapsed(0);
    setState("running");
    onStart(now);
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }

  function pause() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    pausedAtRef.current = elapsed;
    setState("paused");
  }

  function resume() {
    setState("running");
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState("stopped");
    onStop(elapsed);
  }

  return (
    <div className="interview-timer">
      <div className="timer-display">
        <Clock size={16} className="timer-icon" />
        <span className={`timer-value ${state === "running" ? "timer-running" : state === "stopped" ? "timer-done" : ""}`}>
          {formatTime(elapsed)}
        </span>
        {state !== "idle" && (
          <span className={`timer-status-dot ${state}`} title={
            state === "running" ? "En cours" : state === "paused" ? "Pause" : "Terminé"
          } />
        )}
      </div>

      <div className="timer-controls">
        {state === "idle" && (
          <button type="button" className="btn btn-timer-start" onClick={start} disabled={disabled}>
            <Play size={15} /> Démarrer l'entretien
          </button>
        )}
        {state === "running" && (
          <>
            <button type="button" className="icon-btn timer-btn" onClick={pause} title="Pause">
              <Pause size={18} />
            </button>
            <button type="button" className="btn btn-outline btn-timer-stop" onClick={stop} title="Terminer le chrono">
              <Square size={14} /> Arrêter
            </button>
          </>
        )}
        {state === "paused" && (
          <>
            <button type="button" className="icon-btn timer-btn" onClick={resume} title="Reprendre">
              <Play size={18} />
            </button>
            <button type="button" className="btn btn-outline btn-timer-stop" onClick={stop} title="Terminer le chrono">
              <Square size={14} /> Arrêter
            </button>
          </>
        )}
        {state === "stopped" && (
          <span className="timer-final">Durée enregistrée ✔</span>
        )}
      </div>
    </div>
  );
}
