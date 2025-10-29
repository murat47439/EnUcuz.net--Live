import { AxiosError } from "axios";
import api from "../apiClient";
import { UpdateUserRequest, UpdateUserResponse } from "@/lib/types/types";

export async function updateUser(data: UpdateUserRequest) {
    try{
        const res = await api.put<UpdateUserResponse>("/profile/update", data)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Kullanıcı güncellenemedi")
    }
}