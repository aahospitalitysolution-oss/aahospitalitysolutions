import * as React from "react";
import styles from "./input.module.css";

// Use type alias to avoid empty interface lint error
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input className={`${styles.input} ${className}`} {...props} />
  );
}
