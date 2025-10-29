import { AxiosError } from "axios";
import api from "../apiClient";
import { Message, CreateReviewRequest } from "@/lib/types/types";

export async function addReview(data: CreateReviewRequest) {
    try{
      const res = await api.post<Message>("/reviews", data);
      return res.data
    }catch(err: unknown){ 
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message ||"Yorum eklenemedi")
    }
}
