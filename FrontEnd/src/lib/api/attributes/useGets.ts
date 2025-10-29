import { Attribute, PaginationRequest } from "@/lib/types/types";
import { AxiosError } from "axios";
import api from "../apiClient";

export async function getAttributes(data:PaginationRequest) {
    try{
        const res = await api.get<Attribute[]>(`/attribute`, {params:{
        page: data.page,
        search : data.search
    }})
    return res.data
}catch(err: unknown){
    const error = err as AxiosError<{message: string}>;
    throw new Error(error?.response?.data?.message || "Özellik bulunamadı.")
}

}