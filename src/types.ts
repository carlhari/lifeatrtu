import { Dispatch } from "react";

export interface DataForm {
  id: string;
  title: string;
  content: string;
  postAs: boolean;
  concern: string;
  image?: string | null;
  user: UserData;
}

export interface FormProps {
  mode: "add" | "edit";
  initialData: DataForm;
}

export interface UserData {
  email: string | null;
  name: string | null;
}

export interface NavData {
  name: string | null;
}
