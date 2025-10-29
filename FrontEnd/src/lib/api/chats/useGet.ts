
import { AxiosError } from "axios";
import api from "../apiClient";
import { IdParam, ChatMessages } from "@/lib/types/types";

export async function getChat(data: IdParam): Promise<ChatMessages> {
    try{
        const res = await api.get<ChatMessages>(`/chats/${data.id}`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Sohbet bulunamadı")
    }
}