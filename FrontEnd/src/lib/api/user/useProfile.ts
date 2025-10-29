import { AxiosError } from "axios";
import api from "../apiClient";
import { UserProfileResponse } from "@/lib/types/types";

export async function getUserProfile() {
    try{
        const res = await api.get<UserProfileResponse>("/profile")
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Profil bulunamadı")
    }
}