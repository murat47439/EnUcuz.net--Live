"use client"
import React, { useRef } from "react";
import { useEffect } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  children?: React.ReactNode;
  as?: "input" | "textarea"; // ✅ yeni prop
}

const Input = ({ children, className = '', as = "input", defaultValue, ...rest }: InputProps) => {
  const baseClasses =
    "w-full p-2.5 pl-10 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#ff6000]/20 focus:border-[#ff6000] transition-all outline-none";

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [defaultValue]);
  return (
    <div className="relative flex items-start w-full">
      {children && (
        <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
          {children}
        </span>
      )}

      {as === "textarea" ? (
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          defaultValue={defaultValue}
          className={`${baseClasses} ${className} overflow-hidden resize-none min-h-[80px]`}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input defaultValue={defaultValue} className={`${baseClasses} ${className}`} {...rest} />
      )}
    </div>
  );
};

export default Input;
