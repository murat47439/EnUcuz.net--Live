import { AxiosError } from "axios";
import api from "../apiClient";
import { IdParam, ProductDetail} from "@/lib/types/types";

export async function getProduct(data: IdParam): Promise<ProductDetail> {
    try{
        if (!data.id || isNaN(data.id)) {
            throw new Error("Geçersiz ürün ID");
        }
        const res = await api.get<ProductDetail>(`/products/${data.id}`)
        if (!res.data || !res.data.data || !res.data.data.product) {
            throw new Error("Ürün verisi bulunamadı");
        }
        return res.data
    }catch(err: unknown){
        if (err instanceof Error && 'response' in err) {
            const axiosError = err as AxiosError<{ message: string }>;
            console.error("[getProduct] AxiosError status:", axiosError.response?.status);
            console.error("[getProduct] AxiosError data:", JSON.stringify(axiosError.response?.data)?.substring(0, 500));
            console.error("[getProduct] AxiosError headers:", JSON.stringify(axiosError.response?.headers)?.substring(0, 500));
            throw new Error(axiosError.response?.data?.message || "Ürün bulunamadı");
        }
        if (err instanceof Error) {
            console.error("[getProduct] Error:", err.message);
            throw err;
        }
        console.error("[getProduct] Unknown error:", err);
        throw new Error("Ürün bulunamadı");
    }
}
