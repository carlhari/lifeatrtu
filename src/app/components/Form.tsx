"use client";
import React, { FormEvent, useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { FormType } from "@/types/form";
import axios from "axios";
import { useTimeStore } from "@/utils/useTimeStore";

function Form() {
  const [hydrate, setHydrate] = useState<boolean>(false);
  const { time, decrease, trigger } = useTimeStore();

  const initialData: FormType = {
    title: "",
    focus: "",
    content: "",
  };
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

  const [states, setStates] = useState<FormType>(initialData);

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
    hydrate && (
      <form onSubmit={onSubmit}>
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

        <Button
          label="Button"
          type="submit"
          className="text-2xl font-semibold"
        />
        <Button label="decrease automatic" type="button" onClick={decrease} />
        <p>{time}</p>
      </form>
    )
  );
}

export default Form;
