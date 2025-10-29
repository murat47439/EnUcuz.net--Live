import { CheckIcon, AlertTriangleIcon, CircleAlert, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationType } from "@/lib/types/types";

type ToastProbs = {
    id?: number;
    message: string;
    type:NotificationType;
    duration? :number;
    onClose():void;
}

const iconClasses = "h-5 w-5 mr-3"
const ToastNotification = ({message, type, duration=3000, onClose}: ToastProbs) => {
    const [isVisible,setIsVisible] = useState(true)

    useEffect(()=>{
        const timer = setTimeout(()=>{
            setIsVisible(false)
            onClose();
        }, duration);
    return () => clearTimeout(timer);   
    },[duration,onClose]);
    let classes = "";
    let Icon = null;

    switch(type) {
        case 'success':
      classes = "bg-green-100 border-green-400 text-green-700";
      Icon = CheckIcon;
      break;
    case 'warning':
      classes = "bg-yellow-100 border-yellow-400 text-yellow-700";
      Icon = AlertTriangleIcon;
      break;
    case 'error':
      classes = "bg-red-100 border-red-400 text-red-700";
      Icon = CircleAlert;
      break;
    case 'info': 
        classes = "bg-blue-100 border-blue-400 text-blue-700";
        Icon = CircleAlert; // Veya başka bir ikon, örneğin CircleAlert veya Info
        break;
    default:
      classes = "bg-gray-100 border-gray-400 text-gray-700";
      Icon = AlertTriangleIcon;

    }
    if (!isVisible) return null;
  return (
    <div
      className={`
        fixed top-4 right-4 z-50 p-4 border rounded-xl shadow-xl 
        flex items-center space-x-4 transition-all duration-300 ease-out 
        transform translate-x-0 opacity-100 backdrop-blur-sm
        ${classes}
      `}
      role="alert"
    >
      {Icon && <Icon className={iconClasses} />}
      <p className="text-sm font-medium">{message}</p>
      
      {/* İsteğe bağlı kapatma butonu */}
      <button 
        onClick={() => { setIsVisible(false); onClose(); }}
        className={`ml-4 ${classes.includes('text-') ? classes.split(' ').find(c => c.startsWith('text-')) : 'text-gray-700'} opacity-70 hover:opacity-100`}
        aria-label="Kapat"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ToastNotification