import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const { postId, content } = await request.json();
    const session = await getServerSession(authOptions);

    if (session) {
      const comment = await prisma.comment.create({
        data: {
          postId: postId,
          content: content,
          userId: session?.user.id,
        },
      });

      if (comment) {
        return NextResponse.json({
          ok: true,
          msg: "Comment Added",
          comment: comment,
        });
      } else return NextResponse.json({ ok: false, msg: "Failed to Comment" });
    } else
      return NextResponse.json({
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ msg: "error", status: "ERROR" });
  }
}
