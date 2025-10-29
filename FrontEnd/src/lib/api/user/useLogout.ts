import { AxiosError } from "axios";
import api from "../apiClient";
import { Message } from "@/lib/types/types";

export async function logoutUser() {
    try{
        const res = await api.get<Message>("/refresh/logout")
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Çıkış yapılamadı")
    }
}