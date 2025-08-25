const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "localhost"
const port = process.env.PORT || 8080

console.log(`Starting server in ${dev ? "development" : "production"} mode`)
console.log(`Hostname: ${hostname}, Port: ${port}`)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app
  .prepare()
  .then(() => {
    console.log("Next.js app prepared successfully")
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error("Error occurred handling", req.url, err)
        res.statusCode = 500
        res.end("internal server error")
      }
    })
      .once("error", (err) => {
        console.error("Server error:", err)
        process.exit(1)
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
      })
  })
  .catch((err) => {
    console.error("Failed to prepare Next.js app:", err)
    console.error("This usually means the .next directory is missing or corrupted")
    console.error("Try running 'npm run build' first")
    process.exit(1)
  })
