import { AxiosError } from "axios";
import api from "../apiClient";
import { RegisterRequest, RegisterResponse } from "@/lib/types/types";

export async function registerUser(data: RegisterRequest) {
    try{
      const res = await api.post<RegisterResponse>("/register", data);
      return res.data
    }catch(err: unknown){ 
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message ||"Kayıt olunamadı")
    }
}