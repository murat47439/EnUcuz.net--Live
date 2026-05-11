import api from "../apiClient";
import { AxiosError } from "axios";
import { Message } from "@/lib/types/types";

export async function useDropSession(id: string): Promise<Message> {
    try {
        const response = await api.delete(`/refresh/sessions/${id}`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Bir hata oluştu");
        }
        throw new Error("Bir hata oluştu");
    }
}