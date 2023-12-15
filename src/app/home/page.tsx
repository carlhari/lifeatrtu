import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Navigation from "../components/Navigation";
import Button from "../components/Button";

export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export default async function page() {
  const session = await getSession();

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
