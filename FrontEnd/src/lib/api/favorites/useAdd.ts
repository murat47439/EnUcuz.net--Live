import { AxiosError } from "axios";
import api from "../apiClient";
import { Message, Product } from "@/lib/types/types";

export async function addFavorite(data: Product) {
    try{
      const res = await api.post<Message>("/favourites", data);
      return res.data
    }catch(err: unknown){ 
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message ||"Favori eklenemedi")
    }
}
