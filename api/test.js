export default function handler(req, res) {
  res.status(200).json({
    message: "✅ API connection successful — Springsign is live!",
    timestamp: new Date().toISOString(),
  });
}
