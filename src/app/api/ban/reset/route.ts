import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  try {
    const user = await prisma.blacklist.findFirst({
      where: {
        userId: userId,
      },
    });

    if (user) {
      const resetBanData = await prisma.blacklist.update({
        where: {
          id: user.id,
          userId: userId,
        },

        data: {
          periodTime: 0,
          permanent: false,
          days: 0,
        },
      });
      if (resetBanData) return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ ok: false });
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ msg: "error", status: "ERROR" });
  }
}
