import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      const existingUser = await prisma.user.findUnique({
        where: {
          id: session.user.id,
          email: session.user.email,
        },

        select: {
          deleteTime: true,
        },
      });

      if (existingUser) {
        return NextResponse.json({
          ok: true,
          msg: "existing user",
          startingTime: existingUser.deleteTime,
        });
      } else return NextResponse.json({ ok: false, msg: "not existing user" });
    } else
      return NextResponse.json({
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ ok: false, msg: "error", status: "ERROR" });
  }
}
