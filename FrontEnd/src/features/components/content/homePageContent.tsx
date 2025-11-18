"use client"

import { useState, useEffect } from "react"
import ProductCard from "../productCard"
import SearchBar from "../searchbar"
import { PaginationRequest,Product } from "@/lib/types/types"
import { getProducts } from "@/lib/api/products/useGetProducts"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Button from "@/features/components/button"

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
        setProducts(data.products || []);
        setResult('Ürün bulunamadı.');
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

  return (
    <main className="container mx-auto max-w-7xl px-4 py-10">
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
      <div id="products-section" className="mt-6 rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm p-4 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
        {products?.map((product)=> (
          
          <ProductCard key={product.id} product={product} />
        ))}  
      </div>
      </div>  
      ):(<p className="text-center border rounded-2xl p-4 text-gray-600">{result}</p>)
    }
    </main>
  )
}

export default HomePageContent;