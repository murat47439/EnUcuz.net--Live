import api from "../apiClient";
import { AxiosError } from "axios";


export async function GetLogs() {
    try{
        const res = await api.get(`/admin/logs`);
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{message: string}>
        throw new Error(error?.response?.data?.message || "Özellik eklenemedi.")

    }
}