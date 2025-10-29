import React from "react";

interface ButtonProbs extends React.ButtonHTMLAttributes<HTMLButtonElement>{
    children: React.ReactNode
    variant?: 'primary' | 'secondary'
    className?: string
}

const Button=({children, variant = 'primary',className = '', ...rest}: ButtonProbs) =>{
    const baseClasses = 'w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

    const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-400'
    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 border'

    return(
        <button className={ `${baseClasses} ${variantClasses} ${className}` } {...rest}> {children}</button>
    )
}
export default Button