import { usePost } from "@/utils/usePost";
import { useRequest } from "ahooks";
import Button from "@/app/components/Button";
import axios from "axios";
import React, { ChangeEvent, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import moment from "moment";
import Input from "@/app/components/Input";
import { useSession } from "next-auth/react";
import { Capitalize } from "@/utils/Capitalize";

function SpecificPost({ postId }: { postId: string }) {
  const { close } = usePost();
  const [comment, setComment] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session } = useSession();

  const { data, loading, mutate } = useRequest(() => getPost());

  function getPost(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post("/api/post/get/specific", {
          postId: postId,
        });
        const data = response.data;
        if (data.ok) {
          resolve(data);
        } else reject(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  const AddComment = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/post/actions/comment", {
        postId: postId,
        content: comment,
      });
      const data = response.data;
      if (data.ok) {
        toast.success(data.msg);
        mutate((prev: any) => {
          return {
            ...prev,
            post: {
              comments: [
                ...prev.post.comments,
                {
                  content: comment,
                  postId: postId,
                  user: {
                    id: session?.user.id,
                    name: Capitalize(session?.user.name),
                  },
                },
              ],
            },
          };
        });

        formRef.current && formRef.current.reset();
        setComment("");
      } else toast.error(data.msg);
    } catch (err) {
      console.error(err);
    }
  };

  console.log("specific post", data);
  return loading ? (
    "loading"
  ) : (
    <div className="w-full h-screen z-50 fixed top-0 left-0 flex justify-center items-center flex-col bg-slate-500">
      <Toaster />
      <Button label={"Cancel"} type="button" onClick={close} />
      {data && (
        <div className="">
          <div>{data.post.title}</div>
          <div>{data.post.focus}</div>
          <div>{data.post.content}</div>
          <div>{data.post.anonymous}</div>
          {data.post.image && (
            <Image src={data.post.image} alt={"Image Content"} />
          )}
          <div>{moment(data.post.createdAt).format("LLL")}</div>
        </div>
      )}

      <form ref={formRef} onSubmit={AddComment}>
        <Input
          type="text"
          onChange={(e) => setComment(e.target.value)}
          maxLength={100}
        />
        <button type="submit">Add Comment</button>
      </form>

      {data &&
        data.post.comments.map((item: any, key: number) => {
          return (
            <div key={key}>
              <div>{item.user.name}</div>
              <div>{item.content}</div>
            </div>
          );
        })}
    </div>
  );
}

export default SpecificPost;
