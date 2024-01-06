"use client";
import React from "react";
import Image from "next/image";
import moment from "moment";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";


const DisplayPost: React.FC<any> = ({
  data,
  loading,
  mutate
}) => {
  const { data: session } = useSession()

  const handleLike = async (postId: string) => {
    try {
      const response = await axios.post("/api/post/actions/like", { postId: postId })

      const data = response.data

      if (data.ok) {
        toast.success(data.msg)
        mutate((prev: any) => {
          if (data.msg === "liked") {
            return {
              ...prev,
              list: prev.list.map((item: any) => {
                if (item.id === postId) {
                  return {
                    ...item,
                    likes: [...item.likes, { userId: session?.user.id, postId: postId }],
                    _count: {
                      ...item._count,
                      likes: item._count.likes + 1,
                    },
                  };
                } else return item;
              }),
            };
          } else {
            return {
              ...prev,
              list: prev.list.map((item: any) => {
                if (item.id === postId) {
                  const indexLiked = item.likes.findIndex((like: any) => like.userId === session?.user.id)

                  if (indexLiked !== -1) {
                    const updatedLikes = [...item.likes];
                    updatedLikes.splice(indexLiked, 1);
                    return {
                      ...item,
                      likes: updatedLikes,
                      _count: {
                        ...item._count,
                        likes: item._count.likes - 1
                      }
                    }
                  }
                } else return item
              })
            }
          }
        });
      } else toast.error(data.msg)

    } catch (err) { console.log(err) }
  }


  return (
    <>
      {loading && "loading"}
      <div>
        <Toaster />
        {data &&
          data.list &&
          data.list.map((item: any, key: any) => {
            return (
              <div key={key} className="overflow-auto break-inside-avoid border-2 border-black border-solid">
                <div>{item.id}</div>
                <div>{item.title}</div>
                <div>{item.focus}</div>
                <div>{item.content}</div>

                {item.image && (
                  <Image
                    loading="lazy"
                    src={item.image}
                    alt={"Image Content"}
                  />
                )}



                <div>{moment(item.createdAt).format("LLL")}</div>

                <div className="w-full flex justify-between items-center">
                  <button type="button" onClick={() => handleLike(item.id)}>{item.likes && session && item.likes.some(
                    (like: any) =>
                      like.postId === item.id &&
                      like.userId === session.user.id
                  )
                    ? "already Liked"
                    : "Like"} {item._count.likes} </button>
                  <button type="button">Comment {item._count.comments}</button>
                  <button type="button">Engages {item._count.engages}</button>

                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default DisplayPost;
