import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/prismaConfig";
import { UserData } from "@/types";

export async function POST(request: NextRequest) {
  const { email, name }: UserData = await request.json();

  try {
    const existing = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          email: email,
          name: name,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Added Successfully in database",
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "User with this email already exists",
      });
    }
  } catch (err) {
    console.error(err);
    throw new Error("Error Occured");
  }
}
