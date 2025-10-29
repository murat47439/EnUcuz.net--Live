import api from "../apiClient";
import { AxiosError } from "axios";
import { ProductAttribute, IdParam } from "@/lib/types/types";

export async function getProdAttributes(data:IdParam) {
    try{
        const res = await api.get<ProductAttribute[]>(`attribute/p/${data.id}`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{message: string}>
        throw new Error(error?.response?.data?.message || "Ürün özelliği bulunamadı.")
    }
}