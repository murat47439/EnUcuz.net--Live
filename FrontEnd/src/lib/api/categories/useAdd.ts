import { AxiosError } from "axios";
import api from "../apiClient";
import { CreateCategoryRequest, CreateCategoryResponse} from "@/lib/types/types";

export async function addCategory(data: CreateCategoryRequest) {
    try{
      const res = await api.post<CreateCategoryResponse>("/admin/categories",data);
      return res.data
    }catch(err: unknown){ 
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message ||"Kategori eklenemedi")
    }
}