import React from "react";

interface ButtonProbs extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: 'primary' | 'secondary'
    className?: string
}

const Button = ({ children, variant = 'primary', className = '', ...rest }: ButtonProbs) => {
    const baseClasses = 'w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = variant === 'primary'
        ? 'bg-[#ff6000] text-white hover:bg-[#e55500] focus:ring-[#ff6000]/30 shadow-sm'
        : 'bg-white text-gray-800 hover:bg-gray-50 focus:ring-gray-200 border border-gray-200'

    return (
        <button className={`${baseClasses} ${variantClasses} ${className}`} {...rest}> {children}</button>
    )
}
export default Button