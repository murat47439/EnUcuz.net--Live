"use client"
import React, { useEffect, useState } from "react";
import Button from "@/features/components/button";
import Input from "@/features/components/input";
import Image from "next/image";
import { useAuth } from "@/context/authContext";
import { getUserProfile } from "@/lib/api/user/useProfile";
import { UserProfileResponse } from "@/lib/types/types";
import { useForm } from "react-hook-form";
import { updateUser } from "@/lib/api/user/useUpdate";
import { UpdateUserRequest } from "@/lib/types/types";
type FormData = {
    name: string,
    surname: string,
    email: string,
    phone: string
}
export default function ProfilePage() {
    const [user, setUser] = useState<UserProfileResponse>()
    const [result, setResult] = useState("")
    const methods = useForm<FormData>({
        defaultValues : {
        name: user?.data.user.name,
        surname: user?.data.user.surname,
        email: user?.data.user.email,
        phone: user?.data.user.phone
        }

    })
    const {logout} = useAuth();
    const {register, handleSubmit} = methods;
    useEffect(()=> {
        (async () =>{
            try{
                const data = await getUserProfile()
                if (!data.data.user) window.location.href = "/login"
                setUser(data)
            }catch{
                window.location.href = "/login";
            }
        })()
    }, []);
    if (!user) return <div>Yükleniyor...</div>

    const onSubmit = async(data: FormData) => {
        try{
            if(data.email == "" ||data.phone == "" || data.name == "" || data.surname == "") throw new Error("Lütfen tüm alanları doldurun.")
            const request : UpdateUserRequest = {
                id: user?.data.user.id,
                email: data.email,
                phone: data.phone,
                name: data.name,
                surname: data.surname
            }
            await updateUser(request)
            setResult("Profil başarıyla güncellendi");
            
        }catch(err: unknown){
            if (err instanceof Error) setResult(err.message)
            else setResult("Bir hata oluştu")
            
            
        }
    }
    return (
       <main className="container mx-auto max-w-5xl px-4 py-10">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    
    {/* Kullanıcı Profili */}
    <div className="flex flex-col items-center">
      <Image
        src="/default.png"
        className="rounded-full border border-gray-100 ring-4 ring-gray-50"
        alt={user.data.user.name}
        width={120}
        height={120}
      />
      <h2 className="mt-4 text-2xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
        {user.data.user.name}
      </h2>
      <p className="mt-1 inline-flex items-center rounded-full bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1">
        {user.data.user.gender}
      </p>
    </div>

    {/* Kişisel Bilgiler Başlığı */}
    <div className="flex flex-col justify-center">
      <h2 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Kişisel Bilgiler
      </h2>
      <p className="text-sm text-gray-500 mt-1">Bilgilerinizi güncel tutun.</p>
    </div>
  </div>

  {/* Form */}
  <form
    className="mt-10 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6"
    onSubmit={handleSubmit(onSubmit)}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Ad */}
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Ad</label>
        <Input
          {...register("name", { required: "Lütfen tüm alanları doldurun." })}
          type="text"
          defaultValue={user.data.user.name ?? ""}
          name="name"
          className="mt-2 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Soyad */}
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Soyad</label>
        <Input
          {...register("surname", { required: "Lütfen tüm alanları doldurun." })}
          type="text"
          defaultValue={user.data.user.surname ?? ""}
          name="surname"
          className="mt-2 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Telefon */}
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Telefon</label>
        <Input
          {...register("phone", { required: "Lütfen tüm alanları doldurun." })}
          type="tel"
          defaultValue={user.data.user.phone ?? ""}
          name="phone"
          className="mt-2 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">Email</label>
        <Input
          {...register("email", { required: "Lütfen tüm alanları doldurun." })}
          type="email"
          defaultValue={user.data.user.email ?? ""}
          name="email"
          className="mt-2 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

    </div>

    {/* Sonuç Mesajı */}
    {result && (
      <p className="text-green-600 text-center font-medium">{result}</p>
    )}

    {/* Gönderme Butonu */}
    <div className="flex justify-end">
      <Button
        type="submit"
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full shadow hover:from-blue-700 hover:to-indigo-700 transition"
      >
        Kaydet
      </Button>
    </div>
  </form>

  <form className="mt-10 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6 ">
        <h1 className="text-center font-extrabold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Şifre Değiştirme</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <span className="text-sm text-gray-700">Eski Şifre: <Input className="mt-2" /></span>
        <span className="text-sm text-gray-700">Yeni Şifre: <Input className="mt-2" /></span>
        <span className="text-sm text-gray-700">Yeni Şifre (Tekrar): <Input className="mt-2" /></span>
        </div>
        <Button type="submit" className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Şifreyi Değiştir</Button>
  </form>
  <div className="w-full flex justify-end mt-4"><Button className="text-white bg-red-700 p-4 rounded-full" style={{width: "150px "}} onClick={logout}>Çıkış yap</Button></div>
</main>
    )
}