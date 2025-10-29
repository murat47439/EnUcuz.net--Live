import { AxiosError } from "axios";
import api from "../apiClient";
import { ChatResponse, Chat } from "@/lib/types/types";

export async function addChat(data: Chat) {
    try{
      const res = await api.post<ChatResponse>("/chats", data);
      return res.data
    }catch(err: unknown){ 
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message ||"Sohbet oluşturulamadı.")
    }
}
