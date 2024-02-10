import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import translate from "@iamtraction/google-translate";
import { limiter_min } from "@/utils/LimiterEach";
import { sentimentAnalyzer } from "@/utils/sentiment";

export async function POST(request: NextRequest) {
  try {
    const { title, focus, content, anonymous, image } = await request.json();

    const session = await getServerSession(authOptions);

    const remainingCallsMin = await limiter_min.removeTokens(1);

    if (session) {
      if (remainingCallsMin > 0) {
        const translated = await translate(content, {
          from: "tl",
          to: "en",
        });

        const translatedTitle = await translate(title, {
          from: "tl",
          to: "en",
        });

        const sentimentResultTitle = await sentimentAnalyzer(
          translatedTitle.text,
          title
        );

        const sentimentResult = await sentimentAnalyzer(
          translated.text,
          content
        );

        if (sentimentResult !== "n" && sentimentResultTitle !== "n") {
          const dt = new Date();

          const time = dt.getTime();

          const addPost = await prisma.post.create({
            data: {
              title: title,
              focus: focus,
              content: content,
              anonymous: anonymous,
              image: image,
              userId: session.user.id,
            },
          });

          const user = await prisma.user.update({
            where: {
              id: session.user.id,
            },
            data: {
              cooldownPost: time,
            },
          });

          if (addPost && user) {
            const post = await prisma.post.findUnique({
              where: {
                id: addPost.id,
              },
              include: {
                _count: {
                  select: {
                    likes: true,
                    reports: true,
                    comments: true,
                    engages: true,
                  },
                },
                likes: true,
                comments: true,
                engages: true,
                user: true,
              },
            });

            const getCD = await prisma.user.findUnique({
              where: {
                id: session.user.id,
              },

              select: {
                cooldownPost: true,
              },
            });

            if (post && getCD && getCD.cooldownPost) {
              const currentTime = new Date().getTime();

              const remaining = Math.max(
                0,
                Math.floor(
                  getCD.cooldownPost + 1 * 60 * 60 * 1000 - currentTime
                ) / 1000
              );

              if (post.anonymous !== true) {
                const newPost = {
                  ...post,
                  user: { ...post.user, name: null, email: null },
                };

                return NextResponse.json({
                  msg: "Post Added",
                  post: newPost,
                  remaining: remaining,
                });
              } else
                return NextResponse.json({
                  msg: "Failed to Process Post",
                  status: "FAILED",
                });
            }
          } else
            return NextResponse.json({
              msg: "Failed to Add Post",
              status: "FAILED",
            });
        } else
          return NextResponse.json({
            msg: "Negative Post.",
            status: "NEGATIVE",
          });
      } else
        return NextResponse.json({ msg: "Server is Busy", status: "BUSY" });
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
