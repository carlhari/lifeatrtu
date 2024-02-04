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
          className=" text-7xl text-white animate-bounce fixed bottom-12 right-16 z-40 rounded-full bg-blue-600 border-2 border-solid border-black p-4"
        >
          <BsChatLeftQuote />
        </button>
      </div>
    )
  );
}

export default AddPost;
