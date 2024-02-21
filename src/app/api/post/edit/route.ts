import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import translate from "@iamtraction/google-translate";
import { limiter_min } from "@/utils/LimiterEach";
import { sentimentAnalyzer } from "@/utils/sentiment";
import { getRemainingTime } from "@/utils/CountDown";

export async function POST(request: NextRequest) {
  try {
    const { title, focus, content, anonymous, image, postId } =
      await request.json();

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
          title,
        );

        const sentimentResult = await sentimentAnalyzer(
          translated.text,
          content,
        );

        if (sentimentResult !== "n" && sentimentResultTitle !== "n") {
          const dt = new Date();

          const time = dt.getTime();

          const addPost = await prisma.post.update({
            where: {
              id: postId,
            },
            data: {
              title: title,
              focus: focus,
              content: content,
              anonymous: anonymous,
              image: image,
              userId: session.user.id,
            },
          });

          if (addPost) {
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

            if (post) {
              if (post.anonymous !== true) {
                const newPost = {
                  ...post,
                  user: { ...post.user, name: null, email: null },
                };

                return NextResponse.json({
                  msg: "Post Added",
                  post: newPost,
                });
              } else {
                return NextResponse.json({
                  msg: "Post Added",
                  post: post,
                });
              }
            } else {
              return NextResponse.json({
                msg: "Failed to retrieve the newly added post",
                status: "FAILED",
              });
            }
          } else {
            return NextResponse.json({
              msg: "Failed to add post",
              status: "FAILED",
            });
          }
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
