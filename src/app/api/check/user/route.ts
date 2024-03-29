import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      const existingUser = await prisma.user.findFirst({
        where: {
          id: session.user.id,
          email: session.user.email,
        },
      });

      const checkBan = await prisma.blacklist.findFirst({
        where: {
          userId: session.user.id,
          email: session.user.email,
          NOT: {
            periodTime: 0,
            permanent: false,
            days: 0,
          },
        },
      });

      if (checkBan) {
        return NextResponse.json({ ok: true, msg: "ban" });
      }

      if (existingUser) {
        return NextResponse.json({ ok: true, msg: "existing" });
      } else return NextResponse.json({ ok: false, msg: "not" });
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
