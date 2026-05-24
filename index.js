const crypto = require("crypto");
const express = require("express");
const { getQuote } = require("./quotes");
const github = require("./github");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse raw body for signature verification, then JSON
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

function verifySignature(req) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification if no secret configured

  const sig = req.headers["x-hub-signature-256"];
  if (!sig) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(req.rawBody);
  const expected = "sha256=" + hmac.digest("hex");

  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

function resolveAction(event, payload) {
  if (event === "pull_request") {
    const action = payload.action;
    if (action === "opened" || action === "reopened") return "opened";
    if (action === "synchronize") return "synchronize";
    if (action === "review_requested") return "review_requested";
    if (action === "closed") return "closed";
  }

  if (event === "pull_request_review") {
    const state = payload.review?.state;
    if (state === "approved") return "submitted_approved";
    if (state === "changes_requested") return "submitted_changes_requested";
  }

  return null;
}

app.post("/webhook", async (req, res) => {
  if (!verifySignature(req)) {
    console.log("Invalid signature - rejecting request");
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  const payload = req.body;

  // Ignore non-PR events
  if (event !== "pull_request" && event !== "pull_request_review") {
    return res.status(200).send("Ignored");
  }

  const action = resolveAction(event, payload);
  if (!action) {
    return res.status(200).send("Ignored action");
  }

  const quote = getQuote(action);
  if (!quote) {
    return res.status(200).send("No quote for this action");
  }

  const pr = payload.pull_request;
  const owner = pr.base.repo.owner.login;
  const repo = pr.base.repo.name;
  const prNumber = pr.number;

  try {
    await github.postComment(owner, repo, prNumber, quote);
    res.status(200).send("Comment posted");
  } catch (err) {
    console.error("Failed to post comment:", err.message);
    res.status(500).send("Error posting comment");
  }
});

app.get("/", (_req, res) => {
  res.send("Cartman PR Bot is running! Respect my authoritah!");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", bot: "cartman" });
});

github.init();
app.listen(PORT, () => {
  console.log(`Cartman bot listening on port ${PORT}`);
});
