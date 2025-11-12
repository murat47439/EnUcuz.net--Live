"use client"

import React ,{ createContext, useState, ReactNode, useContext } from "react";
import Modal from "@/features/components/modal";
export interface ModalContextType{
    isOpen: boolean;
    content: React.ReactNode | null;
    openModal: (content: React.ReactNode) => void;
    closeModal: () => void; 
}

export const ModalContext = createContext<ModalContextType>({
    isOpen: false,
    content: null,
    openModal: () => {},
    closeModal: () => {},
});


export default function ModalProvider( {children} : {children: ReactNode}) {
    const [isOpen, SetIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);
    
    const openModal = (content: ReactNode) => {
        setContent(content);
        SetIsOpen(true)
    };

    const closeModal = () => {
        SetIsOpen(false);
        setTimeout(() => setContent(null), 300);
    };

    return (
        <ModalContext.Provider value={{isOpen,content,openModal,closeModal}}>
            {children}
            <Modal />
        </ModalContext.Provider>
    );
}


export const UseModal = () => {
    return useContext(ModalContext)
};
