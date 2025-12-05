"use client"

import { useState, useEffect, useRef } from "react"
import ProductCard from "../productCard"
import SearchBar from "../searchbar"
import { PaginationRequest,Product } from "@/lib/types/types"
import { getProducts } from "@/lib/api/products/useGetProducts"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Button from "@/features/components/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
function HomePageContent() {
    const [products, setProducts] = useState<Product[]>([]);
    const searchParams = useSearchParams();
    const brand = parseInt(searchParams.get('brand') || '0')
  const category = parseInt(searchParams.get('category') || '0')
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState('');
  useEffect(() =>{
    const fetchData = async () =>{
      const request: PaginationRequest = {
        page:1,
        search:searchQuery,
        brand:brand || 0,
        category: category || 0,
      };
      try{
        setResult('API nın başlatılması 30-45 saniye sürebilir lütfen bekleyiniz.');
        const data = await getProducts(request);
        const fetchedProducts = data.products || [];
        setProducts(fetchedProducts);
        if (fetchedProducts.length === 0){
        setResult('Ürün bulunamadı.');

        }
      }catch(err){
        setResult('Bir hata oluştu lütfen tekrar deneyiniz.');
        console.error(err)
        setProducts([]);
      }
    }
      fetchData();
  }, [searchQuery, brand, category]);

  const handleSearchSubmit = (searchTerm: string) => {
    setSearchQuery(searchTerm)
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      const offsetTop = productsSection.offsetTop - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  }
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  }

  return (
    <main className="container mx-auto max-w-7xl px-2 sm:px-4 py-6 sm:py-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-sm">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm px-6 py-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">En Uygun 2. El Ürünleri Keşfet</h1>
          <p className="mt-2 text-gray-600">Binlerce ilan arasından aradığını bul veya ürününü birkaç adımda listele.</p>
          <div className="mt-6 flex items-center justify-center gap-4 w-full max-w-md mx-auto">
            <Button 
              className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
              onClick={scrollToProducts}
            >
              Keşfetmeye Başla
            </Button>
            <Link href="/profile/new-product" className="flex-1">
              <Button variant="secondary" className="w-full rounded-full px-6 py-3 font-semibold">Ürün Sat</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <p className="text-center text-gray-600 mb-6 mt-8">Aradığınız ürünü satıcılardan uygun fiyata alın!</p>
      <SearchBar onSearchSubmit={handleSearchSubmit} />
      { products?.length >0 ?(
      <div className="relative w-full mt-6 -mx-2 sm:mx-0">
      {/* Sol Buton */}
      <button
        onClick={scrollLeft}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-lg p-2 rounded-full z-10 hover:bg-gray-700 hover:text-white transition-colors"
        aria-label="Sola kaydır"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Sağ Buton */}
      <button
        onClick={scrollRight}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-lg p-2 rounded-full z-10 hover:bg-gray-700 hover:text-white transition-colors"
        aria-label="Sağa kaydır"
      >
        <ChevronRight size={20} />
      </button>

      {/* Kayan Ürün Listesi */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth p-2 sm:p-4 scrollbar-hide"
      >
        {products.map(product => (
          <div
            key={product.id}
            className="min-w-[180px] sm:min-w-[220px] md:min-w-[250px] max-w-[180px] sm:max-w-[220px] md:max-w-[250px] flex-shrink-0"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div> 
      ):(<p className="text-center border rounded-2xl p-4 text-gray-600">{result}</p>)
    }
    </main>
  )
}

export default HomePageContent;