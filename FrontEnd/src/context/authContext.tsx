"use client"

import { createContext, useContext,useState, ReactNode, useEffect } from "react"
import { logoutUser } from "@/lib/api/user/useLogout";
interface User {
  id: number;
  role?: string;
  email: string;
  name: string;
  surname?: string;
  phone?: string;
  gender?: number;
}

interface AuthContextType {
    user?: User;
    setUser: (user?: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) =>{
    const [user,setUser] = useState<User | undefined>(undefined);
   
    useEffect(() => {
    try {
        const storedUser = localStorage.getItem("user");

        // null veya "undefined" string kontrolü
        if (storedUser && storedUser !== "undefined") {
            setUser(JSON.parse(storedUser));
        } else {
            setUser(undefined);
            localStorage.removeItem("user"); // temizle
        }
    } catch (error) {
        console.error("localStorage parsing error:", error);
        localStorage.removeItem("user");
        setUser(undefined);
    }
}, []);

    const logout = async () => {
        setUser(undefined)
        try{
            localStorage.removeItem("user");
            const log = await logoutUser()
            console.log(log.message)
            setTimeout(() => {
                window.location.href = "/";
              }, 100);
        }catch(err: unknown){
            if (err instanceof Error){
                throw new Error(err.message)
            } else{
                throw new Error("Bir hata oluştu.")
            }  
        }
        localStorage.removeItem("user");
        
    }
    return (
        <AuthContext.Provider value={{user,setUser,logout}} >{children}</AuthContext.Provider>
    );
 };

 export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be  used within AuthProvider");
    return context;
 }