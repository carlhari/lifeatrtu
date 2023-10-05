import { Dispatch } from "react";

export interface DataForm {
  email: string | null;
  title: string;
  content: string;
  postAs: boolean;
  concern: string;
  image?: string | null;
}

export interface FormProps {
  mode: "add" | "edit";
  initialData: DataForm;
  setOpen: (data: boolean) => void;
}

export interface UserData {
  email: string;
  name: string;
}

export interface NavData {
  name: string | null;
}
