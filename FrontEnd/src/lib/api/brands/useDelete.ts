import { AxiosError } from "axios";
import api from "../apiClient";
import { Message, IdParam } from "@/lib/types/types";

export async function deleteBrand(data: IdParam) {
    try{
        const res = await api.delete<Message>(`/admin/brands/${data.id}`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Marka silinemedi")
    }
}