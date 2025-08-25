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
    console.log("Created .next directory")
  }

  const tracePath = path.join(nextDir, "trace")

  // Create trace file with proper write permissions
  if (!fs.existsSync(tracePath)) {
    fs.writeFileSync(tracePath, "", { mode: 0o666 })
    console.log("Created .next/trace file")
  }

  // Ensure the file is writable
  try {
    fs.accessSync(tracePath, fs.constants.W_OK)
    console.log(".next/trace file is writable")
  } catch (accessErr) {
    console.warn("Warning: .next/trace file may not be writable:", accessErr.message)
    // Try to fix permissions
    fs.chmodSync(tracePath, 0o666)
  }
} catch (e) {
  console.error("Error ensuring .next/trace exists:", e.message)
  // Try alternative approach - create empty .next directory structure
  try {
    const nextDir = path.join(__dirname, ".next")
    const buildManifest = path.join(nextDir, "build-manifest.json")
    const routesManifest = path.join(nextDir, "routes-manifest.json")

    fs.mkdirSync(nextDir, { recursive: true })
    fs.writeFileSync(path.join(nextDir, "trace"), "")
    fs.writeFileSync(buildManifest, "{}")
    fs.writeFileSync(routesManifest, "{}")

    console.log("Created minimal .next structure as fallback")
  } catch (fallbackErr) {
    console.error("Fallback .next creation also failed:", fallbackErr.message)
  }
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
