import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Form from "@/app/components/Form";
import Navigation from "@/app/components/Navigation";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export async function getSession() {
  const session = getServerSession(authOptions);
  return session;
}

async function page() {
  const session = await getSession();
  if (session) {
    return (
      <div>
        <Navigation />
        <Form />
      </div>
    );
  }
  return redirect("/");
}

export default page;
