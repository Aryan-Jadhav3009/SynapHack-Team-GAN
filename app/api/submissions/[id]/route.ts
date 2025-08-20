import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromToken, verifyAuth } from "@/lib/auth";

const updateSubmissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long").optional(),
  description: z.string().min(1, "Description is required").optional(),
  demoUrl: z.string().url("Invalid demo URL").optional().or(z.literal("")),
  repoUrl: z.string().url("Invalid repository URL").optional().or(z.literal("")),
  videoUrl: z.string().url("Invalid video URL").optional().or(z.literal("")),
  images: z.array(z.string()).optional(),
});

// GET /api/submissions/[id] - Get submission details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }

) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    skills: true,
                  },
                },
              },
            },
            hackathon: true,
          },
        },
        hackathon: {
          select: {
            id: true,
            title: true,
            status: true,
            endDate: true,
            organizerId: true,
          },
        },
        submitter: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        judgments: {
          include: {
            judge: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const hasAccess =
      user.role === "ADMIN" ||
      user.role === "JUDGE" ||
      submission.team.members.some((member) => member.user.id === user.id) ||
      (user.role === "ORGANIZER" && submission.hackathon.organizerId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const submissionWithParsedImages = {
      ...submission,
      images: submission.images
        ? typeof submission.images === "string"
          ? (() => {
              try {
                return JSON.parse(submission.images as string);
              } catch {
                return [];
              }
            })()
          : submission.images
        : [],
    };

    return NextResponse.json(submissionWithParsedImages, { status: 200 });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/submissions/[id] - Update submission
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }

) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            members: {
              where: { userId: user.id },
            },
            hackathon: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Check if user is a team member (we limited members to this user above)
    if (!submission.team || submission.team.members.length === 0) {
      return NextResponse.json({ error: "You are not a member of this team" }, { status: 403 });
    }

    // Check hackathon status (team.hackathon is included)
    if (
      submission.team.hackathon &&
      (submission.team.hackathon.status === "COMPLETED" ||
        submission.team.hackathon.status === "CANCELLED")
    ) {
      return NextResponse.json(
        { error: "Cannot update submission for completed or cancelled hackathon" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = updateSubmissionSchema.parse(body);

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.demoUrl !== undefined && { demoUrl: data.demoUrl || null }),
        ...(data.repoUrl !== undefined && { repoUrl: data.repoUrl || null }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl || null }),
        ...(data.images !== undefined && {
          images: data.images && data.images.length > 0 ? JSON.stringify(data.images) : null,
        }),
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        hackathon: {
          select: {
            id: true,
            title: true,
          },
        },
        submitter: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // parse images before returning so clients always receive string[]
    const updatedWithParsedImages = {
      ...updatedSubmission,
      images: updatedSubmission.images
        ? typeof updatedSubmission.images === "string"
          ? (() => {
              try {
                return JSON.parse(updatedSubmission.images as string);
              } catch {
                return [];
              }
            })()
          : updatedSubmission.images
        : [],
    };

    return NextResponse.json(updatedWithParsedImages, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }

    console.error("Error updating submission:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
