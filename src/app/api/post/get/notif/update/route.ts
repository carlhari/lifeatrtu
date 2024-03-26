import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  const { reports } = await request.json();
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const updateRead = await prisma.notification.updateMany({
        where: {
          id: {
            in: reports,
          },
        },
        data: {
          read: true,
        },
      });

      if (updateRead) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ ok: false });
    } else
      return NextResponse.json({
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });
  } catch (err) {
    console.error(err);
  }
}
