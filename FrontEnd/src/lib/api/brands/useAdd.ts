import { AxiosError } from "axios";
import api from "../apiClient";
import { Message, Brand } from "@/lib/types/types";

export async function addBrands(data: Brand) {
    try{
      const res = await api.post<Message>("/admin/brands", data);
      return res.data
    }catch(err: unknown){ 
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message ||"Marka eklenemedi")
    }
}
