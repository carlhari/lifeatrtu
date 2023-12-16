import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { limiter_min } from "./utils/LimiterEach";
import { getServerSession } from "next-auth";
import { authOptions } from "./app/api/auth/[...nextauth]/route";

export default async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const remainingCalls = await limiter_min.removeTokens(1);

  if (remainingCalls < 0) return NextResponse.json({ msg: "Server is Busy" });

  if (!session) return NextResponse.json({ msg: "UnAuthorized Access!" });

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
