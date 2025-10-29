import { AxiosError } from "axios";
import api from "../apiClient";
import { ReviewsListResponse } from "@/lib/types/types";

export async function getUserReviews() {
    try{
        const res = await api.get<ReviewsListResponse>("/profile/reviews")
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Kullanıcı yorumları bulunamadı")
    }
} 