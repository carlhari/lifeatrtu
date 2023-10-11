import { DetailsForm } from "@/types";
import React, { ChangeEvent } from "react";
import { BiSend } from "react-icons/bi";
import Comment from "../components/Comment";

function DetailsForm({ formData, onCancel }: DetailsForm) {
  const AddComment = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full flex items-center justify-center flex-col bg-slate-500/80">
      <div>
        <button type="button" onClick={() => onCancel()}>
          Close
        </button>
        <p>
          Who post it {formData.isChecked ? "Anonymous" : formData.user.name}
        </p>
        <p>Title {formData.title}</p>
        <p>Content {formData.content}</p>
        <p>Concern {formData.concern}</p>
        {formData.image && <img src={formData.image} alt="Image" />}
      </div>

      <form className="flex items-center">
        <input type="text" required />
        <button type="submit" className="text-2xl">
          <BiSend />
        </button>
      </form>

      <div>
        <Comment />
      </div>
    </div>
  );
}

export default DetailsForm;
