"use client";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { NavData, DataForm } from "@/types";
import Form from "../components/Form";

function Navigation({ name }: NavData) {
  const [isOpen, setOpen] = useState(false);
  const { data: session } = useSession({
    required: true,
  });

  const formData: DataForm = {
    email: session?.user?.email ?? null,
    title: "",
    content: "",
    postAs: false,
    concern: "",
    image: "",
  };

  return (
    <div className="flex w-full items-center justify-between px-12 py-6">
      <div className="cursor-default">
        Hello, {name ? `${name}` : "Loading.."}
      </div>

      <div className="flex items-center gap-5">
        <button type="button" onClick={() => setOpen(true)}>
          Add Post
        </button>

        <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
          Logout
        </button>
      </div>

      {isOpen && <Form mode={`add`} initialData={formData} setOpen={setOpen} />}
    </div>
  );
}

export default Navigation;
