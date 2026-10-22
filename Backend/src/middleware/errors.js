export function notFound(_req, res) {
  res.status(404).json({ message: "Route introuvable" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || (err.name === "MulterError" ? 400 : 500);
  if (status >= 500) console.error(err);
  const message =
    err.code === "LIMIT_FILE_SIZE" ? "Fichier trop lourd (5 Mo maximum)" : status >= 500 ? "Erreur serveur" : err.message;
  res.status(status).json({ message });
}
