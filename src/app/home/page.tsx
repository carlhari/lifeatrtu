import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Navigation from "../components/Navigation";
import GetUser from "../components/GetUser";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export default async function page() {
  const session = await getSession();

  if (session) {
    return (
      <div>
        <Navigation />
        <p>Session valid</p>
        <GetUser />
      </div>
    );
  }

  return redirect("/");
}
