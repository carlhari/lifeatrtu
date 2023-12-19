export interface ButtonProps {
  className?: string;
  label: string | undefined | null;
  BsIncognito?: boolean;
  type: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  onSubmit?: () => void;
}
