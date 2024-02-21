"use client";
import { useAddPost } from "@/utils/useAddPost";
import React from "react";
import { BsChatLeftQuote } from "react-icons/bs";

function AddPost() {
  const { clicked, click } = useAddPost();
  return (
    !click && (
      <div className="w-full">
        <button
          type="button"
          onClick={clicked}
          className=" text-7xl 2xl:text-6xl lg:text-7xl xs:text-5xl text-white animate-bounce fixed bottom-12 right-16 z-40 rounded-full bg-blue-600 border border-solid border-black p-4 2xl:right-8 xs:right-4"
        >
          <BsChatLeftQuote />
        </button>
      </div>
    )
  );
}

export default AddPost;
