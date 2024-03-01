import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { limiter_comment } from "@/utils/LimiterComment";
import translate from "@iamtraction/google-translate";
import { sentimentAnalyzer } from "@/utils/sentiment";

const vader = require("crowd-sentiment");

export async function POST(request: NextRequest) {
  try {
    const { postId, content, author } = await request.json();
    const session = await getServerSession(authOptions);
    const remainingTokens = await limiter_comment.removeTokens(1);

    if (session) {
      if (remainingTokens > 0) {
        const translated = await translate(content, { from: "tl", to: "en" });

        const result = await sentimentAnalyzer(translated.text, content);

        if (result !== "n") {
          const post = await prisma.post.findFirst({
            where: {
              id: postId,
            },
            include: {
              user: true,
            },
          });

          if (post) {
            const existingNotification = await prisma.notification.findFirst({
              where: {
                postId: postId,
                userId: session.user.id,
                type: "comment",
              },
            });

            const comment = await prisma.comment.create({
              data: {
                postId: postId,
                content: content,
                userId: session?.user.id,
              },
            });

            if (post.user.id !== author) {
              if (!existingNotification) {
                await prisma.notification.create({
                  data: {
                    postId: post.id,
                    userId: session.user.id,
                    read: false,
                    type: "comment",
                  },
                });
              }
            }

            return NextResponse.json({
              ok: true,
              msg: "Comment Added",
              comment: comment,
              author: post.user.id,
              title: post.title,
            });
          } else
            return NextResponse.json({
              ok: false,
              msg: "Failed to Add Comment",
              status: "ERROR",
            });
        } else
          return NextResponse.json({
            msg: "Negative Post.",
            status: "NEGATIVE",
          });
      } else
        return NextResponse.json({
          msg: "Server is Busy, Please Try again Later",
          status: "BUSY",
        });
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
