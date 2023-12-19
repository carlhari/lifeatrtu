import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Form from "@/app/components/Form";
import Navigation from "@/app/components/Navigation";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

async function page() {
  const session = await getServerSession(authOptions);
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
