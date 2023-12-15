import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const res = NextResponse;

export async function POST(request: NextRequest) {
  const { title, focus, content } = await request.json();
  const session = await getServerSession(authOptions);

  try {
    if (session) {
      const user = await prisma.user.findFirst({
        where: {
          id: session.user.id,
        },
      });

      if (user) {
        await prisma.post.create({
          data: {
            title: title,
            focus: focus,
            content: content,
            userId: user.id,
          },
        });

        return res.json({ ok: true });
      }

      return res.json({ ok: false });
    }
    return res.json({ message: "UnAuthorized Access" });
  } catch (err) {
    console.log(err);
    return res.json({ message: "Something went wrong" });
  }
}
