"use client";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { FormType } from "@/types/form";
import axios from "axios";
import { useTimeStore } from "@/utils/useTimeStore";
import { useAddPost } from "@/utils/useAddPost";
import { BsIncognito } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";
import { useLimiter } from "@/utils/useLimiter";

const Form: React.FC<any> = ({ data, mutate, setKeyword, keyword }) => {
  const [hydrate, setHydrate] = useState<boolean>(false);
  const { time, decrease, trigger } = useTimeStore();
  const { click, clicked } = useAddPost();
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const initialData = {
    title: "",
    focus: "",
    content: "",
    anonymous: false,
    error: "",
    image: "",
  };

  const [states, setStates] = useState<FormType>(initialData);

  const { limit, maxAge, maxLimit, auto, decreaseLimit } = useLimiter();

  useEffect(() => {
    setHydrate(true);
    const counter = setInterval(() => {
      if (trigger) {
        if (time <= 0) {
          clearInterval(counter);
          return;
        }
        decrease();
      }
    }, 1000);

    return () => clearInterval(counter);
  }, [trigger]);

  useEffect(() => {
    auto();

    return;
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
            return setStates({ ...states, image: converted });
          } catch (err) {
            remove();
            return setStates({ ...states, error: "error occured" });
          }
        } else {
          remove();
          return setStates({
            ...states,
            error: "File exceeds the maximum size of 3MB",
          });
        }
      } else {
        remove();
        return setStates({
          ...states,
          error: "Please select valid file format.",
        });
      }
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setStates({ ...states, [name]: value });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "MAX", "ERROR", "FAILED"];

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
          success: (data: any) => `Success: ${data.msg} `,
          error: (data) => `Failed [${data.status}]: ${data.msg}`,
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
      <div className="absolute w-full z-50">
        <Toaster />
        <form
          onSubmit={onSubmit}
          className="flex flex-col items-center justify-center"
          ref={formRef}
        >
          <div>
            <Button label="Cancel" type="button" onClick={clicked} />
          </div>

          <Input
            type="text"
            name="title"
            className="border-solid border-2 border-black"
            placeholder="Untitled"
            onChange={handleChange}
            required={true}
          />

          <select className="" name="focus" onChange={handleChange} required>
            <option value=""></option>
            <option value="facility">Facility</option>
            <option value="professor">Professor</option>
            <option value="experience">Experience</option>
            <option value="others">Others</option>
          </select>

          <textarea
            placeholder="What's Happening now?"
            name="content"
            maxLength={500}
            onChange={handleChange}
            required
          />

          <button
            type="button"
            onClick={() =>
              setStates({ ...states, anonymous: !states.anonymous })
            }
          >
            <BsIncognito />
          </button>

          <Button
            label="Button"
            type="submit"
            className="text-2xl font-semibold"
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            name="image"
            className="hidden"
            onChange={imageChange}
          />

          <Button
            label="Add Photo"
            type="button"
            onClick={() => fileRef.current?.click()}
          />

          <Button label="decrease automatic" type="button" onClick={decrease} />
          <p>{time}</p>
        </form>

        <button
          type="button"
          className={`${maxLimit ? "cursor-not-allowed" : ""}`}
          onClick={decreaseLimit}
          disabled={maxLimit}
        >
          Limiter BTN
        </button>
      </div>
    )
  );
};

export default Form;
