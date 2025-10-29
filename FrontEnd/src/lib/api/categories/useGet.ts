import { AxiosError } from "axios";
import api from "../apiClient";
import { Category, IdParam } from "@/lib/types/types";


export async function GetCategory(data: IdParam) {
    try{
        const res = await api.get<Category>(`/categories/${data.id}`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Kategori bulunamadı")
    }
}
