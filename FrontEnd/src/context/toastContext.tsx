"use client"
import crypto from 'crypto';
import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastNotification from '@/features/components/toast';// Kendi bileşen yolunuz
import { NotificationType, Notification, ToastContextType } from '@/lib/types/types';

const ToastContext = createContext<ToastContextType | undefined>(undefined);


export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Provider: Tüm bildirimleri yöneten bileşen
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType, duration?: number) => {
        const id = parseInt(crypto.randomBytes(4).toString("hex"), 16);
        const newNotification: Notification = { id, message, type, duration };

        setNotifications((prev) => [...prev, newNotification]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter(n => n.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showNotification }}>
            {children}
            
            {/* Bildirimlerin render edildiği yer */}
            <div className="fixed top-4 right-4 z-[9999] space-y-2">
                {notifications.map((notification) => (
                    <ToastNotification 
                        key={notification.id}
                        message={notification.message}
                        type={notification.type}
                        duration={notification.duration}
                        // Kapatma işlemi, listeden kaldırma fonksiyonunu çağırır
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};