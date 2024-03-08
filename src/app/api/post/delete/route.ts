import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { limiter_delete } from "@/utils/LimiterDelete";

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    const session = await getServerSession(authOptions);
    const remainingCallsMin = await limiter_delete.removeTokens(1);

    if (session) {
      if (remainingCallsMin > 0) {
        const userData = await prisma.user.findFirst({
          where: {
            id: session.user.id,
          },
          select: {
            deleteTime: true,
          },
        });

        const dt = new Date();
        const startingTime = dt.getTime();

        if (
          userData?.deleteTime === 0 ||
          userData?.deleteTime === null ||
          userData?.deleteTime === undefined
        ) {
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
            await prisma.notification.deleteMany({
              where: {
                postId: postId,
              },
            });

            await prisma.report.deleteMany({
              where: {
                postId: postId,
              },
            });

            await prisma.like.deleteMany({
              where: {
                postId: postId,
              },
            });

            await prisma.comment.deleteMany({
              where: {
                postId: postId,
              },
            });

            await prisma.engage.deleteMany({
              where: {
                postId: postId,
              },
            });

            const timeUpdate = await prisma.user.update({
              where: {
                id: session.user.id,
              },
              data: {
                deleteTime: startingTime,
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
            ok: false,
            status: "ERROR",
            msg: "Please wait to Cooldown",
          });
      } else
        return NextResponse.json({ msg: "Server is Busy", status: "BUSY" });
    } else
      return NextResponse.json({
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, msg: "ERROR", status: "ERROR" });
  }
}
