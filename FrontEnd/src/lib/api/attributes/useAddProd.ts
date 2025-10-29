import api from "../apiClient";
import { AxiosError } from "axios";
import { AddProdAttribute, ProdAttributeRes } from "@/lib/types/types";

export async function addProdAttribute(data:AddProdAttribute) {
    try{
        const res = await api.post<ProdAttributeRes>(`/attribute/admin/p`, data);
        return res.data
    }catch(err: unknown){
         const error = err as AxiosError<{message: string}>
        throw new Error(error?.response?.data?.message || "Özellik eklenemedi.")
    }
}