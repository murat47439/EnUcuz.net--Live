import { AxiosError } from "axios";
import api from "../apiClient";
import { Offers } from "@/lib/types/types";

export async function GetSellerOffers() {
    try {
        const res = await api.get<Offers>("/offers")
        return res.data
    } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>;
        throw new Error(error?.response?.data?.message || "Teklifler bulunamadı")
    }
}