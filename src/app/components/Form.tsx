"use client";
import React, { FormEvent, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { FormType } from "@/types/form";
import axios from "axios";

function Form() {
  const [states, setState] = useState<FormType>({
    title: "",
    focus: "",
    content: "",
  });

  const handleChange = (e: any) => {
    setState({ ...states, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

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

      <Button label="Post" type="submit" className="text-2xl font-semibold" />
    </form>
  );
}

export default Form;
