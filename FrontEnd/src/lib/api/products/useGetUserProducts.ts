import { AxiosError } from "axios";
import api from "../apiClient";
import { UserProducts } from "@/lib/types/types";

export async function GetUserProducts(): Promise<UserProducts> {
    try{
        const res = await api.get<UserProducts>(`/profile/products`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{message: string}>
        throw new Error(error?.response?.data?.message || "Ürün yok")
    }
}