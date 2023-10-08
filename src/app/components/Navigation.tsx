"use client";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { NavData, DataForm, UserData } from "@/types";
import Form from "../components/Form";

function Navigation({ name }: NavData) {
  const [isOpen, setOpen] = useState(false);
  const { data: session } = useSession({
    required: true,
  });

  const User: UserData = {
    email: session?.user?.email ?? null,
    name: session?.user?.name ?? null,
  };

  const formData: DataForm = {
    id: "",
    title: "",
    content: "",
    postAs: false,
    concern: "",
    image: "",
    user: User,
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
      {isOpen && (
        <div>
          <div className="w-full h-screen flex items-center justify-center fixed top-0 left-0 z-50 bg-slate-500/80">
            <button type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <Form mode={`add`} initialData={formData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Navigation;
