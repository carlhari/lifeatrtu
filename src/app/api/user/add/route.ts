import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/prismaConfig";
import { UserData } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { email, name }: UserData = req.body;

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

        res.json({
          success: true,
          message: "Added Successfully in the database",
        });
      } else {
        res.json({
          success: false,
          message: "User with this email already exists",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "An error occurred" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
