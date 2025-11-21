"use client"

import { useContext, useEffect, useState } from "react"
import { ModalContext } from "@/context/modalContext"
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ renderKey }: { renderKey?: number }){
    const {isOpen, content, closeModal} = useContext(ModalContext);
    const [forceUpdate, setForceUpdate] = useState(0);
    
    useEffect(() => {
        if (renderKey !== undefined) {
            setForceUpdate(renderKey);
        }
    }, [renderKey]);
    
    const renderContent = () => {
      if (typeof content === 'function') {
          return content();
      }
      return content;
  };
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

className="bg-white  p-6 rounded-2xl shadow-xl max-w-lg w-full overflow-y-auto max-h-[90vh]"

onClick={(e) => e.stopPropagation()}

initial={{ scale: 0.9, opacity: 0 }}

animate={{ scale: 1, opacity: 1 }}

exit={{ scale: 0.9, opacity: 0 }}

>
                  {/* ⭐️ İçeriği fonksiyon ile çağırıyoruz - forceUpdate ile yeniden render ediliyor */}
                  <div key={forceUpdate}>
                    {renderContent()}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    );
}