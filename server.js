const { createServer } = require("http")
const { parse } = require("url")
const fs = require("fs")
const path = require("path")
const next = require("next")

// --- Ensure .next and .next/trace exist before Next runs ---
try {
  const nextDir = path.join(__dirname, ".next")
  if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir, { recursive: true })
  }
  const tracePath = path.join(nextDir, "trace")
  // create file if missing (open with 'a' creates it)
  const fd = fs.openSync(tracePath, "a")
  fs.closeSync(fd)
} catch (e) {
  // log warning but continue (defensive)
  console.error("Warning: could not ensure .next/trace exists:", e && e.stack ? e.stack : e)
}
// ------------------------------------------------------------

const dev = process.env.NODE_ENV !== "production"
const port = process.env.PORT || 8080
const hostname = "0.0.0.0" // listen on all interfaces

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error("Error occurred handling", req.url, err && err.stack ? err.stack : err)
        res.statusCode = 500
        res.end("internal server error")
      }
    })
      .once("error", (err) => {
        console.error("Server error:", err && err.stack ? err.stack : err)
        process.exit(1)
      })
      .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
      })
  })
  .catch((err) => {
    console.error("App prepare failed:", err && err.stack ? err.stack : err)
    process.exit(1)
  })
