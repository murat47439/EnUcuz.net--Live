import { AxiosError } from "axios";
import api from "../apiClient";
import { UpdateProductRequest, UpdateProductResponse } from "@/lib/types/types";

export async function updateProductAdmin(data: UpdateProductRequest) {
    try{
        const res = await api.put<UpdateProductResponse>(`/admin/products/${data.id}`, data)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Ürün güncellenemedi")
    }
}
