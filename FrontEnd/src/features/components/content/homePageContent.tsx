"use client"

import { useState, useEffect } from "react"
import ProductCard from "../productCard"
import SearchBar from "../searchbar"
import { PaginationRequest, Product } from "@/lib/types/types"
import { getProducts } from "@/lib/api/products/useGetProducts"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Search, ShieldCheck, Truck, CreditCard, ArrowRight, PackageX, ChevronRight, Home } from "lucide-react"
import PageLoader from "@/features/components/pageLoader"

function HomePageContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const brand = parseInt(searchParams.get('brand') || '0')
    const category = parseInt(searchParams.get('category') || '0')
    const searchFromUrl = searchParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(searchFromUrl);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const isSearchMode = !!searchFromUrl || brand > 0 || category > 0;

    // URL'den gelen search parametresi değiştiğinde state'i güncelle
    useEffect(() => {
        setSearchQuery(searchFromUrl);
    }, [searchFromUrl]);

    useEffect(() => {
        const fetchData = async () => {
            const request: PaginationRequest = {
                page: 1,
                search: searchQuery,
                brand: brand || 0,
                category: category || 0,
            };
            try {
                setIsLoading(true);
                setResult('');
                const data = await getProducts(request);
                const fetchedProducts = data.products || [];
                setProducts(fetchedProducts);
                if (fetchedProducts.length === 0) {
                    setResult('Ürün bulunamadı.');
                }
            } catch (err) {
                setResult('Bir hata oluştu lütfen tekrar deneyiniz.');
                console.error(err)
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [searchQuery, brand, category]);

    const handleSearchSubmit = (searchTerm: string) => {
        // Local state yerine URL'i güncelle -> Arama moduna geç
        if (searchTerm.trim()) {
            router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            router.push('/');
        }
    };

    const quickCategories = [
        { label: "Elektronik", href: "/?category=1071" },
        { label: "Ev & Mobilya", href: "/?category=758" },
        { label: "Spor", href: "/?category=3186" },
        { label: "Ayakkabı", href: "/?category=403" },
        { label: "Saat & Aksesuar", href: "/?category=368" },
        { label: "Kozmetik", href: "/?category=1070" },
        { label: "Anne & Çocuk", href: "/?category=2862" },
        { label: "Kitap", href: "/?category=1216" },
    ];

    const features = [
        { icon: ShieldCheck, title: "Güvenli Alışveriş", desc: "Teklif sistemi ile güvenli alım satım" },
        { icon: Truck, title: "Hızlı Teslimat", desc: "Satıcıdan alıcıya direkt gönderim" },
        { icon: CreditCard, title: "Uygun Fiyatlar", desc: "İkinci el ürünlerde en iyi fırsatlar" },
    ];

    // Ürün Grid Render (Reusable)
    const renderProductGrid = () => (
        <>
            <div id="products-section" className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {isSearchMode ? "Arama Sonuçları" : "Tüm İlanlar"}
                        </h2>
                        {products.length > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">{products.length} ürün listeleniyor</p>
                        )}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <PageLoader fullPage={false} size="sm" label="Ürünler yükleniyor" />
            ) : products?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-8">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-lg mb-8">
                    <PackageX size={40} className="text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">{result || "Ürün bulunamadı"}</p>
                    <p className="text-xs text-gray-400">Farklı anahtar kelimelerle tekrar deneyin</p>
                    {isSearchMode && (
                        <button
                            onClick={() => router.push('/')}
                            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            Tüm İlanları Gör
                        </button>
                    )}
                </div>
            )}
        </>
    );

    // Eğer Arama/Kategori/Filtre modu aktifse -> Sadece sonuçları göster
    if (isSearchMode) {
        return (
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
                {/* Breadcrumb - Arama Modu */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                    <Link href="/" className="hover:text-[#ff6000] flex items-center gap-1">
                        <Home size={12} />
                        Anasayfa
                    </Link>
                    <ChevronRight size={12} className="text-gray-400" />
                    <span className="font-medium text-gray-900">
                        {searchFromUrl ? `'${searchFromUrl}' için sonuçlar` : 'Filtrelenmiş Ürünler'}
                    </span>
                </div>

                {/* Filtreleme Başlığı */}
                {searchFromUrl && (
                    <div className="mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            &quot;{searchFromUrl}&quot; arama sonuçları
                        </h1>
                    </div>
                )}

                {renderProductGrid()}
            </main>
        );
    }

    // Normal Anasayfa Görünümü
    return (
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            {/* Hero Section - Compact Banner */}
            <div className="mt-4 sm:mt-6 mb-6 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                <div className="px-5 sm:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                            En Uygun 2. El Ürünleri Keşfet
                        </h1>
                        <p className="text-gray-300 text-sm sm:text-base max-w-md mb-5">
                            Binlerce ilan arasından aradığını bul, güvenle satın al veya ürününü hemen listele.
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <Link href="/profile/new-product">
                                <button className="h-10 px-5 rounded-lg bg-[#ff6000] hover:bg-[#e55500] text-white text-sm font-semibold flex items-center gap-2 transition-colors">
                                    <Plus size={16} />
                                    Ürün Sat
                                </button>
                            </Link>
                            <a href="#products-section">
                                <button className="h-10 px-5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium flex items-center gap-2 transition-colors border border-white/20">
                                    <Search size={15} />
                                    Ürün Ara
                                </button>
                            </a>
                        </div>
                    </div>
                    {/* Stats */}
                    <div className="flex gap-6 sm:gap-8">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-white">{products.length > 0 ? products.length + "+" : "—"}</div>
                            <div className="text-xs text-gray-400 mt-0.5">Aktif İlan</div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Search Bar (Anasayfa İçin) */}
            <div className="mb-6">
                <SearchBar onSearchSubmit={handleSearchSubmit} />
            </div>

            {/* Quick Categories */}
            <div className="mb-6">
                <div className="flex items-center overflow-x-auto gap-2 pb-1 scrollbar-hide">
                    {quickCategories.map((cat) => (
                        <Link
                            key={cat.label}
                            href={cat.href}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium hover:border-[#ff6000] hover:text-[#ff6000] transition-colors whitespace-nowrap flex-shrink-0"
                        >
                            {cat.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Features Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {features.map((feature) => (
                    <div key={feature.title} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
                        <div className="w-9 h-9 rounded-lg bg-[#fff4ed] flex items-center justify-center flex-shrink-0">
                            <feature.icon size={18} className="text-[#ff6000]" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">{feature.title}</div>
                            <div className="text-xs text-gray-500">{feature.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Products Grid */}
            {renderProductGrid()}

            {/* CTA Banner */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Satmak istediğin bir ürün mü var?</h3>
                        <p className="text-sm text-gray-500">Hemen ücretsiz olarak ürününü listele ve alıcılardan teklif al.</p>
                    </div>
                    <Link href="/profile/new-product">
                        <button className="h-11 px-6 rounded-lg bg-[#ff6000] hover:bg-[#e55500] text-white text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap">
                            Hemen Başla
                            <ArrowRight size={16} />
                        </button>
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default HomePageContent;