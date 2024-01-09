export interface Input {
  type: "text" | "file" | "checkbox";
  className?: string;
  placeholder?: string;
  name?: string;
  onChange?: (data: any) => void;
  maxLength?: number;
  required?: boolean;
}
