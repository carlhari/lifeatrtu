export interface DataForm {
  id: string;
  title: string;
  userId: string;
  content: string;
  isChecked: boolean;
  concern: string;
  image?: string | null;
  user: UserData;
}

export interface FormProps {
  mode: "add" | "edit";
  initialData: DataForm;
  onCancel: () => void;
}

export interface UserData {
  id: string;
  email: string | null;
  name: string | null;
}

export interface NavData {
  name: string | null;
}

export interface DetailsForm {
  formData: DataForm;
  onCancel: () => void;
}
