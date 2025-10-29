import React from "react";

interface InputProbs extends React.InputHTMLAttributes<HTMLInputElement>{
    className?:string;
    children?: React.ReactNode;
}

const Input = ({children,className = '', ...rest}: InputProbs) => {
    const baseClasses = 'w-full p-3 pl-10 rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition'

    return (
        <div className="relative flex items-center w-full">
            {children && (
                <span className="absolute left-3 text-gray-400 pointer-events-none">{children}</span>
            )}
            <input className={`${baseClasses} ${className}`} {...rest} />
        </div>
    )
}
export default Input