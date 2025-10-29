import { AxiosError } from "axios";
import api from "../apiClient";
import { PaginationRequest, Brands } from "@/lib/types/types"


export async function getBrands(data: PaginationRequest) {
   try{
      const res = await api.get<Brands>(`/brands`,{params:{
         page: data.page,
         search: data.search
      }})
      return res.data
   }catch(err: unknown){
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message || "Marka bulunamadı.")
   }
}
