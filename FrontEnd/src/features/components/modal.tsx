"use client"

import { useContext } from "react"
import { ModalContext } from "@/context/modalContext"
import { motion, AnimatePresence } from "framer-motion";

export default function Modal(){
    const {isOpen, content, closeModal} = useContext(ModalContext);
    return( 
        <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-lg w-full overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    );
}