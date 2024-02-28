"use client";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { FormType } from "@/types/form";
import axios from "axios";
import { useAddPost } from "@/utils/useAddPost";
import { BsIncognito } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";
import { isOpenAgreement } from "@/utils/Overlay/Agreement";
import Agreement from "./overlays/Agreement";
import { Capitalize } from "@/utils/Capitalize";
import { useSession } from "next-auth/react";
import { BiImageAdd } from "react-icons/bi";

import { usePostCountDown } from "@/utils/Timer";
import { getRemainingTime } from "@/utils/CountDown";
import { formatTime } from "@/utils/FormatTime";
import { useRequest } from "ahooks";

const Form: React.FC<any> = ({ data, mutate, setKeyword, keyword }) => {
  const [hydrate, setHydrate] = useState<boolean>(false);
  const { data: session } = useSession();
  const { click, clicked } = useAddPost();
  const { openAgreement, agreementT } = isOpenAgreement();
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { startingTime, remainingTime, countdown, setStarting } =
    usePostCountDown();

  const [disabled, setDisabled] = useState<boolean>(false);

  const initialData = {
    title: "",
    focus: "",
    content: "",
    anonymous: false,
    image: "",
  };

  const [states, setStates] = useState<FormType>(initialData);

  useEffect(() => {
    setHydrate(true);
  }, []);

  const convertToBase64 = async (file: File) => {
    return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const remove = () => {
    setStates({ ...states, image: "" });
    if (fileRef.current) return (fileRef.current.value = "");
  };

  const imageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.type.startsWith("image/")) {
        if (file.size <= 3 * 1024 * 1024) {
          try {
            const converted = await convertToBase64(file);
            setStates({
              ...states,
              image: converted as string | null,
            });
          } catch (err) {
            remove();

            toast.error("Error: Error Occured");
          }
        } else {
          remove();

          toast.error("File exceeds the maximum size of 3MB");
        }
      } else {
        remove();
        toast.error("Please select valid file format.");
      }
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setStates({ ...states, [name]: value });
  };

  const reset = async () => {
    try {
      await axios.post("/api/post/get/cooldown/reset", { type: "postTime" });
    } catch (err) {
      console.error(err);
    }
  };

  const getCooldownPost = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post("/api/post/get/cooldown/post");
        const data = response.data;
        if (data.ok) {
          const remaining = getRemainingTime(data.startingTime);

          if (remaining !== 0) {
            setStarting(data.startingTime);
            countdown();
          } else {
            setStarting(0);
            reset();
          }
          resolve(data);
        } else {
          reject();
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  };

  const post = useRequest(getCooldownPost, {
    refreshOnWindowFocus: true,
    refreshDeps: [session, keyword],
    retryCount: 2,
  });

  // useEffect(() => {
  //   const getPostRemaining = async () => {
  //     try {
  //       const response = await axios.post("/api/post/get/cooldown/post");
  //       const data = response.data;

  //       if (data.ok) {
  //         const remaining = getRemainingTime(data.startingTime);

  //         if (remaining !== 0) {
  //           setStarting(data.startingTime);
  //           countdown();
  //         } else {
  //           setStarting(0);
  //           reset();
  //         }
  //       }
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   getPostRemaining();
  // }, [session, keyword]);

  useEffect(() => {
    if (session) {
      if (
        (startingTime === 0 || startingTime === null) &&
        (remainingTime === 0 || remainingTime === null)
      ) {
        setDisabled(false);
      } else setDisabled(true);
    }
  }, [remainingTime, session]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];

    try {
      const response = new Promise(async (resolve, reject) => {
        const res = await axios.post("/api/post/add", { ...states });

        const resData = res.data;

        if (!status.includes(resData.status)) {
          if (
            states.title.length !== 0 &&
            states.focus.length !== 0 &&
            states.content.length !== 0
          ) {
            if (resData.ok) {
              setTimeout(() => {
                setKeyword(!keyword);
                mutate({
                  list: [...data.list, resData.post],
                });

                resolve(resData);
              }, 1500);
            } else reject(resData);
          } else reject(resData);
        } else reject(resData);
      });

      toast.promise(
        response,
        {
          loading: "loading",
          success: (data: any) => {
            clicked();
            return `Success: ${data.msg}`;
          },
          error: (data: any) => {
            setStarting(0);
            reset();
            return `Failed [${data.status}]: ${data.msg}`;
          },
        },
        { position: "top-center" }
      );

      formRef.current && formRef.current.reset();
      setStates(initialData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    hydrate &&
    click && (
      <div
        className="absolute top-0 left-0 w-full h-screen z-50 flex items-center justify-center overflow-hidden animate-fadeIn"
        style={{
          backgroundImage: `url("/bg.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Toaster />
        {states.anonymous && openAgreement && (
          <Agreement setStates={setStates} states={states} />
        )}
        <div className="flex w-full h-full sm:flex-col">
          <div className="flex flex-col justify-center w-1/2 pl-28 gap-20 2xl:gap-12 lg:pl-20 md:pl-8 sm:w-full sm:pl-0 sm:p-1 sm:gap-2">
            <div
              className="text-5xl font-bold md:text-4xl sm:text-center sm:w-full"
              style={{ fontFamily: "semibold-pop" }}
            >
              Hello, {session && Capitalize(session?.user?.name).split(" ")[0]}
            </div>
            <div className="flex items-center flex-col justify-center w-full">
              <div className="font-bold text-p-85 leading-snug w-10/12 text-start">
                We care<br></br> about what<br></br> you think
              </div>
            </div>
            <div className=" text-justify font-medium text-xl w-10/12 xl:w-11/12 md:text-lg sm:text-base sm:leading-tight">
              You can share your thoughts anonymously by clicking the anonymous
              icon and you can add photo if you want *maximum 1 photo only*
            </div>
          </div>
          {/* ----------------------------------------------------------------------------- */}
          <form
            onSubmit={onSubmit}
            className="w-1/2 h-full flex flex-col item-center p-2 px-8 gap-5 lg:px-2 sm:w-full"
            style={{ backgroundColor: "#DBD9D9" }}
            ref={formRef}
          >
            {/* -------------------------------------------------------------------------- */}
            <div className="w-full flex justify-end items-center">
              <button
                type="button"
                onClick={() => {
                  clicked();
                  setStates(initialData);
                }}
                className="text-lg font-semibold px-2 rounded-lg"
                style={{ backgroundColor: "#FFB000" }}
              >
                Cancel
              </button>
            </div>
            {/* -------------------------------------------------------------------------- */}
            <Input
              type="text"
              name="title"
              className="outline-none text-7xl w-full bg-transparent font-bold placeholder-black md:text-6xl"
              placeholder="Untitled"
              onChange={handleChange}
              maxLength={50}
              required={true}
              value={states.title}
            />
            {/* -------------------------------------------------------------------------- */}

            <div className="w-full flex gap-1 items-center">
              <div className="text-5xl md:text-4xl">Focus: </div>
              <select
                className="w-full text-3xl outline-none rounded-xl p-2 bg-transparent text-left md:text-2xl"
                name="focus"
                onChange={handleChange}
                value={states.focus}
                required
              >
                <option value=""></option>
                <option value="facility">Facility</option>
                <option value="professor">Professor</option>
                <option value="experience">Experience</option>
                <option value="others">Others</option>
              </select>
            </div>
            {/* -------------------------------------------------------------------------- */}
            <div className="flex items-center justify-center flex-col">
              <textarea
                placeholder="What's Happening now?"
                name="content"
                maxLength={500}
                onChange={handleChange}
                value={states.content}
                className="resize-none w-full h-96 outline-none rounded-t-xl text-xl text-justify p-4"
                required
              />

              <div className="w-full rounded-bl-xl rounded-br-xl bg-white p-2 flex items-center justify-between">
                <div
                  className={`w-1/3 ${
                    states.image ? "animate-fadeIn" : "animate-fadeOut"
                  }`}
                >
                  {states.image && "With Photo"}
                </div>
                <div>{states.content.length}/500</div>

                <div className="w-1/3"></div>
              </div>
            </div>
            {/* -------------------------------------------------------------------------- */}

            <div className="w-full flex items-center justify-end gap-4 lg:justify-center">
              {/* -------------------------------------------------------------------------- */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                name="image"
                className="hidden"
                onChange={imageChange}
              />

              {states.image ? (
                <button
                  type="button"
                  onClick={() => remove()}
                  className={`bg-red-600 rounded-xl p-1 text-white text-lg animate-fadeIn`}
                >
                  Remove Photo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-5xl flex items-center justify-center"
                >
                  <BiImageAdd />
                </button>
              )}
              {/* -------------------------------------------------------------------------- */}
              <button
                type="button"
                onClick={() => {
                  setStates({ ...states, anonymous: !states.anonymous });
                  agreementT();
                }}
                className="text-4xl flex items-center justify-center"
                aria-description="Button"
              >
                <BsIncognito fill={states.anonymous ? "#706f6d" : "black"} />
              </button>

              {/* -------------------------------------------------------------------------- */}
              <button
                type="submit"
                className={`text-2xl font-semibold ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                disabled={disabled}
              >
                <button
                  type="submit"
                  className={`text-2xl font-semibold ${disabled ? "cursor-not-allowed" : "cursor-pointer"} flex items-center justify-center`}
                  disabled={disabled || post.loading}
                >
                  {post.loading ? (
                    <span className="loading loading-dots w-10"></span>
                  ) : disabled ? (
                    formatTime(remainingTime)
                  ) : (
                    <div
                      className="rounded-lg px-2"
                      style={{ backgroundColor: "#3085C3" }}
                    >
                      Submit
                    </div>
                  )}
                </button>
              </button>
            </div>

            {/* -------------------------------------------------------------------------- */}
          </form>
        </div>
      </div>
    )
  );
};

export default Form;
