/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/role-supports-aria-props */
"use client";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import axios from "axios";
import { BsIncognito } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";
import { isOpenAgreement } from "@/utils/Overlay/Agreement";
import Agreement from "@/app/components/overlays/Agreement";
import { Capitalize } from "@/utils/Capitalize";
import { useSession } from "next-auth/react";
import { BiImageAdd } from "react-icons/bi";
import { isOpenEdit, valueEdit } from "@/utils/Overlay/EditPost";
import { useRequest } from "ahooks";
import { useEditCountDown } from "@/utils/Timer";
import { getRemainingTime } from "@/utils/CountDown";
import { formatTimeHours } from "@/utils/FormatTime";

const EditPost: React.FC<any> = ({
  data,
  mutate,
  setKeyword,
  keyword,
  postId,
}) => {
  let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];
  const [hydrate, setHydrate] = useState<boolean>(false);
  const { data: session } = useSession();
  const { openAgreement, agreementT } = isOpenAgreement();
  const edit = isOpenEdit();
  const editValue = valueEdit();
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const initialData = {
    title: "",
    focus: "",
    content: "",
    anonymous: false,
    image: "",
  };

  const [post, setPostData] = useState<any>(initialData);
  const [states, setStates] = useState<any>(initialData);
  const [disabled, setDisabled] = useState<boolean>(false);

  const Edit = useEditCountDown();

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

  const postReq = useRequest(() => getPost());

  const reset = async () => {
    try {
      await axios.post("/api/post/get/cooldown/reset", { type: "editTime" });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setHydrate(true);
  }, []);

  useEffect(() => {
    if (postReq && postReq.data) {
      setPostData(postReq.data.post);
      setStates(postReq.data.post);
    }
  }, [postReq.data]);

  useEffect(() => {
    const isChanged = Object.keys(post).some(
      (key: any) => post[key] !== states[key]
    );
    setDisabled(!isChanged);
  }, [states]);

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

  const abortControllerRef = useRef<AbortController>(new AbortController());

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const loadingId = toast.loading("Editing...");
    try {
      const res = await axios.post(
        "/api/post/edit",
        {
          ...states,
          postId: postId,
        },
        { signal: abortControllerRef.current.signal }
      );

      const resData = res.data;

      if (!status.includes(resData.status)) {
        if (
          resData.post.title.length !== 0 &&
          resData.post.focus.length !== 0 &&
          resData.post.content.length !== 0 &&
          resData.ok
        ) {
          setKeyword(!keyword);
          edit.close();
          toast.success(`Success ${resData.msg}`);
        } else toast.error(`Failed[${data.status}]: ${data.msg}`);
      } else toast.error(`Failed[${data.status}]: ${data.msg}`);
    } catch (err: any) {
      toast.dismiss(loadingId);
      console.error(err);
      if (err.message === "canceled") {
        toast.error("Cancelled");
      }
    }
  };

  return (
    hydrate &&
    (postReq.loading ? (
      <div className="w-full h-screen z-50 fixed top-0 left-0 flex justify-center items-center flex-col bg-slate-400/70">
        <span className="loading loading-dots w-20"></span>
      </div>
    ) : (
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
        <div className="flex w-full h-full md:flex-col">
          <div className="flex flex-col justify-center w-1/2 md:w-full pl-28 gap-20 2xl:gap-12 2xl:pl-20 xl:pl-8 md:px-2 md:gap-4">
            <div className="text-5xl font-bold md:text-4xl xs:text-3xl xxs:text-2xl">
              Hello, {session && Capitalize(session?.user?.name).split(" ")[0]}
            </div>
            <div className="flex items-center flex-col justify-center w-full">
              <div className="font-bold text-p-85 leading-snug w-10/12 text-7xl text-start 2xl:w-full lg:text-7xl md:text-3xl xs:text-2xl md:text-center">
                We care about what you think
              </div>
            </div>
            <div className="text-justify font-medium text-xl w-10/12 xl:w-11/12 md:w-full 2xl:text-lg md:text-base md:text-center sm:leading-tight xs:text-sm">
              You can share your thoughts anonymously by clicking the anonymous
              icon and you can add photo if you want *maximum 1 photo only*
            </div>
          </div>
          {/* ----------------------------------------------------------------------------- */}
          <form
            onSubmit={onSubmit}
            className="w-1/2 md:w-full h-full flex flex-col p-2 px-8 gap-5 lg:px-2 md:gap-2"
            style={{ backgroundColor: "#DBD9D9" }}
            ref={formRef}
          >
            {/* -------------------------------------------------------------------------- */}
            <div className="w-full flex justify-end items-center">
              <button
                type="button"
                onClick={() => {
                  abortControllerRef.current.abort();
                  edit.close();
                  editValue.clear();
                  setStates(initialData);
                }}
                className="text-lg font-semibold px-2 rounded-lg md:absolute md:right-2 md:top-1 xs:text-base xxs:text-sm"
                style={{ backgroundColor: "#FFB000" }}
              >
                Cancel
              </button>
            </div>
            {/* -------------------------------------------------------------------------- */}
            <Input
              type="text"
              name="title"
              className="outline-none text-7xl w-full bg-transparent font-bold placeholder-black md:text-6xl xs:text-4xl"
              placeholder="Untitled"
              onChange={handleChange}
              maxLength={50}
              required={true}
              value={states.title}
            />

            {/* -------------------------------------------------------------------------- */}

            <div className="w-full flex gap-1 items-center">
              <div className="text-5xl md:text-4xl xs:text-xl">Focus: </div>
              <select
                className="w-full text-3xl outline-none rounded-xl p-2 bg-transparent text-left md:text-2xl xs:text-lg"
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
                className="resize-none w-full h-96 outline-none rounded-t-xl text-xl text-justify p-4 xs:p-2 xs:text-base"
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

            <div className="w-full flex items-center justify-end gap-4 lg:justify-center xs:gap-10">
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
              {disabled ? (
                <div
                  className={`${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  No changes
                </div>
              ) : (
                <button
                  type="submit"
                  className={`text-2xl font-semibold ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                  style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                  disabled={disabled}
                >
                  {disabled ? (
                    formatTimeHours(Edit.remainingTime)
                  ) : (
                    <div
                      className="text-xl rounded-lg px-2"
                      style={{ backgroundColor: "#3085C3" }}
                    >
                      Submit
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* -------------------------------------------------------------------------- */}
          </form>
        </div>
      </div>
    ))
  );
};

export default EditPost;
