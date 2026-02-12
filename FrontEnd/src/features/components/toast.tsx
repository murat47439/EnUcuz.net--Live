import { CheckIcon, AlertTriangleIcon, CircleAlert, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationType } from "@/lib/types/types";

type ToastProbs = {
  id?: number;
  message: string;
  type: NotificationType;
  duration?: number;
  onClose(): void;
}

const iconClasses = "h-4 w-4 mr-2.5 flex-shrink-0"
const ToastNotification = ({ message, type, duration = 3000, onClose }: ToastProbs) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  let classes = "";
  let Icon = null;

  switch (type) {
    case 'success':
      classes = "bg-white border-green-200 text-green-800";
      Icon = CheckIcon;
      break;
    case 'warning':
      classes = "bg-white border-yellow-200 text-yellow-800";
      Icon = AlertTriangleIcon;
      break;
    case 'error':
      classes = "bg-white border-red-200 text-red-800";
      Icon = CircleAlert;
      break;
    case 'info':
      classes = "bg-white border-gray-200 text-gray-800";
      Icon = CircleAlert;
      break;
    default:
      classes = "bg-white border-gray-200 text-gray-700";
      Icon = AlertTriangleIcon;

  }
  if (!isVisible) return null;
  return (
    <div
      className={`
        fixed top-20 right-4 z-50 py-3 px-4 border rounded-lg shadow-lg 
        flex items-center transition-all duration-300 ease-out 
        transform translate-x-0 opacity-100 max-w-sm
        ${classes}
      `}
      role="alert"
    >
      {Icon && <Icon className={iconClasses} />}
      <p className="text-sm font-medium">{message}</p>

      {/* Kapatma butonu */}
      <button
        onClick={() => { setIsVisible(false); onClose(); }}
        className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Kapat"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ToastNotification