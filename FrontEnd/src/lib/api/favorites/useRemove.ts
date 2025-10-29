import { AxiosError } from "axios";
import api from "../apiClient";
import { Message, IdParam } from "@/lib/types/types";

export async function removeFavorite(data: IdParam) {
    try{
        const res = await api.delete<Message>(`/favourites/${data.id}`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Favori kaldırılamadı")
    }
}