import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { limiter } from "@/utils/Limiter";

const res = NextResponse;

export async function POST(request: NextRequest) {
  const { title, focus, content } = await request.json();
  const session = await getServerSession(authOptions);

  try {
    if (session) {
      const remainingCalls = await limiter.removeTokens(1);

      if (remainingCalls < 0) {
        return NextResponse.json({
          limit: true,
          msg: "Limit Reached! Max 10 per day",
        });
      }

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
    return res.json({ status: "ERROR", message: "UnAuthorized Access" });
  } catch (err) {
    console.log(err);
    return res.json({ status: "ERROR ", message: "Something went wrong" });
  }
}
