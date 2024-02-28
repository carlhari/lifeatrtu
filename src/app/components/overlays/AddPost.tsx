"use client";
import { useAddPost } from "@/utils/useAddPost";
import React from "react";
import { BiMessageDetail } from "react-icons/bi";

function AddPost() {
  const { clicked, click } = useAddPost();
  return (
    !click && (
      <div className="w-full">
        <button
          type="button"
          onClick={clicked}
          className=" text-7xl 2xl:text-6xl lg:text-7xl xs:text-5xl animate-bounce fixed bottom-12 right-16 z-40 p-4 2xl:right-8 xs:right-4"
        >
          <BiMessageDetail />
        </button>
      </div>
    )
  );
}

export default AddPost;
