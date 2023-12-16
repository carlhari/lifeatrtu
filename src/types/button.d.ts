export interface ButtonProps {
  className?: string;
  label: string | undefined | null;
  type: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  onSubmit?: () => void;
}
