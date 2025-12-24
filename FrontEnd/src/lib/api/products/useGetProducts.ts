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
        if (!res.data || !res.data.data) {
            return { products: [], total: 0, page: 1, limit: 10 };
        }
        return res.data.data
    }catch(err: unknown){
        if (err instanceof Error && 'response' in err) {
            const axiosError = err as AxiosError<{ message: string }>;
            console.error("Products fetch error:", axiosError);
            if (typeof window === "undefined") {
                throw new Error(axiosError.response?.data?.message || "Ürünler bulunamadı");
            }
            return { products: [], total: 0, page: 1, limit: 10 };
        }
        if (err instanceof Error) {
            console.error("Products fetch error:", err);
            if (typeof window === "undefined") {
                throw err;
            }
            return { products: [], total: 0, page: 1, limit: 10 };
        }
        console.error("Products fetch error:", err);
        if (typeof window === "undefined") {
            throw new Error("Ürünler bulunamadı");
        }
        return { products: [], total: 0, page: 1, limit: 10 };
    }
}

