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
          className="text-6xl animate-bounce fixed bottom-0 right-0"
        >
          <BsChatLeftQuote />
        </button>
      </div>
    )
  );
}

export default AddPost;
