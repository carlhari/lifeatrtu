import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import LoginButton from "./components/LoginButton";
import { authOptions } from "./api/auth/[...nextauth]/route";
export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export default async function Home() {
  const session = await getSession();

  if (session) {
    return redirect("/home");
  }
  return (
    <div>
      <LoginButton />
    </div>
  );
}
