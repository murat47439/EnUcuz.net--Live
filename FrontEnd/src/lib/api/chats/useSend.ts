import { AxiosError } from "axios";
import api from "../apiClient";
import { Message } from "@/lib/types/types";

export async function sendMessage(data: Message) {
    try{
      const res = await api.post<string>("/chats/message", data);
      return res.data
    }catch(err: unknown){ 
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message ||"Mesaj gönderilemedi.")
    }
}
