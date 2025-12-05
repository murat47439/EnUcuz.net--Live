"use client"
import {  useAuth } from "@/context/authContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/features/components/input";
import Button from "@/features/components/button";
import React from "react";
import { LoginRequest,RegisterRequest } from "@/lib/types/types";
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


    const [email,setEmail] = useState('');
    const [name,setName] = useState('');
    const [surname,setSurname] = useState('');
    const [phone, setPhone] = useState('+90')


    const [password, setPassword] = useState('');
    const [regpassword, setregPassword] = useState('');
    const [reg1password, setreg1Password] = useState('');


    const [result, setResult] = useState('');
    const {setUser} = useAuth()
    const [login, setLogin] = useState(true)
    const [register, setRegister] = useState(false)

    const handleLoginForm = async (e: React.FormEvent) => {
        e.preventDefault();
        const request : LoginRequest = {
            email: email,
            password: password,
        };
        
        
        try{
            const login = await loginUser(request)
            setUser(login.data.user)
            console.log(login.data.user)
            localStorage.setItem("user", JSON.stringify(login.data.user))
            setResult('Giriş başarılı.');
            router.push("/");
        }catch(err:unknown){
            if (err instanceof Error){
                setResult(err.message)
            }else{
                setResult('Bir hata oluştu.');
            }
        }
    };
    const handleRegisterForm = async(e: React.FormEvent) => {
        e.preventDefault()
        const request: RegisterRequest = {
            name: name,
            surname: surname,
            email: email,
            password: regpassword,
            phone: phone,
        };
        try{
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

    case (regpassword.length < 8):
        setResult("Şifre en az 8 karakter olmalı");
        return;
    }
        await registerUser(request)
           setResult('Başarılı')
        }catch(err: unknown){
            if (err instanceof Error){
                setResult(err.message)
            }else{
                setResult('Bir hata oluştu.');
            }
        }
    }

    return(
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Ana Kart */}
                <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-2xl">
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl"></div>
                    
                    <div className="p-8">
                        {/* Başlık */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                {login ? 'Hoş Geldiniz' : 'Hesap Oluştur'}
                            </h1>
                            <p className="text-gray-600 text-sm">
                                {login ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun ve başlayın'}
                            </p>
                        </div>

                        {/* Tab Butonları */}
                        <div className="grid grid-cols-2 gap-3 mb-8 p-1 bg-gray-100 rounded-xl">
                            <button
                                type="button"
                                className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    login
                                        ? 'bg-white text-blue-600 shadow-md'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                                onClick={() => {setLogin(true); setRegister(false); setResult('')}}
                            >
                                Giriş Yap
                            </button>
                            <button
                                type="button"
                                className={`py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                                    register
                                        ? 'bg-white text-blue-600 shadow-md'
                                        : 'text-gray-600 hover:text-gray-800'
                                }`}
                                onClick={() => {setLogin(false); setRegister(true); setResult('')}}
                            >
                                Kayıt Ol
                            </button>
                        </div>

                        {/* Hata/Başarı Mesajı */}
                        {result && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                                result.includes('Başarılı') || result.includes('başarılı')
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                                {result.includes('Başarılı') || result.includes('başarılı') ? (
                                    <CheckCircle size={20} className="flex-shrink-0" />
                                ) : (
                                    <XCircle size={20} className="flex-shrink-0" />
                                )}
                                <p className="text-sm font-medium">{result}</p>
                            </div>
                        )}

                        {/* Giriş Formu */}
                        {login && (
                            <form onSubmit={handleLoginForm} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Mail size={16} className="text-gray-500" />
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
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Lock size={16} className="text-gray-500" />
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
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    Giriş Yap
                                </Button>
                            </form>
                        )}

                        {/* Kayıt Formu */}
                        {register && (
                            <form onSubmit={handleRegisterForm} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <User size={16} className="text-gray-500" />
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
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <User size={16} className="text-gray-500" />
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
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Mail size={16} className="text-gray-500" />
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
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Phone size={16} className="text-gray-500" />
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
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Lock size={16} className="text-gray-500" />
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
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Lock size={16} className="text-gray-500" />
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

                                <Button
                                    type="submit"
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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