import { Input } from "@/types/input";
import React from "react";

function Input({
  type,
  placeholder,
  className,
  name,
  onChange,
  required,
}: Input) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={className}
      name={name}
      onChange={onChange}
      required={required}
    />
  );
}

export default Input;
