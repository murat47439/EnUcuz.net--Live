"use client"
import { useAuth } from "@/context/authContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/features/components/input";
import Button from "@/features/components/button";
import React from "react";
import { LoginRequest, RegisterRequest } from "@/lib/types/types";
import { loginUser } from "@/lib/api/user/useLogin";
import { registerUser } from "@/lib/api/user/useRegister";
import { Mail, Lock, User, Phone, CheckCircle, XCircle } from "lucide-react";


export default function LoginPage() {
    const router = useRouter()

    useEffect(() => {
        // localStorage'dan user bilgisi al
        const user = localStorage.getItem("user");
        if (user) {
            router.push("/");
        }
    }, [router]);


    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [phone, setPhone] = useState('+90')

    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [contactAccepted, setContactAccepted] = useState(false);
    const [password, setPassword] = useState('');
    const [regpassword, setregPassword] = useState('');
    const [reg1password, setreg1Password] = useState('');


    const [result, setResult] = useState('');
    const { setUser } = useAuth()
    const [login, setLogin] = useState(true)
    const [register, setRegister] = useState(false)

    const handleLoginForm = async (e: React.FormEvent) => {
        e.preventDefault();
        const request: LoginRequest = {
            email: email,
            password: password,
        };


        try {
            const login = await loginUser(request)
            setUser(login.data.user)
            console.log(login.data.user)
            localStorage.setItem("user", JSON.stringify(login.data.user))
            setResult('Giriş başarılı.');
            router.push("/");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setResult(err.message)
            } else {
                setResult('Bir hata oluştu.');
            }
        }
    };
    const handleRegisterForm = async (e: React.FormEvent) => {
        e.preventDefault()
        const request: RegisterRequest = {
            name: name,
            surname: surname,
            email: email,
            password: regpassword,
            phone: phone,
            kvkk: kvkkAccepted,
            contact: contactAccepted
        };
        console.log(request)
        try {
            switch (true) {
                case (!name || name.trim() === ""):
                    setResult("Ad boş bırakılamaz");
                    return;

                case (!surname || surname.trim() === ""):
                    setResult("Soyad boş bırakılamaz");
                    return;

                case (!email || email.trim() === ""):
                    setResult("Email boş bırakılamaz");
                    return;

                case (!phone || phone.trim() === ""):
                    setResult("Telefon numarası boş bırakılamaz");
                    return;

                case (!regpassword || regpassword.trim() === ""):
                    setResult("Şifre boş bırakılamaz");
                    return;

                case (reg1password !== regpassword):
                    setResult("Şifreler uyuşmuyor");
                    return;
                case (!kvkkAccepted):
                    setResult("Sözleşme ve ekleri kabul edilmedi");
                    return;



                case (regpassword.length < 8):
                    setResult("Şifre en az 8 karakter olmalı");
                    return;
            }
            await registerUser(request)
            setResult('Başarılı')
        } catch (err: unknown) {
            if (err instanceof Error) {
                setResult(err.message)
            } else {
                setResult('Bir hata oluştu.');
            }
        }
    }

    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Ana Kart */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8">
                        {/* Başlık */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                {login ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
                            </h1>
                            <p className="text-gray-500 text-sm">
                                {login ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun ve başlayın'}
                            </p>
                        </div>

                        {/* Tab Butonları */}
                        <div className="grid grid-cols-2 gap-0 mb-6 border-b border-gray-200">
                            <button
                                type="button"
                                className={`py-2.5 text-sm font-medium transition-all duration-200 border-b-2 ${login
                                    ? 'border-[#ff6000] text-[#ff6000]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => { setLogin(true); setRegister(false); setResult('') }}
                            >
                                Giriş Yap
                            </button>
                            <button
                                type="button"
                                className={`py-2.5 text-sm font-medium transition-all duration-200 border-b-2 ${register
                                    ? 'border-[#ff6000] text-[#ff6000]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => { setLogin(false); setRegister(true); setResult('') }}
                            >
                                Kayıt Ol
                            </button>
                        </div>

                        {/* Hata/Başarı Mesajı */}
                        {result && (
                            <div className={`mb-5 p-3 rounded-lg flex items-center gap-2 text-sm ${result.includes('Başarılı') || result.includes('başarılı')
                                ? 'bg-green-50 border border-green-200 text-green-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                {result.includes('Başarılı') || result.includes('başarılı') ? (
                                    <CheckCircle size={16} className="flex-shrink-0" />
                                ) : (
                                    <XCircle size={16} className="flex-shrink-0" />
                                )}
                                <p className="text-sm font-medium">{result}</p>
                            </div>
                        )}

                        {/* Giriş Formu */}
                        {login && (
                            <form onSubmit={handleLoginForm} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        <Mail size={14} className="text-gray-400" />
                                        Email
                                    </label>
                                    <Input
                                        required
                                        type="email"
                                        name="email"
                                        placeholder="ornek@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        <Lock size={14} className="text-gray-400" />
                                        Şifre
                                    </label>
                                    <Input
                                        required
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-2.5 rounded-lg bg-[#ff6000] hover:bg-[#e55500] text-white font-semibold mt-2"
                                >
                                    Giriş Yap
                                </Button>
                            </form>
                        )}

                        {/* Kayıt Formu */}
                        {register && (
                            <form onSubmit={handleRegisterForm} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                            <User size={14} className="text-gray-400" />
                                            Ad
                                        </label>
                                        <Input
                                            required
                                            type="text"
                                            name="name"
                                            placeholder="Adınız"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                            <User size={14} className="text-gray-400" />
                                            Soyad
                                        </label>
                                        <Input
                                            required
                                            type="text"
                                            name="surname"
                                            placeholder="Soyadınız"
                                            value={surname}
                                            onChange={(e) => setSurname(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        <Mail size={14} className="text-gray-400" />
                                        Email
                                    </label>
                                    <Input
                                        required
                                        type="email"
                                        name="email"
                                        placeholder="ornek@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        <Phone size={14} className="text-gray-400" />
                                        Telefon
                                    </label>
                                    <Input
                                        required
                                        type="tel"
                                        name="phone"
                                        placeholder="+90 5XX XXX XX XX"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        <Lock size={14} className="text-gray-400" />
                                        Şifre
                                    </label>
                                    <Input
                                        required
                                        type="password"
                                        name="password"
                                        placeholder="En az 8 karakter"
                                        value={regpassword}
                                        onChange={(e) => setregPassword(e.target.value)}
                                    />
                                    {regpassword && regpassword.length < 8 && (
                                        <p className="text-xs text-amber-600 mt-1">Şifre en az 8 karakter olmalı</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        <Lock size={14} className="text-gray-400" />
                                        Şifre Tekrar
                                    </label>
                                    <Input
                                        required
                                        type="password"
                                        name="password"
                                        placeholder="Şifrenizi tekrar girin"
                                        value={reg1password}
                                        onChange={(e) => setreg1Password(e.target.value)}
                                    />
                                    {reg1password && reg1password !== regpassword && (
                                        <p className="text-xs text-red-600 mt-1">Şifreler uyuşmuyor</p>
                                    )}
                                    {reg1password && reg1password === regpassword && regpassword.length >= 8 && (
                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                            <CheckCircle size={12} /> Şifreler uyuşuyor
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <input className="peer hidden" required type="checkbox" name="KVKK" onChange={(e) => setKvkkAccepted(e.target.checked)} />
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded-md flex items-center justify-center transition-all duration-200 
                                            peer-checked:bg-[#ff6000] peer-checked:border-[#ff6000] p-1
                                            group-hover:border-[#ff6000]/60">
                                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-600 select-none group-hover:text-gray-800 transition-colors duration-200">
                                            <a href="/sozlesme" target="_blank" className="text-[#ff6000] hover:underline font-medium">Bireysel Hesap Sözleşmesi ve Ekleri'</a>&apos;ni okudum ve kabul ediyorum.
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <input className="peer hidden" type="checkbox" name="contact" onChange={(e) => setContactAccepted(e.target.checked)} />
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded-md flex items-center justify-center transition-all duration-200 
                                            peer-checked:bg-[#ff6000] peer-checked:border-[#ff6000] p-1
                                            group-hover:border-[#ff6000]/60">
                                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-600 select-none group-hover:text-gray-800 transition-colors duration-200">

                                            İletişim bilgilerime kampanya, tanıtım ve reklam içerikli ticari elektronik ileti gönderilmesine, bu amaçla kişisel verilerimin işlenmesine ve tedarikçilerinizle paylaşılmasına izin veriyorum.
                                        </span>
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-2.5 rounded-lg bg-[#ff6000] hover:bg-[#e55500] text-white font-semibold mt-2"
                                >
                                    Kayıt Ol
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}