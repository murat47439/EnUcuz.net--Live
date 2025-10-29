import { AxiosError } from "axios";
import api from "../apiClient";
import { PaginationRequest, Chats } from "@/lib/types/types"


export async function getChats(data: PaginationRequest) {
   try{
      const res = await api.get<Chats>(`/chats`,{params:{
         page: data.page
      }})
      return res.data
   }catch(err: unknown){
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message || "Marka bulunamadı.")
   }
}
