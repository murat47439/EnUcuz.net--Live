import api from "../apiClient";
import { AxiosError } from "axios";
import { CategoryAttribute,CategoryAttributeRes  } from "@/lib/types/types";

export async function addCatAttribute(data:CategoryAttribute) {
    try{
        const res = await api.post<CategoryAttributeRes>(`/attribute/admin/c`, data);
        return res.data
    }catch(err: unknown){
         const error = err as AxiosError<{message: string}>
        throw new Error(error?.response?.data?.message || "Özellik eklenemedi.")
    }
}