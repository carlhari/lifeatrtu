export interface ButtonProps {
  className?: string;
  label: string;
  type: "button" | "submit";
  onClick?: () => void;
  onSubmit?: () => void;
}
