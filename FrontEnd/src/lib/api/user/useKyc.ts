import api from "../apiClient";
import { AxiosError } from "axios";
import { KycResponse } from "@/lib/types/types";

export async function KycRequest(): Promise<KycResponse> {
    try {
        const response = await api.post(`/kyc/`);
        return response.data.data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || "Bir hata oluştu");
        }
        throw new Error("Bir hata oluştu");
    }
}