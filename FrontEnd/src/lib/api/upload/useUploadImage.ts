import api from "../apiClient";
import { AxiosError } from "axios";
import { UploadImageRequest, UploadImageResponse } from "@/lib/types/types";

export async function uploadImage(data: UploadImageRequest) {
    try{
        const formData = new FormData();
        formData.append("image", data.image);
        const res = await api.post<UploadImageResponse>(`/upload`, formData)
        return res.data
    }catch(err: unknown){
        const error = err as AxiosError<{message: string}>
        throw new Error(error?.response?.data?.message || `Resim yüklenemedi.`)
    }
}