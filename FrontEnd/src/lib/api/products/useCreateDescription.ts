import { AxiosError } from "axios";
import api from "../apiClient";
import { AIRequest, AIResponse } from "@/lib/types/types";

export async function createDescription(data:AIRequest): Promise<AIResponse> {
    try{
        const res = await api.post<AIResponse>(`products/createdescription`,data)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string}>
        throw new Error(error?.response?.data?.message || "Açıklama oluşturulamadı.")
    }
}