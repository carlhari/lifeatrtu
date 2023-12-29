import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

import { limiter_min } from "@/utils/LimiterEach";

export async function POST(request: NextRequest) {
  try {
    const { skip, take } = await request.json();
    const session = await getServerSession(authOptions);
    const remainingTokens = await limiter_min.removeTokens(1);
    if (session) {
      if (remainingTokens > 0) {
        const posts = await prisma.post.findMany();

        if (posts) {
          return NextResponse.json(posts);
        } else
          return NextResponse.json({
            msg: "Retriving Post Data Failed",
            status: "ERROR",
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
