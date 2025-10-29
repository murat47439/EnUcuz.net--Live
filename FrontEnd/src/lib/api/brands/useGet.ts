
import { AxiosError } from "axios";
import api from "../apiClient";
import { IdParam, Brand } from "@/lib/types/types";

export async function getBrand(data: IdParam): Promise<Brand> {
    try{
        const res = await api.get<Brand>(`/brands/${data.id}`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Marka bulunamadı")
    }
}