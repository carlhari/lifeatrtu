import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();
  try {
    const getBanData = await prisma.blacklist.findFirst({
      where: {
        userId: userId,
        NOT: {
          periodTime: 0,
          days: 0,
        },
      },
    });

    if (getBanData) {
      return NextResponse.json({
        ok: true,
        existing: true,
        userData: getBanData,
      });
    } else
      return NextResponse.json({
        ok: false,
        existing: false,
        status: "ERROR",
      });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ msg: "error", status: "ERROR" });
  }
}
