"use client"
import { useEffect, useState } from "react";
import Button from "@/features/components/button";
import Input from "@/features/components/input";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/authContext";
import { getUserProfile } from "@/lib/api/user/useProfile";
import { UserProfileResponse } from "@/lib/types/types";
import { useForm } from "react-hook-form";
import { updateUser } from "@/lib/api/user/useUpdate";
import { UpdateUserRequest } from "@/lib/types/types";
import { User, Monitor, Mail, CheckCircle, XCircle, LogOut, Package, Heart, Gavel, ChevronRight, ShieldCheck, Phone } from "lucide-react";
import PageLoader from "@/features/components/pageLoader";

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
    defaultValues: {
      name: user?.data.user.name,
      surname: user?.data.user.surname,
      email: user?.data.user.email,
      phone: user?.data.user.phone
    }
  })
  const { logout } = useAuth();
  const { register, handleSubmit } = methods;

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserProfile()
        if (!data.data.user) window.location.href = "/login"
        setUser(data)
      } catch {
        window.location.href = "/login";
      }
    })()
  }, []);

  if (!user) return <PageLoader label="Profil yükleniyor" />;

  const onSubmit = async (data: FormData) => {
    try {
      if (data.email == "" || data.phone == "" || data.name == "" || data.surname == "") throw new Error("Lütfen tüm alanları doldurun.")
      const request: UpdateUserRequest = {
        id: user?.data.user.id,
        email: data.email,
        phone: data.phone,
        name: data.name,
        surname: data.surname
      }
      await updateUser(request)
      setResult("Profil başarıyla güncellendi");
    } catch (err: unknown) {
      if (err instanceof Error) setResult(err.message)
      else setResult("Bir hata oluştu")
    }
  }

  const menuItems = [
    { label: "Ürünlerim", href: "/profile/products", icon: Package },
    { label: "Favorilerim", href: "/profile/favories", icon: Heart },
    { label: "Tekliflerim", href: "/profile/tekliflerim", icon: Gavel },
    { label: "Oturumlarım", href: "/profile/oturumlar", icon: Monitor },

  ];

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Sol Sidebar */}
        <div className="lg:col-span-1">
          {/* Profil Kartı */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/default.png"
                className="rounded-full border-2 border-gray-100 mb-3"
                alt={user.data.user.name}
                width={72}
                height={72}
              />
              <h2 className="text-base font-bold text-gray-900">
                {user.data.user.name} {user.data.user.surname}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                <Mail size={11} />
                {user.data.user.email}
              </div>
              {user.data.user.phone && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                  <Phone size={11} />
                  {user.data.user.phone}
                </div>
              )}
            </div>
          </div>

          {/* Navigasyon */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
            <nav>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#ff6000] border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={16} className="text-gray-400" />
                    {item.label}
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Çıkış */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <LogOut size={15} />
            Çıkış Yap
          </button>
        </div>

        {/* Sağ İçerik */}
        <div className="lg:col-span-3 space-y-5">
          {/* Kişisel Bilgiler */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#fff4ed] flex items-center justify-center">
                <User size={16} className="text-[#ff6000]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Kişisel Bilgiler</h2>
                <p className="text-xs text-gray-500">Hesap bilgilerinizi güncelleyin</p>
              </div>
            </div>

            <form className="p-5 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Ad</label>
                  <Input
                    {...register("name", { required: "Lütfen tüm alanları doldurun." })}
                    type="text"
                    defaultValue={user.data.user.name ?? ""}
                    name="name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Soyad</label>
                  <Input
                    {...register("surname", { required: "Lütfen tüm alanları doldurun." })}
                    type="text"
                    defaultValue={user.data.user.surname ?? ""}
                    name="surname"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Telefon</label>
                  <Input
                    {...register("phone", { required: "Lütfen tüm alanları doldurun." })}
                    type="tel"
                    defaultValue={user.data.user.phone ?? ""}
                    name="phone"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Email</label>
                  <Input
                    {...register("email", { required: "Lütfen tüm alanları doldurun." })}
                    type="email"
                    defaultValue={user.data.user.email ?? ""}
                    name="email"
                  />
                </div>
              </div>

              {result && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${result.includes('başarıyla') || result.includes('Başarılı')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                  {result.includes('başarıyla') || result.includes('Başarılı') ? (
                    <CheckCircle size={15} className="flex-shrink-0" />
                  ) : (
                    <XCircle size={15} className="flex-shrink-0" />
                  )}
                  <span>{result}</span>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <Button
                  type="submit"
                  className="bg-[#ff6000] hover:bg-[#e55500] text-white px-6 py-2.5 rounded-lg font-medium text-sm w-auto"
                >
                  Değişiklikleri Kaydet
                </Button>
              </div>
            </form>
          </div>

          {/* Şifre Değiştir */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <ShieldCheck size={16} className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Şifre Değiştir</h2>
                <p className="text-xs text-gray-500">Güvenliğiniz için şifrenizi düzenli olarak güncelleyin</p>
              </div>
            </div>

            <form className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Eski Şifre</label>
                  <Input type="password" placeholder="Mevcut şifreniz" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Yeni Şifre</label>
                  <Input type="password" placeholder="En az 8 karakter" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Tekrar</label>
                  <Input type="password" placeholder="Şifrenizi tekrar girin" />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <Button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium text-sm w-auto"
                >
                  Şifreyi Güncelle
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}