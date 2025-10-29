import { AxiosError } from "axios";
import api from "../apiClient";
import { Message, Product } from "@/lib/types/types";

export async function addProduct(data: Product) {
  try{
      const res = await api.post<Message>("/products/transactions", data);
      return res.data

    }catch(err: unknown){ 
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message ||"Ürün eklenemedi")
    }
}
