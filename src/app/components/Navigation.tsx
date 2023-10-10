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
    isChecked: false,
    concern: "",
    image: "",
    user: User,
  };

  return (
    <div className="flex w-full items-center justify-between px-12 py-6">
      <div className="cursor-default">
        Hello, {name ? `${name.split(" ")[0]}` : "Loading.."}
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
        <Form
          mode={`add`}
          initialData={formData}
          onCancel={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export default Navigation;
