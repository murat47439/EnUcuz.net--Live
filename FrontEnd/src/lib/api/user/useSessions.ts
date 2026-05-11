import api from "../apiClient";
import { AxiosError } from "axios";
import { Sessions } from "@/lib/types/types";

export const useSessions = async () => {
    try {
        const response = await api.get('/refresh/sessions');
        return response.data as Sessions;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Bir hata oluştu");
        }
        throw new Error("Bir hata oluştu");
    }
}