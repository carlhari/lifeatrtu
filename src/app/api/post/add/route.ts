import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { limiter } from "@/utils/Limiter";
import { translate } from "bing-translate-api";
const vader = require("crowd-sentiment");

const sentimentAnalyzer = (text: string, origText: string) => {
  const translated = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  const orig = vader.SentimentIntensityAnalyzer.polarity_scores(origText);

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
  const { title, focus, content } = await request.json();
  const session = await getServerSession(authOptions);
  const result = await translate(content, "fil", "en");

  try {
    if (session) {
      if (result) {
        const text = sentimentAnalyzer(result.translation, content);
        return NextResponse.json({ result: text });
        // if (text !== "n") {
        //   const remainingCalls = await limiter.removeTokens(1);
        //   if (remainingCalls < 0) {
        //     return NextResponse.json({
        //       limit: true,
        //       msg: "Limit Reached! Max 10 per day",
        //     });
        //   }

        //   const user = await prisma.user.findFirst({
        //     where: {
        //       id: session.user.id,
        //     },
        //   });

        //   if (user) {
        //     await prisma.post.create({
        //       data: {
        //         title: title,
        //         focus: focus,
        //         content: content,
        //         userId: user.id,
        //       },
        //     });
        //     return NextResponse.json({ ok: true });
        //   }
        //   return NextResponse.json({ ok: false });
        // }
        // return NextResponse.json({ result: text });
      }
    }
    return NextResponse.json({
      status: "ERROR",
      message: "UnAuthorized Access",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      status: "ERROR ",
      message: "Something went wrong",
    });
  }
}
