import { AxiosError } from "axios";
import api from "../apiClient";
import { Message } from "@/lib/types/types";

export async function refreshToken() {
    try{
        const res = await api.get<Message>("/refresh")
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Token yenilenemedi")
    }
}