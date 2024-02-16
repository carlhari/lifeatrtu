import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const { cdField } = await request.json();
    const session = await getServerSession(authOptions);

    if (session) {
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
          email: session.user.id
        }
      })


    if(user){
      const reset = await prisma.user.update({
        where: {
          id: user.id,
          email: user.email
        },

        data: {
          [cdField]: 0,
        },
      });

      if (reset) {
        return NextResponse.json({ ok: true });
      } else return NextResponse.json({ ok: false });
    } else return NextResponse.json({ok: false, msg:"user data not found", status: "ERROR"})
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
