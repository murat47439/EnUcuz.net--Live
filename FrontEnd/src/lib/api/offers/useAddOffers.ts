import { Message, NewOffer } from "@/lib/types/types";
import api from "../apiClient";
import { AxiosError } from "axios";

export async function AddOffer(params: NewOffer) {
    try {
        const res = await api.post<Message>("/offers", params)
        return res.data
    } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>
        throw new Error(error?.response?.data?.message || "Teklif ekleme başarısız")
    }
}