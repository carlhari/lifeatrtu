"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Button from "../Button";
import { isOpenDelete, valueDelete } from "@/utils/Overlay/Delete";
import { useRequest } from "ahooks";
import { useDeleteCountDown } from "@/utils/Timer";

let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];
function Delete({ reload }: any) {
  const useDelete = isOpenDelete();
  const { id, clear } = valueDelete();

  const { data, loading } = useRequest(() => getPost());
  const Delete = useDeleteCountDown();

  const reset = async () => {
    try {
      await axios.post("/api/post/get/cooldown/reset", { type: "deleteTime" });
    } catch (err) {
      console.error(err);
    }
  };

  const HandleDelete = async (postId: string) => {
    try {
      const response = new Promise(async (resolve, reject) => {
        const res = await axios.post(
          "/api/post/delete",
          { postId: postId },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = res.data;

        if (!status.includes(data.status)) {
          setTimeout(() => {
            clear();
            reload();

            setTimeout(() => {
              resolve(data);
            }, 1500);
          }, 2000);
        } else reject(data);
      });

      toast.promise(
        response,
        {
          loading: "Deleting Post",
          success: (data: any) => {
            useDelete.close();
            return `Success: ${data.msg} `;
          },
          error: (data: any) => {
            Delete.setStarting(0);
            reset();
            return `Failed [${data.status}]: ${data.msg}`;
          },
        },
        { position: "top-center" }
      );
    } catch (err) {
      console.error(err);
    }
  };

  function getPost(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post("/api/post/get/specific", {
          postId: id,
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

  return (
    <div className="fixed top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center animate-fadeIn duration-700 z-50 bg-slate-500/60">
      <Toaster />

      <div className="bg-white w-1/3 p-4 flex items-center flex-col rounded-xl gap-4">
        <div className="text-2xl font-medium text-center w-full">
          Are you sure you want to{" "}
          <strong className="text-red-600">DELETE</strong> your post ?
        </div>
        <div className="text-2xl flex items-center w-full gap-2 justify-center">
          <div>Entitled: </div>
          <div className="font-semibold">
            "
            {loading ? (
              <span className="loading loading-dots loading-lg"></span>
            ) : (
              data && data.post.title
            )}
            "
          </div>
        </div>
        {!loading && (
          <div className="flex items-center w-full gap-4 justify-center animate-fadeIn">
            <Button
              label="Yes"
              type="button"
              onClick={() => {
                HandleDelete(id);
              }}
              className="p-1 px-3 rounded-xl text-2xl bg-green-600 text-white hover:scale-125 duration-500"
            />
            <Button
              label="No"
              type="button"
              onClick={() => {
                clear();
                useDelete.close();
              }}
              className="p-1 px-3 rounded-xl text-2xl bg-red-600 text-white hover:scale-125 duration-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Delete;
