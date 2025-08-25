const fs = require("fs")
const path = require("path")

// Create .next directory if it doesn't exist
const nextDir = path.join(process.cwd(), ".next")
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true })
  console.log("Created .next directory")
}

// Create empty trace file to prevent ENOENT error
const traceFile = path.join(nextDir, "trace")
if (!fs.existsSync(traceFile)) {
  fs.writeFileSync(traceFile, "", { mode: 0o666 })
  console.log("Created .next/trace file")
} else {
  console.log(".next/trace file already exists")
}
