import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const notifs = await prisma.notification.findMany({
        where: {
          post: {
            userId: session.user.id,
          },
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },

          post: {
            select: {
              title: true,
            },
          },
        },
      });

      if (notifs) {
        return NextResponse.json({ ok: true, notifs: notifs });
      } else
        return NextResponse.json({ ok: false, msg: "empty", status: "EMPTY" });
    } else
      return NextResponse.json({
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });
  } catch (err) {
    console.error(err);
  }
}
