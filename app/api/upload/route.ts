import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { azureBlobService } from "@/lib/azure-blob"

// POST /api/upload - Upload file to Azure Blob Storage
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      // Presentations
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ]

    let maxSize = 10 * 1024 * 1024 // 10MB for images
    if (file.type.includes("presentation") || file.type.includes("powerpoint")) {
      maxSize = 50 * 1024 * 1024 // 50MB for presentations
    } else if (file.type.includes("pdf") || file.type.includes("word")) {
      maxSize = 25 * 1024 * 1024 // 25MB for documents
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Supported: Images (JPG, PNG, GIF, WebP), Documents (PDF, DOC, DOCX), Presentations (PPT, PPTX)",
        },
        { status: 400 },
      )
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeMB}MB for this file type.` },
        { status: 400 },
      )
    }

    // Generate unique filename with proper categorization
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    let category = "submissions"

    if (file.type.includes("image")) {
      category = "submissions/images"
    } else if (file.type.includes("presentation") || file.type.includes("powerpoint")) {
      category = "submissions/presentations"
    } else if (file.type.includes("pdf") || file.type.includes("word")) {
      category = "submissions/documents"
    }

    const fileName = `${category}/${user.id}/${timestamp}.${extension}`

    try {
      const url = await azureBlobService.uploadFile(file, fileName)
      return NextResponse.json({
        url,
        fileName,
        fileType: file.type,
        fileSize: file.size,
        category,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in upload endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
