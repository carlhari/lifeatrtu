import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      const cd = await prisma.user.findUnique({
        where: {
          id: session.user.id,
          email: session.user.email,
        },

        select: {
          cooldownDelete: true,
          cooldownEdit: true,
          cooldownPost: true,
        },
      });

      if (cd) {
        return NextResponse.json({
          ok: true,
          postTime: cd.cooldownPost,
          deleteTime: cd.cooldownDelete,
          editTime: cd.cooldownEdit,
        });
      } else return NextResponse.json({ok:false, msg:"error getting data", status: "ERROR"})
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
