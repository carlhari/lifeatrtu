import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Navigation from "../components/Navigation";
import HomeContent from "../components/HomeContent";

export default async function page() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <div
        className="relative w-full h-screen overflow-hidden"
        style={{
          backgroundImage: `url("/bg.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Navigation />
        <HomeContent />
      </div>
    );
  }

  return redirect("/");
}
