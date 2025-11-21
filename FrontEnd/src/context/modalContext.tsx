"use client"

import React ,{ createContext, useState, ReactNode, useContext, useCallback } from "react";
import Modal from "@/features/components/modal";
type ModalContentType = React.ReactNode | null | (() => React.ReactNode);
export interface ModalContextType{
    isOpen: boolean;
    content: ModalContentType;
    openModal: (content: ModalContentType) => void;
    closeModal: () => void;
    refreshModal: () => void;
}

export const ModalContext = createContext<ModalContextType>({
    isOpen: false,
    content: null,
    openModal: () => {},
    closeModal: () => {},
    refreshModal: () => {},
});


export default function ModalProvider( {children} : {children: ReactNode}) {
    const [isOpen, SetIsOpen] = useState(false);
    const [content, setContent] = useState<ModalContentType>(null);
    const [renderKey, setRenderKey] = useState(0);
    
    const openModal = (content: ModalContentType) => {
                setContent(content);
                SetIsOpen(true);
                setRenderKey(prev => prev + 1);
            };

    const closeModal = () => {
        SetIsOpen(false);
        setTimeout(() => setContent(null), 300);
    };

    const refreshModal = useCallback(() => {
        if (isOpen) {
            setRenderKey(prev => prev + 1);
        }
    }, [isOpen]);

    return (
        <ModalContext.Provider value={{isOpen,content,openModal,closeModal,refreshModal}}>
            {children}
            <Modal renderKey={renderKey} />
        </ModalContext.Provider>
    );
}


export const UseModal = () => {
    return useContext(ModalContext)
};
