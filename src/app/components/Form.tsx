"use client";
import React, { FormEvent, useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { FormType } from "@/types/form";
import axios from "axios";
import { create } from "zustand";

function Form() {
  const useStore = create((set) => ({
    count: 1,
    start: () => set((state) => ({ count: state.count + 1 })),
    reset: () => set(state),
  }));

  const initialData: FormType = {
    title: "",
    focus: "",
    content: "",
  };

  const [states, setStates] = useState<FormType>(initialData);

  const handleChange = (e: any) => {
    setStates({ ...states, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStates(initialData);
    const response = await axios.post("/api/post/add", { ...states });
    const data = response.data;

    if (data.ok && data.ok !== null) {
      alert("success added post");
    } else {
      alert("failed to add post");
    }
  };

  return (
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

      <Button label="Button" type="submit" className="text-2xl font-semibold" />
    </form>
  );
}

export default Form;
