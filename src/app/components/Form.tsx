"use client";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { FormType } from "@/types/form";
import axios from "axios";
import { useTimeStore } from "@/utils/useTimeStore";
import { useAddPost } from "@/utils/useAddPost";
import { BsIncognito } from "react-icons/bs";

function Form() {
  const [hydrate, setHydrate] = useState<boolean>(false);
  const { time, decrease, trigger } = useTimeStore();
  const { click, clicked } = useAddPost();
  const fileRef = useRef<HTMLInputElement>(null);
  const initialData = {
    title: "",
    focus: "",
    content: "",
    anonymous: false,
    error: "",
    image: "",
  };

  const [states, setStates] = useState<FormType>(initialData);

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
    setStates({ ...states, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStates(initialData);

    try {
      const response = await axios.post("/api/post/add", {
        content: states.content,
      });

      const data = response.data;

      if (data) alert(data.result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    hydrate &&
    click && (
      <div className="absolute w-full z-50">
        <form
          onSubmit={onSubmit}
          className="flex flex-col items-center justify-center"
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
      </div>
    )
  );
}

export default Form;
