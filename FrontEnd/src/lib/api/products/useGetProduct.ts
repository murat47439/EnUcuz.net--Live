import { AxiosError } from "axios";
import api from "../apiClient";
import { IdParam, ProductDetail} from "@/lib/types/types";

export async function getProduct(data: IdParam): Promise<ProductDetail> {
    try{
        if (!data.id || isNaN(data.id)) {
            throw new Error("Geçersiz ürün ID");
        }
        const res = await api.get<ProductDetail>(`/products/${data.id}`)
        // API'den gelen price integer (cent/kuruş) formatında, olduğu gibi bırakıyoruz
        // Component'lerde (price / 100).toFixed(2) ile gösterilecek
        if (!res.data || !res.data.data || !res.data.data.product) {
            throw new Error("Ürün verisi bulunamadı");
        }
        return res.data
    }catch(err: unknown){
        // AxiosError kontrolü
        if (err instanceof Error && 'response' in err) {
            const axiosError = err as AxiosError<{ message: string }>;
            throw new Error(axiosError.response?.data?.message || "Ürün bulunamadı");
        }
        // Genel Error kontrolü
        if (err instanceof Error) {
            throw err;
        }
        // Bilinmeyen hata
        throw new Error("Ürün bulunamadı");
    }
}