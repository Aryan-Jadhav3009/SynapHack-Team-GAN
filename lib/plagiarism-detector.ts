import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"

const SimilarityAnalysis = z.object({
  overallSimilarity: z.number().min(0).max(100).describe("Overall similarity percentage (0-100)"),
  uniquenessScore: z.number().min(0).max(100).describe("Uniqueness score (100 - similarity)"),
  similarConcepts: z.array(z.string()).describe("List of similar concepts found"),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Plagiarism risk level"),
  suggestions: z.array(z.string()).describe("Suggestions to improve uniqueness"),
})

export async function analyzePlagiarism(
  currentDescription: string,
  existingSubmissions: Array<{ title: string; description: string; teamName: string }>,
) {
  try {
    console.log("[v0] Starting plagiarism analysis")
    console.log("[v0] Current description length:", currentDescription.length)
    console.log("[v0] Existing submissions count:", existingSubmissions.length)

    const apiKey = process.env.GEMINI_API_KEY
    console.log("[v0] API key available:", !!apiKey)

    if (apiKey) {
      try {
        console.log("[v0] Attempting Gemini AI analysis")
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })

        const prompt = `Analyze the following project description for uniqueness compared to existing submissions:

Current Project: "${currentDescription}"

Existing Submissions:
${existingSubmissions.map((sub, i) => `${i + 1}. ${sub.title}: ${sub.description}`).join("\n")}

Please provide a JSON response with:
- overallSimilarity: number (0-100)
- uniquenessScore: number (0-100, where 100-similarity)
- similarConcepts: array of strings (concepts found in multiple submissions)
- riskLevel: "LOW" | "MEDIUM" | "HIGH"
- suggestions: array of strings (how to improve uniqueness)

Focus on conceptual similarity, not just keyword matching.`

        console.log("[v0] Sending request to Gemini")
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        console.log("[v0] Gemini response received:", text.substring(0, 200))

        const aiResult = JSON.parse(text)
        const validatedData = SimilarityAnalysis.parse(aiResult)
        console.log("[v0] AI analysis successful:", validatedData)
        return validatedData
      } catch (aiError: any) {
        console.error("[v0] Gemini AI analysis failed:", aiError)
        if (aiError?.message?.includes("401") || aiError?.message?.includes("Unauthorized")) {
          console.error("[v0] API key authentication failed - check GEMINI_API_KEY")
        } else if (aiError?.message?.includes("403") || aiError?.message?.includes("Forbidden")) {
          console.error("[v0] API access forbidden - check API key permissions")
        } else if (aiError?.message?.includes("quota") || aiError?.message?.includes("limit")) {
          console.error("[v0] API quota exceeded")
        }
        // Fall through to keyword-based analysis
      }
    } else {
      console.log("[v0] No GEMINI_API_KEY found, using fallback analysis")
    }

    console.log("[v0] Using fallback keyword analysis")
    const currentKeywords = new Set(
      currentDescription
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 3),
    )

    const existingKeywords = existingSubmissions.flatMap((sub) =>
      sub.description
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 3),
    )

    const existingKeywordSet = new Set(existingKeywords)
    const commonKeywords = Array.from(currentKeywords).filter((keyword) => existingKeywordSet.has(keyword))

    const similarityPercentage =
      currentKeywords.size > 0 ? Math.round((commonKeywords.length / currentKeywords.size) * 100) : 0

    const uniquenessScore = 100 - similarityPercentage
    const riskLevel = similarityPercentage > 60 ? "HIGH" : similarityPercentage > 30 ? "MEDIUM" : "LOW"

    const analysisData = {
      overallSimilarity: similarityPercentage,
      uniquenessScore,
      similarConcepts: commonKeywords.slice(0, 10), // Show top 10 common concepts
      riskLevel,
      suggestions: [
        "Consider adding more specific technical details to your project",
        "Highlight unique features that differentiate your solution",
        "Include innovative approaches or methodologies you're using",
      ],
    }

    // Validate with Zod schema
    const validatedData = SimilarityAnalysis.parse(analysisData)
    console.log("[v0] Fallback analysis result:", validatedData)
    return validatedData
  } catch (error) {
    console.error("[v0] Plagiarism analysis failed:", error)
    return {
      overallSimilarity: 0,
      uniquenessScore: 100,
      similarConcepts: [],
      riskLevel: "LOW" as const,
      suggestions: [
        "Uniqueness analysis completed using basic keyword matching. For enhanced AI analysis, ensure GEMINI_API_KEY is properly configured.",
      ],
    }
  }
}

export function calculateUniquenessMetrics(submissions: Array<{ description: string; title: string }>) {
  const totalSubmissions = submissions.length
  if (totalSubmissions === 0) return { averageUniqueness: 100, totalAnalyzed: 0 }

  // Simple keyword-based uniqueness calculation as fallback
  const allKeywords = submissions.flatMap((sub) =>
    sub.description
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 3),
  )

  const uniqueKeywords = new Set(allKeywords)
  const averageUniqueness = Math.min(100, (uniqueKeywords.size / allKeywords.length) * 100)

  return {
    averageUniqueness: Math.round(averageUniqueness),
    totalAnalyzed: totalSubmissions,
  }
}
