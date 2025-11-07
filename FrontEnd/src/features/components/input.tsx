import React, { useRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  children?: React.ReactNode;
  as?: "input" | "textarea"; // ✅ yeni prop
}

const Input = ({ children, className = '', as = "input", ...rest }: InputProps) => {
  const baseClasses =
    "w-full p-3 pl-10 rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition";

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="relative flex items-start w-full">
      {children && (
        <span className="absolute left-3 top-3 text-gray-400 pointer-events-none">
          {children}
        </span>
      )}

      {as === "textarea" ? (
        <textarea
          ref={textareaRef}
          onInput={handleInput}
          className={`${baseClasses} ${className} overflow-hidden resize-none min-h-[80px]`}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input className={`${baseClasses} ${className}`} {...rest} />
      )}
    </div>
  );
};

export default Input;
