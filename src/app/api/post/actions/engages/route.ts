import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    const session = await getServerSession(authOptions);

    if (session) {
      const existingEngage = await prisma.engage.findFirst({
        where: {
          user: {
            id: session.user.id,
          },
          postId: postId,
        },
      });

      if (!existingEngage) {
        await prisma.engage.create({
          data: {
            postId: postId,
            userId: session.user.id,
          },
        });

        return NextResponse.json({ ok: true, msg: "success" });
      }
      return NextResponse.json({ ok: false, msg: "existing" });
    } else
      return NextResponse.json({
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });
  } catch (err) {
    console.log(err);
    console.log(err);
    return NextResponse.json({ msg: "error", status: "ERROR" });
  }
}
