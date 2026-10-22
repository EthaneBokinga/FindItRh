import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api";
import Splash from "./components/Splash";
import { ROUTES } from "./config";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CandidatePage from "./pages/CandidatePage";
import CandidatesPage from "./pages/CandidatesPage";
import LoginPage from "./pages/LoginPage";
import type { PublicConfig } from "./types";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  return user ? <>{children}</> : <Navigate to={ROUTES.login} replace />;
}

export default function App() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.config().then(setConfig).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <Splash message={`Impossible de joindre le serveur : ${error}`} />;
  if (!config) return <Splash message="Démarrage du serveur…" />;

  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.candidates} element={<RequireAuth><CandidatesPage /></RequireAuth>} />
            <Route path={ROUTES.candidatePattern} element={<RequireAuth><CandidatePage /></RequireAuth>} />
            <Route path="*" element={<Navigate to={ROUTES.candidates} replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
