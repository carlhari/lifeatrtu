import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    const session = await getServerSession(authOptions);
    let done;

    if (session) {
      const reportPost = await prisma.post.update({
        where: {
          id: postId,
        },

        data: {
          reported: true,
        },
      });

      const existingReport = await prisma.report.findFirst({
        where: {
          userId: session.user.id,
          postId: postId,
        },
      });

      if (!existingReport) {
        const createReport = await prisma.report.create({
          data: {
            postId: postId,
            userId: session.user.id,
            disregard: false,
          },
        });

        if (createReport) {
          done = true;
        }
      } else {
        const updateReport = await prisma.report.create({
          data: {
            postId: postId,
            userId: session.user.id,
            disregard: false,
          },
        });

        if (updateReport) {
          done = true;
        }
      }

      if (reportPost && done) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ ok: false });
    } else
      return NextResponse.json({
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ msg: "Error", status: "ERROR" });
  }
}
