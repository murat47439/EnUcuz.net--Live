import { AxiosError } from "axios";
import api from "../apiClient";
import { IdParam, ReviewDetailResponse } from "@/lib/types/types";

export async function getReview(data: IdParam) {
    try{
        const res = await api.get<ReviewDetailResponse>(`/reviews/${data.id}`)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Yorum bulunamadı")
    }
}
