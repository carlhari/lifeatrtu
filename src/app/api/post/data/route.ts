import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/prismaConfig";

export async function POST(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
      },
    });

    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
