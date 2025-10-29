
import { AxiosError } from "axios";
import api from "../apiClient";
import { IdParam } from "@/lib/types/types";

export async function checkChat(data: IdParam): Promise<boolean> {
    try{
        const res = await api.get<boolean>(`/chats/check/${data.id}`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Sohbet bulunamadı")
    }
}