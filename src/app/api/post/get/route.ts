import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/utils/PrismaConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

async function nullifyUserProperties(post: any) {
  post.userId = null;
  post.user.email = null;
  if (post.anonymous) {
    post.user.name = null;
    post.user.email = null;
    post.user.createdAt = null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { skip, take, order } = await request.json();
    const session = await getServerSession(authOptions);

    if (!session)
      return NextResponse.json({
        msg: "UNAUTHORIZED ACCESS",
        status: "UNAUTHORIZED",
      });

    const postQueryOptions = {
      skip,
      take,
      include: {
        _count: {
          select: { likes: true, reports: true, comments: true, engages: true },
        },
        likes: true,
        comments: true,
        engages: true,
        user: true,
      },
    };

    if (order === "posts") {
      const userPosts = await prisma.post.findMany({
        ...postQueryOptions,
        where: { user: { id: session.user.id } },
        orderBy: { createdAt: "desc" },
      });
      userPosts.forEach(nullifyUserProperties);
      return NextResponse.json(userPosts);
    } else {
      const orderBy =
        order === "asc" || order === "desc"
          ? { createdAt: order }
          : order === "likes" || order === "comments" || order === "engages"
            ? { [order]: { _count: "desc" } }
            : {};

      const posts = await prisma.post.findMany({
        ...postQueryOptions,
        where: {
          OR: [
            {
              user: {
                blacklists: {
                  every: {
                    periodTime: 0,
                    permanent: false,
                    days: 0,
                  },
                },
              },
            },

            {
              NOT: {
                user: {
                  blacklists: {
                    some: {},
                  },
                },
              },
            },
          ],
        },

        orderBy,
      });

      if (!posts) {
        return NextResponse.json({
          msg: "Retrieving Post Data Failed",
          status: "ERROR",
        });
      }

      posts.forEach(nullifyUserProperties);
      return NextResponse.json(posts);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ msg: "An error occurred", status: "ERROR" });
  }
}
