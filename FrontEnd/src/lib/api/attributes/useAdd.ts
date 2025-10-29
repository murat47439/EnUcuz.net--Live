import api from "../apiClient";
import { AxiosError } from "axios";
import { Attribute, AddAttributeRes } from "@/lib/types/types";

export async function addAttribute(data:Attribute) {
    try{
        const res = await api.post<AddAttributeRes>(`/attribute`, data);
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{message: string}>
        throw new Error(error?.response?.data?.message || "Özellik eklenemedi.")
    }
}