import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import translate from "@iamtraction/google-translate";
import { limiter_min } from "@/utils/LimiterEach";

const vader = require("crowd-sentiment");

const sentimentAnalyzer = async (text: string, origText: string) => {
  const translated = await vader.SentimentIntensityAnalyzer.polarity_scores(
    text
  );
  const orig = await vader.SentimentIntensityAnalyzer.polarity_scores(origText);

  const intensity = translated.compound + orig.compound / 2;
  if (intensity >= 0.05) {
    return "p"; // positive
  } else if (intensity <= -0.05) {
    return "n"; // negative
  } else {
    return "m"; // median/neutral
  }
};

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
        const sentimentResult = await sentimentAnalyzer(
          translated.text,
          content
        );

        if (sentimentResult !== "n") {
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
              },
            });
            console.log(post);

            if (post)
              return NextResponse.json({ msg: "Post Added", post: post });
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
