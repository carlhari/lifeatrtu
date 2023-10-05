import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/prismaConfig";
const res = NextResponse;

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          name: name,
          email: email,
        },
      });
      return res.json({ success: true, email, name });
    } else {
      return res.json({
        added: false,
        message: "User with this email already exists",
      });
    }
  } catch (err) {
    console.error(err);
    return res.json({ success: false });
  }
}
