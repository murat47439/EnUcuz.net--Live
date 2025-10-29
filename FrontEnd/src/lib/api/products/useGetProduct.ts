import { AxiosError } from "axios";
import api from "../apiClient";
import { IdParam, ProductDetail} from "@/lib/types/types";

export async function getProduct(data: IdParam): Promise<ProductDetail> {
    try{
        const res = await api.get<ProductDetail>(`/products/${data.id}`)
        console.log(res)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Ürün bulunamadı")
    }
}