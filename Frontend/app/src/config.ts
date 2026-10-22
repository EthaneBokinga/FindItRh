// Source unique des constantes du frontend (DRY)
export const APP_NAME = "Find it · Recrutement";
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || "/api";
export const AUTH_EXPIRED_EVENT = "findit:auth-expired";
export const STORAGE_KEYS = { token: "findit.token" } as const;

export const ROUTES = {
  login: "/login",
  candidates: "/",
  candidatePattern: "/candidates/:id",
  candidate: (id: string) => `/candidates/${id}`,
} as const;

export const STATUS_LABELS = { pending: "À faire", in_progress: "En cours", done: "Terminé" } as const;
export const STATUS_FILTERS = [
  { key: "", label: "Tous" },
  { key: "pending", label: STATUS_LABELS.pending },
  { key: "in_progress", label: STATUS_LABELS.in_progress },
  { key: "done", label: STATUS_LABELS.done },
] as const;

export const VERDICTS = {
  good: { label: "Recommandé", tone: "good" },
  mid: { label: "À considérer", tone: "mid" },
  low: { label: "Non recommandé", tone: "low" },
  eliminated: { label: "Éliminatoire", tone: "bad" },
} as const;

export const CORE_FIELDS = [
  { key: "phone", label: "Téléphone" },
  { key: "email", label: "Email" },
  { key: "city", label: "Ville" },
  { key: "district", label: "Quartier / zone" },
] as const;

export const SEARCH_DEBOUNCE_MS = 300;
export const PHOTO = { maxSize: 720, quality: 0.6 } as const;
export const CV_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";
