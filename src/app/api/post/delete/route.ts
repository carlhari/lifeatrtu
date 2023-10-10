import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/prismaConfig";

export async function POST(request: NextRequest) {
  const { postId } = await request.json();

  try {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
    });

    if (post) {
      const deletePost = await prisma.post.delete({
        where: {
          id: post.id,
        },
      });

      if (deletePost) {
        return NextResponse.json({ success: true });
      }
    }
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
