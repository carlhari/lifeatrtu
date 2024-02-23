import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Login from "./components/Login";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    return redirect("/home");
  }

  return <Login />;
}
