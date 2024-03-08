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
          title,
        );

        const sentimentResult = await sentimentAnalyzer(
          translated.text,
          content,
        );

        if (sentimentResult !== "n" && sentimentResultTitle !== "n") {
          const userData = await prisma.user.findFirst({
            where: {
              id: session.user.id,
            },

            select: {
              postTime: true,
            },
          });

          const dt = new Date();
          const startingTime = dt.getTime();

          if (
            userData?.postTime === 0 ||
            userData?.postTime === null ||
            userData?.postTime === undefined
          ) {
            const addPost = await prisma.post.create({
              data: {
                title: title,
                focus: focus,
                content: content,
                anonymous: anonymous,
                image: image,
                userId: session.user.id,
                pending: false
              },
              include: {
                user: true,
              },
            });

            const post = await prisma.post.findUnique({
              where: {
                id: addPost.id,
                user: {
                  id: addPost.user.id,
                },
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
              const timeUpdate = await prisma.user.update({
                where: {
                  id: session.user.id,
                },
                data: {
                  postTime: startingTime,
                },
              });

              if (post.anonymous !== true) {
                const newPost = {
                  ...post,
                  user: { ...post.user, name: null, email: null },
                };

                return NextResponse.json({
                  ok: true,
                  msg: "Post Added",
                  post: newPost,
                });
              } else {
                return NextResponse.json({
                  ok: true,
                  msg: "Post Added",
                  post: post,
                });
              }
            } else
              return NextResponse.json({
                ok: false,
                msg: "Failed to retrieve the newly added post",
                status: "FAILED",
              });
          } else
            return NextResponse.json({
              ok: false,
              msg: "Please wait to cooldown",
              status: "ERROR",
            });
        } else
          return NextResponse.json({
            ok: false,
            msg: "Negative Post.",
            status: "NEGATIVE",
          });
      } else
        return NextResponse.json({
          ok: false,
          msg: "Server is Busy",
          status: "BUSY",
        });
    } else
      return NextResponse.json({
        ok: false,
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ msg: "error", status: "ERROR" });
  }
}
