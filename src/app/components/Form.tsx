import { FormProps, DataForm } from "@/types";
import axios from "axios";
import React, { ChangeEvent, useState, useRef } from "react";

const Form: React.FC<FormProps> = ({ mode, initialData, onCancel }) => {
  //loading handler
  const [loading, setLoading] = useState<boolean>(false);

  //form button disabled
  const [disabledBtn, setDisabled] = useState<boolean>(true);

  //form button ref
  const formBtnRef = useRef<HTMLButtonElement | null>(null);

  //form data
  const [formData, setFormData] = useState<DataForm>(initialData);

  //notification for success and failed
  const [notif, setNotif] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [errorNotif, setErrorNotif] = useState<string>("");

  //watch event if changes happens in values
  const [event, setEvent] = useState<boolean>(false);
  //const [currentImg, setImg] = useState<string | null>(formData.image ?? null); for displaying image

  //notif for image
  const [imgError, setImageError] = useState<string>("");
  const inputFileRef = useRef<HTMLInputElement>(null);

  //handle Changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (mode === "edit") {
      if (e) {
        setEvent(true);
        setDisabled(false);
      }
    }
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const checkboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (mode === "edit") {
      if (e) {
        setEvent(true);
        setDisabled(false);
      }
    }
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === "edit") {
      if (e) {
        setEvent(true);
        setDisabled(false);
      }
    }
    const file = e.target.files?.[0];

    if (file && file.size > 3 * 1024 * 1024) {
      setImageError("File exceed maximum size: 3MB");
      if (inputFileRef.current) {
        inputFileRef.current.value = "";
      }
      return;
    }

    if (file) {
      try {
        if (file.type.startsWith("image/")) {
          const base64String = await convertToBase64(file);

          setFormData((prev) => ({
            ...prev,
            image: base64String as string | null,
          }));
          setImageError("");
        } else {
          setImageError("Please select a valid image file.");
        }
      } catch (error) {
        console.error("Error converting image to base64:", error);
      }
    }
  };

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

  const RemovePhoto = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  //end of handle Changes

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formBtnRef.current) {
      formBtnRef.current.disabled = true;
    }

    setLoading(true);

    console.log(formData);
    if (mode === "add") {
      const response = await axios.post("/api/post/add", { formData });
      const data = response.data;

      console.log("add success : ", data);
      if (data.success) {
        setNotif("Post Added Successfully");
        setDisabled(false);
      } else {
        setErrorNotif("Error: Failed To Add the Post");
        setError(true);
        setDisabled(false);
      }
    }

    if (mode === "edit") {
      const response = await axios.post("/api/post/edit", {
        formData: formData,
        email: formData.user.email,
      });

      const data = response.data;
      console.log("edit success : ", data);
      if (data.success) {
        setNotif("Successfully Edited the Post");
        setDisabled(false);
      } else {
        setErrorNotif("Error: Failed to Edit the Post");
        setError(true);
        setDisabled(false);
      }
    }

    setFormData(initialData);
    RemovePhoto();

    if (!error) {
      setTimeout(() => {
        setNotif("");
        setErrorNotif("");
        setError(false);
        setEvent(false);
        setImageError("");
        setDisabled(false);
        if (formBtnRef.current) {
          formBtnRef.current.disabled = false;
          setLoading(false);
        }
        onCancel();
      }, 1200);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center fixed top-0 left-0 z-40 bg-slate-500/80">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-blue-500/80 z-50">
          {mode === "add" ? "Adding Post" : "Updating Post"}
        </div>
      )}
      <form
        className="flex relative top-0 left-0 flex-col gap-5 bg-white"
        onSubmit={handleSubmit}
      >
        {imgError && <p className="text-red-500">{imgError}</p>}
        {notif && <p className="text-green-500">{notif}</p>}
        {error && <p className="text-red-500">{errorNotif}</p>}
        <div className="flex w-full items-center justify-between">
          <p>{mode === "add" ? "Add FeedBack" : "Edit Post"}</p>
          <button type="button" onClick={() => onCancel()}>
            Cancel
          </button>
        </div>

        <input
          type="text"
          name="title"
          value={formData.title}
          placeholder="title"
          onChange={handleChange}
          required
        />

        <textarea
          placeholder="Let your voice be heard."
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
        />

        <select
          onChange={handleChange}
          value={formData.concern}
          name="concern"
          required
        >
          <option value="">Please Select</option>
          <option value="facility">Facility</option>
          <option value="student">Student</option>
          <option value="professor">Professor</option>
          <option value="etc">ETC</option>
        </select>

        <div>
          <p>Post as Anonymous? </p>
          <input
            type="checkbox"
            name="postAs"
            defaultChecked={formData.isChecked}
            onChange={checkboxChange}
          />
        </div>

        <div>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            ref={inputFileRef}
          />
          {formData.image && (
            <button type="button" onClick={RemovePhoto}>
              X
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={mode === "add" ? false : disabledBtn ? true : false}
          ref={formBtnRef}
          style={{
            cursor:
              mode === "add"
                ? "pointer"
                : disabledBtn
                ? "not-allowed"
                : "pointer",
          }}
        >
          {mode === "add"
            ? "Add Post"
            : mode === "edit"
            ? "Save Post"
            : formBtnRef.current?.click
            ? "Loading"
            : ""}
        </button>
      </form>
    </div>
  );
};

export default Form;
