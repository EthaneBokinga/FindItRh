export default function Splash({ message }: { message?: string }) {
  return (
    <div className="splash">
      <img src="/logo.jpeg" alt="Find it" className="splash-logo" />
      {!message || message.startsWith("Démarrage") ? <div className="spinner" /> : null}
      {message && <p>{message}</p>}
    </div>
  );
}
