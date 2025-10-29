import { AxiosError } from "axios";
import api from "../apiClient";
import { Message, UpdateCategoryRequest } from "@/lib/types/types"

export async function UpdCatData(data: UpdateCategoryRequest) {
   try{
      const res = await api.put<Message>(`/admin/categories/${data.id}`,data)
      return res.data
   }catch(err: unknown){
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message || "Kategori güncellenemedi")
   }
}
