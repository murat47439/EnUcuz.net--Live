import api from "../apiClient";
import { AxiosError } from "axios";
import { IdParam,Message } from "@/lib/types/types";

export async function deleteAttribute(data:IdParam) {
    try{
        const res = await api.delete<Message>(`/attribute/${data.id}`)
        return res.data
    }catch(err: unknown){
         const error = err as AxiosError<{message: string}>
        throw new Error(error?.response?.data?.message || "Özellik silinemedi.")
    }
}