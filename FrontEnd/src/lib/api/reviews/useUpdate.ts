import { AxiosError } from "axios";
import api from "../apiClient";
import { Message, UpdateReviewRequest } from "@/lib/types/types";

export async function updateReview(data: UpdateReviewRequest) {
    try{
        const res = await api.put<Message>("/reviews", data)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Yorum güncellenemedi")
    }
}
