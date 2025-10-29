import { AxiosError } from "axios";
import api from "../apiClient";
import { UserProfileResponse, LoginRequest } from "@/lib/types/types";

export async function loginUser(data: LoginRequest) {
    try{
      const res = await api.post<UserProfileResponse>("/login", data);
      return res.data
    }catch(err: unknown){ 
      const error = err as AxiosError<{ message: string }>;
      throw new Error(error?.response?.data?.message ||"Giriş yapılamadı")
    }
}