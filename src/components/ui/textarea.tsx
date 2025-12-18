import * as React from "react";
import styles from "./textarea.module.css";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea className={`${styles.textarea} ${className}`} {...props} />
  );
}
