import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    const session = await getServerSession(authOptions);

    if (session) {
      const update = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          [type]: 0,
        },
      });

      if (update) {
        return NextResponse.json({
          ok: true,
        });
      } else return NextResponse.json({ ok: false });
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
