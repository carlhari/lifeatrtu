import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/prismaConfig";

export async function POST(request: NextRequest) {
  const { formData } = await request.json();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: formData.email,
      },
    });

    if (user) {
      await prisma.post.create({
        data: {
          content: formData.content,
          concern: formData.concern,
          isChecked: formData.postAs,
          title: formData.title,
          userId: user.id,
          image: formData.image,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false });
  }
}
