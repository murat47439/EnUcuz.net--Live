import api from "../apiClient";
import { AxiosError } from "axios";
import { Offers } from "@/lib/types/types";

export async function GetBidderOffers() {
    try {
        const res = await api.get<Offers>("/offers/bidder")
        return res.data
    } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>
        throw new Error(error?.response?.data?.message || "Teklifler bulunamadı")
    }
}