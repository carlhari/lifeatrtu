"use client";
import React from "react";
import { ButtonProps } from "@/types/button";

const Button: React.FC<ButtonProps> = ({
  label,
  className,
  onClick,
  onSubmit,
  type,
}) => {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      onSubmit={onSubmit}
    >
      {label}
    </button>
  );
};

export default Button;
