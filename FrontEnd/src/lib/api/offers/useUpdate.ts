import api from "../apiClient";
import { AxiosError } from "axios";
import { Message, UpdateOfferModel } from "@/lib/types/types";

export async function UpdateOffer(params: UpdateOfferModel) {
    try {
        const res = await api.put<Message>(`/offers/${params.id}`, { action: params.action })
        return res.data
    } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>
        throw new Error(error?.response?.data?.message || "Teklif güncellenemedi")
    }
}