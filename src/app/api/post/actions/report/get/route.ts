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
      const findPost = await prisma.post.findFirst({
        where: {
          id: postId,
        },
      });

      if (findPost) {
        return NextResponse.json({ ok: true, title: findPost.title });
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
