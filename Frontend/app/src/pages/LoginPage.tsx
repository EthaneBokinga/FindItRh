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
          <img src="/logo.jpeg" alt="Find it" className="login-logo" />
          <h1>Connexion</h1>
          <p className="muted">Espace recruteurs · Collecteurs de lieux</p>

          <div className="google-wrap">
            <GoogleLogin
              shape="pill"
              size="large"
              width="280"
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
          {busy && <p className="muted">Vérification…</p>}
          {error && <p className="error" role="alert">{error}</p>}
          <p className="login-note">Accès réservé aux recruteurs Find it autorisés.</p>
        </div>
      </section>
    </main>
  );
}
