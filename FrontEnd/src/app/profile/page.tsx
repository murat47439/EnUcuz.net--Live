"use client"
import { useEffect, useState } from "react";
import Button from "@/features/components/button";
import Input from "@/features/components/input";
import Image from "next/image";
import { useAuth } from "@/context/authContext";
import { getUserProfile } from "@/lib/api/user/useProfile";
import { UserProfileResponse } from "@/lib/types/types";
import { useForm } from "react-hook-form";
import { updateUser } from "@/lib/api/user/useUpdate";
import { UpdateUserRequest } from "@/lib/types/types";
import { User, Mail, CheckCircle, XCircle, LogOut } from "lucide-react";
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
    if (!user) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mb-3"></div>
                <p className="text-sm text-gray-500">Yükleniyor...</p>
            </div>
        </div>
    )

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
       <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
  {/* Profil Header */}
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div>
          <Image
            src="/default.png"
            className="rounded-full border-2 border-gray-200"
            alt={user.data.user.name}
            width={100}
            height={100}
          />
        </div>
        
        {/* Kullanıcı Bilgileri */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {user.data.user.name} {user.data.user.surname}
          </h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
              <User size={14} />
              {user.data.user.gender}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
              <Mail size={14} />
              {user.data.user.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Kişisel Bilgiler Formu */}
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Kişisel Bilgiler</h2>
      <p className="text-sm text-gray-500 mt-1">Hesap bilgilerinizi güncelleyin</p>
    </div>
    
    <form
      className="p-6 space-y-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ad
          </label>
          <Input
            {...register("name", { required: "Lütfen tüm alanları doldurun." })}
            type="text"
            defaultValue={user.data.user.name ?? ""}
            name="name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Soyad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soyad
          </label>
          <Input
            {...register("surname", { required: "Lütfen tüm alanları doldurun." })}
            type="text"
            defaultValue={user.data.user.surname ?? ""}
            name="surname"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon
          </label>
          <Input
            {...register("phone", { required: "Lütfen tüm alanları doldurun." })}
            type="tel"
            defaultValue={user.data.user.phone ?? ""}
            name="phone"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            {...register("email", { required: "Lütfen tüm alanları doldurun." })}
            type="email"
            defaultValue={user.data.user.email ?? ""}
            name="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Sonuç Mesajı */}
      {result && (
        <div className={`p-3 rounded-md flex items-center gap-2 text-sm ${
          result.includes('başarıyla') || result.includes('Başarılı')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {result.includes('başarıyla') || result.includes('Başarılı') ? (
            <CheckCircle size={16} className="flex-shrink-0" />
          ) : (
            <XCircle size={16} className="flex-shrink-0" />
          )}
          <span>{result}</span>
        </div>
      )}

      {/* Gönderme Butonu */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Kaydet
        </Button>
      </div>
    </form>
  </div>

  {/* Şifre Değiştirme Formu */}
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h2>
      <p className="text-sm text-gray-500 mt-1">Güvenliğiniz için şifrenizi düzenli olarak güncelleyin</p>
    </div>
    
    <form className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eski Şifre
          </label>
          <Input
            type="password"
            placeholder="Mevcut şifreniz"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yeni Şifre
          </label>
          <Input
            type="password"
            placeholder="En az 8 karakter"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yeni Şifre (Tekrar)
          </label>
          <Input
            type="password"
            placeholder="Şifrenizi tekrar girin"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button
          type="submit"
          className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          Şifreyi Değiştir
        </Button>
      </div>
    </form>
  </div>

  {/* Çıkış Yap Butonu */}
  <div className="flex justify-end">
    <Button
      onClick={logout}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
    >
      <LogOut size={16} />
      Çıkış Yap
    </Button>
  </div>
</main>
    )
}