import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Navigation from "../components/Navigation";

export default async function page() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <div className="w-full">
        <Navigation />
        <p>Session valid</p>
      </div>
    );
  }

  return redirect("/");
}
