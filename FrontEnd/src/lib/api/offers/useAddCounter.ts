import api from "../apiClient";
import { AxiosError } from "axios";
import { Counter, Message } from "@/lib/types/types";

export async function AddCounter(params: Counter) {
    try {
        const res = await api.post<Message>(`/offers/counter/${params.offerId}`, { price: params.price })
        return res.data
    } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>
        throw new Error(error?.response?.data?.message || "Teklif ekleme başarısız")
    }
}