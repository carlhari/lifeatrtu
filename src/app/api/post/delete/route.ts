import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { limiter_delete } from "@/utils/LimiterDelete";
import { getRemainingTime } from "@/utils/CountDown";

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    const session = await getServerSession(authOptions);
    const remainingCallsMin = await limiter_delete.removeTokens(1);

    if (session) {
      const dt = new Date();
      const time = dt.getTime();

      if (remainingCallsMin > 0) {
        const getCD = await prisma.user.findUnique({
          where: {
            id: session.user.id,
            email: session.user.email,
          },

          select: {
            cooldownDelete: true,
          },
        });

        if (getCD) {
          const remaining = getRemainingTime(getCD.cooldownDelete);

          if (remaining === 0) {
            const deletePost = await prisma.post.delete({
              where: {
                id: postId,
                user: {
                  id: session.user.id,
                  email: session.user.email,
                },
              },
            });

            if (deletePost) {
              const updateTime = await prisma.user.update({
                where: {
                  id: session.user.id,
                },
                data: {
                  cooldownDelete: time,
                },
              });

              return NextResponse.json({
                ok: true,
                msg: "Successfully Delete",
              });
            } else
              return NextResponse.json({
                msg: "Failed To Delete",
                status: "ERROR",
              });
          } else
            return NextResponse.json({
              msg: "Cooldown period not yet finished",
              status: "ERROR",
            });
        }
      } else
        return NextResponse.json({ msg: "Server is Busy", status: "BUSY" });
    } else
      return NextResponse.json({
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });
  } catch (err) {
    console.error(err);
  }
}
