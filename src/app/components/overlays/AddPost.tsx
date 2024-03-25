"use client";
import { useAddPost } from "@/utils/useAddPost";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { BiMessageDetail } from "react-icons/bi";

function AddPost() {
  const { clicked, click } = useAddPost();
  const { data: session } = useSession();
  const [disabled, setDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (session) {
      setDisabled(false);
    }
  }, [session]);
  return (
    !click && (
      <div className="w-full">
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              clicked();
            }
          }}
          className="animate-bounce fixed bottom-0 right-16 z-40 text-9xl lg:right-4 md:text-8xl"
          disabled={disabled}
        >
          <BiMessageDetail />
        </button>
      </div>
    )
  );
}

export default AddPost;
// text-9xl 2xl:text-6xl lg:text-7xl xs:text-5xl animate-bounce fixed bottom-12 right-16 z-40 p-4 2xl:right-8 xs:right-4
