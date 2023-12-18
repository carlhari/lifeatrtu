import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { limiter_min } from "./utils/LimiterEach";

export default async function middleware(request: NextRequest) {
  // const remainingCalls = await limiter_min.removeTokens(1);

  // if (remainingCalls < 0) return NextResponse.json({ msg: "Server is Busy" });

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
