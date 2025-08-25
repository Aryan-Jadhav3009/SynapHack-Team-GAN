const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const fs = require("fs")
const path = require("path")

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "0.0.0.0"
const port = process.env.PORT || 8080

console.log(`Starting server in ${dev ? "development" : "production"} mode`)
console.log(`Hostname: ${hostname}, Port: ${port}`)

const nextDir = path.join(process.cwd(), ".next")
if (!fs.existsSync(nextDir)) {
  console.error("❌ .next directory not found. Build should have been completed during deployment.")
  console.error("If you're running locally, run 'npm run build' first")
  process.exit(1)
} else {
  console.log("✅ .next directory found")
}

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  process.exit(0)
})

app
  .prepare()
  .then(() => {
    console.log("Next.js app prepared successfully")
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error("Error occurred handling", req.url, err)
        res.statusCode = 500
        res.end("internal server error")
      }
    })

    server
      .once("error", (err) => {
        console.error("Server error:", err)
        process.exit(1)
      })
      .listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
        console.log(`> Environment: ${process.env.NODE_ENV}`)
      })
  })
  .catch((err) => {
    console.error("Failed to prepare Next.js app:", err)
    console.error("This usually means the .next directory is missing or corrupted")
    process.exit(1)
  })
