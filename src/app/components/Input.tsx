import type { Input } from "@/types/input";
import React from "react";

function Input({
  type,
  placeholder,
  className,
  name,
  onChange,
  maxLength,
  required,
}: Input) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={className}
      name={name}
      onChange={onChange}
      maxLength={maxLength}
      required={required}
    />
  );
}

export default Input;
