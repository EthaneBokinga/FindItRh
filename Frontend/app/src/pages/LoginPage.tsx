import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import RouteArt from "../components/RouteArt";
import { ROUTES } from "../config";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={ROUTES.candidates} replace />;

  return (
    <main className="login">
      <section className="login-card">
        <RouteArt />
        <div className="login-form">
          <div className="login-brand">
            <img src="/logo.jpeg" alt="Find it" className="login-logo" />
          </div>

          <div className="login-copy">
            <h1 className="login-title">Bienvenue</h1>
            <p className="login-subtitle">Espace recruteurs · Collecteurs de lieux</p>
          </div>

          <div className="google-wrap">
            <GoogleLogin
              shape="pill"
              size="large"
              width="290"
              text="continue_with"
              onSuccess={async (res) => {
                if (!res.credential) return;
                setBusy(true);
                setError("");
                try { await login(res.credential); }
                catch (e) { setError((e as Error).message); }
                finally { setBusy(false); }
              }}
              onError={() => setError("Connexion Google annulée ou impossible")}
            />
          </div>

          {busy && (
            <div className="login-loading">
              <div className="login-spinner" />
              <span>Vérification…</span>
            </div>
          )}

          {error && <p className="error login-error" role="alert">{error}</p>}

          <p className="login-note">Accès réservé aux recruteurs Find it autorisés.</p>

          <div className="login-footer-dots">
            <span /><span /><span />
          </div>
        </div>
      </section>
    </main>
  );
}
