import { AxiosError } from "axios";
import api from "../apiClient";
import { PaginationRequest, ProductsListResponse } from "@/lib/types/types";

export async function getProducts(data: PaginationRequest) {
    try{
        const params = new URLSearchParams();
        if (data.page) params.append('page', String(data.page));
        if (data.brand) params.append('brand', String(data.brand));
        if (data.category) params.append('category',String(data.category));
        if (data.search) params.append('search', data.search);
        
        
        const res = await api.get<ProductsListResponse>(`/products?${params}`)
        return res.data.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Ürünler bulunamadı")
    }
}

