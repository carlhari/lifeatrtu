"use client";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { FormType } from "@/types/form";
import axios from "axios";
import { useAddPost } from "@/utils/useAddPost";
import { BsIncognito } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";
import { formatTime } from "@/utils/FormatTime";
import { isOpenAgreement } from "@/utils/Overlay/Agreement";
import Agreement from "./overlays/Agreement";
import { Capitalize } from "@/utils/Capitalize";
import { useSession } from "next-auth/react";
import { BiImageAdd } from "react-icons/bi";
import { getRemainingTime } from "@/utils/CountDown";
import moment from "moment";

const Form: React.FC<any> = ({
  data,
  mutate,
  setKeyword,
  keyword,
  postTime,
}) => {
  const [hydrate, setHydrate] = useState<boolean>(false);
  const { data: session } = useSession();
  const { click, clicked } = useAddPost();
  const { openAgreement, agreementT } = isOpenAgreement();
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [remainingPost, setRemainingPost] = useState<any>();
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

  useEffect(() => {
    const resetPostTime = async () => {
      await axios.post("/api/post/get/cooldown/reset", {
        cdField: "cooldownPost",
      });
    };

    const remaining = () => {
      const getRemaining = getRemainingTime(postTime);
      setRemainingPost(getRemaining);
    };

    remaining();

    const intervalId = setInterval(() => {
      setRemainingPost((prev: any) => {
        if (prev > 0) {
          setDisabled(true);
          return prev - 1;
        } else {
          clearInterval(intervalId);
          resetPostTime();
          setDisabled(false);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [postTime, keyword]);

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
            setTimeout(() => {
              setKeyword(!keyword);
              mutate({
                list: [...data.list, resData.post],
              });

              resolve(resData);
            }, 1500);
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
          error: (data: any) => `Failed [${data.status}]: ${data.msg}`,
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
        <div className="flex w-full h-full flex-wrap">
          <div className="flex flex-col justify-center w-1/2 pl-28 gap-20">
            <div className="text-5xl font-semibold">
              Hello, {session && Capitalize(session?.user?.name).split(" ")[0]}
            </div>
            <div className="flex items-center flex-col justify-center w-full">
              <div className="font-bold text-7xl leading-snug w-5/12">
                We care about what you think
              </div>
            </div>
            <div className=" text-justify font-medium text-xl w-10/12">
              You can share your thoughts anonymously by clicking the anonymous
              icon and you can add photo if you want *maximum 1 photo only*
            </div>
          </div>
          {/* ----------------------------------------------------------------------------- */}
          <form
            onSubmit={onSubmit}
            className="w-1/2 h-full flex flex-col item-center p-2 px-10 gap-5"
            style={{ backgroundColor: "#DBD9D9" }}
            ref={formRef}
          >
            {/* -------------------------------------------------------------------------- */}
            <div className="w-full flex justify-end items-center">
              <Button
                label="Cancel"
                type="button"
                onClick={() => {
                  clicked();
                  setStates(initialData);
                }}
                className="text-xl font-semibold"
              />
            </div>
            {/* -------------------------------------------------------------------------- */}
            <Input
              type="text"
              name="title"
              className="outline-none text-7xl w-full bg-transparent font-bold placeholder-black"
              placeholder="Untitled"
              onChange={handleChange}
              maxLength={50}
              required={true}
              value={states.title}
            />
            {/* -------------------------------------------------------------------------- */}

            <div className="w-full flex gap-1 items-center">
              <div className="text-5xl">Focus: </div>
              <select
                className="w-full text-3xl outline-none rounded-xl p-2 bg-transparent text-left"
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

            <div className="w-full flex items-center justify-end gap-4">
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
                className="text-2xl font-semibold"
                style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                disabled={disabled}
              >
                {disabled ? formatTime(remainingPost) : "Post"}
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
