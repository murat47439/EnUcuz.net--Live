import api from "../apiClient";
import { AxiosError } from "axios";
import { CategoryAttributeRes, IdParam } from "@/lib/types/types";

export async function getCategoryAttributes(data:IdParam) {
    try{
        const res = await api.get<CategoryAttributeRes>(`attribute/c/${data.id}`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{message: string}>  
        throw new Error(error?.response?.data?.message || "Kategori özellikleri bulunamadı.")
    }
}