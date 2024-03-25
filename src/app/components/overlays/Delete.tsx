"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Button from "../Button";
import { isOpenDelete, valueDelete } from "@/utils/Overlay/Delete";
import { useRequest } from "ahooks";
import { useDeleteCountDown } from "@/utils/Timer";
import { useSession } from "next-auth/react";

let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];
function Delete({ reload }: any) {
  const useDelete = isOpenDelete();
  const { id, clear } = valueDelete();
  const { data: session } = useSession();

  const { data, loading } = useRequest(() => getPost());
  const Delete = useDeleteCountDown();

  const controllerRef = useRef(new AbortController());
  const [disabled, setDisabled] = useState<boolean>(false);
  const [disabledBtn, setDisabledBTN] = useState<boolean>(false);

  const reset = async () => {
    try {
      await axios.post("/api/post/get/cooldown/reset", { type: "deleteTime" });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    return () => controllerRef.current?.abort();
  }, [session]);

  const handleDelete = (postId: string) => {
    if (disabled) {
      toast.error("Please Wait");
    }

    setDisabledBTN(true);
    const loadingId = toast.loading("Deleting...");

    const { signal } = controllerRef.current;

    setTimeout(() => {
      setDisabled(true);
      axios
        .post("/api/post/delete", { postId: postId }, { signal: signal })
        .then((response) => {
          if (!status.includes(response.data.status) && response.data.ok) {
            clear();
            reload();
            useDelete.close();
            toast.success(response.data.msg);
          } else {
            Delete.setStarting(0);
            reset();
            toast.error(
              `Failed[${response.data.status}]: ${response.data.msg}`
            );
          }
        })
        .catch((err) => {
          if (err.name === "CanceledError") {
            toast.error("Canceled");
          }
        })
        .finally(() => {
          toast.dismiss(loadingId);
          setDisabled(false);
          setDisabledBTN(false);
        });
    }, 1000);
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

      <div className="bg-white w-1/3 p-4 flex items-center flex-col rounded-xl gap-4 2xl:w-7/12 md:w-9/12 sm:w-11/12 xs:w-[97%]">
        <div className="text-2xl font-medium text-center w-full sm:text-xl">
          Are you sure you want to{" "}
          <strong className="text-red-600">DELETE</strong> your post ?
        </div>
        <div className="text-2xl sm:text-xl flex items-center w-full gap-2 justify-center">
          <div>Entitled: </div>
          <div className="font-semibold">
            {`"`}
            {loading ? (
              <span className="loading loading-dots loading-lg"></span>
            ) : (
              data && data.post.title
            )}
            {`"`}
          </div>
        </div>
        {!loading && (
          <div className="flex items-center w-full gap-4 justify-center animate-fadeIn">
            <Button
              label="Yes"
              type="button"
              onClick={() => {
                if (!disabledBtn) {
                  handleDelete(id);
                }
              }}
              className={`p-1 px-3 rounded-xl text-2xl sm:text-lg bg-green-600 text-white hover:scale-125 duration-500 ${disabled || disabledBtn ? "cursor-not-allowed" : "cursor-pointer"}`}
              disabled={disabled || disabledBtn}
            />
            <Button
              label="No"
              type="button"
              onClick={() => {
                controllerRef.current.abort();
                clear();
                useDelete.close();
              }}
              disabled={disabled}
              className={`p-1 px-3 rounded-xl text-2xl sm:text-lg bg-red-600 text-white hover:scale-125 duration-500 ${disabled && "hidden"}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Delete;
