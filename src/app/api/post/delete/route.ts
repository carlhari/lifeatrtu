import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/prismaConfig";

export async function POST(request: NextRequest) {
  const { postId } = await request.json();

  try {
    const deletePost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    if (deletePost) {
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
