"use client"
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { deleteProduct } from '@/lib/api/products/useDelete'
import { getProduct } from '@/lib/api/products/useGetProduct'
import { IdParam, ProductDetail, UpdateProductRequest} from '@/lib/types/types'
import { useAuth } from '@/context/authContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { UseModal } from '@/context/modalContext'
import Button from '@/features/components/button'
import Input from '@/features/components/input'
import { PencilIcon, TrashIcon } from 'lucide-react'
import {useToast} from '@/context/toastContext'
import { deleteProdAttribute } from '@/lib/api/attributes/useDeleteProd'
import AttributeSelect from '@/features/components/attributeselect'
import { updateProduct } from '@/lib/api/products/useUpdate'
type FormData = {
  name: string,
  description: string,
  price: number,
  stock: number
}
export default function ProductUpdatePage({ params }: { params: Promise<{ id: number }> }) {
    const router = useRouter()
    const [product, setProduct] = useState<ProductDetail>()
    const { user } = useAuth()
    const {openModal, closeModal} = UseModal()
    const {showNotification} = useToast();


   
    const methods = useForm<FormData>({
        defaultValues : {
            name: product?.data.product.name ,
            description: product?.data.product.description ,
            price: product?.data.product.price,
            stock: product?.data.product.stock 
        }
    })
     useEffect(() => {
    if (product){
        methods.reset({
            name: product.data.product.name,
            description: product.data.product.description,
            price: product.data.product.price,
            stock: product.data.product.stock
        })
    }
}, [product, methods])
    const {register, handleSubmit} = methods;
    const resolvedParams = React.use(params)
    useEffect(() => {

        const user = localStorage.getItem("user"); 
        if (!user) {
          router.push("/login"); 
        }
      }, [router]);
    // Ürünü getir
    useEffect(() => {
        const fetchData = async () => {
            const request: IdParam = { id: Number(resolvedParams.id) }
            try {
                const data = await getProduct(request)
                if (user?.id == data.data.product.seller_id){
                    setProduct(data)
                }else{
                    router.push('/404')   
                }
            } catch (err) {
                console.error(err)
                router.push('/404')
            }
        }
        fetchData()
    }, [resolvedParams, router,user])

    const handleDelete = async () => {
        const request: IdParam = { id: Number(resolvedParams.id) }
        try {
            const data = await deleteProduct(request)
            showNotification('Ürün başarıyla silindi. Yönlendiriliyorsunuz...', 'success', 4000)
            if(data.success) {
            setTimeout(() => {
                router.push('/profile/products')
            }, 2000)
          }
        } catch (err) {
            console.error(err)
        }
    }
    const handleDeleteAttribute = async (attributeId: number) => {
        const request: IdParam = { id: Number(attributeId) }
        try{
            const data = await deleteProdAttribute(request)
            showNotification('Özellik başarıyla silindi.', 'success', 4000)
            if(data.success){
                setTimeout(() => {
                    router.refresh()
                }, 2000)
            }
        }catch(err){
            console.error(err)
        }
    }
    const onsubmit = async (data: FormData) => {
      const request: UpdateProductRequest = {
        id: Number(resolvedParams.id),
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock
      }
      if (data.name == "" || data.description == "" || data.price == 0 || data.stock == 0) {showNotification('Lütfen tüm alanları doldurun.', 'error', 2000); return;}
      try{
        console.log(request)
        const data = await updateProduct(request)
        if (data.success){
          showNotification('Ürün başarıyla güncellendi.', 'success', 2000)
          setTimeout(() => {
            router.refresh()
          }, 2000)
        }
      }catch(err){
        console.error(err)
        showNotification('Ürün güncellenemedi.', 'error', 2000)
      }
    }
    return (
        <form onSubmit={handleSubmit(onsubmit)} className="max-w-6xl mx-auto p-6 md:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 mt-6 md:mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full aspect-square relative rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 group">
              <Image
                src={product?.data.product.image_url ? product.data.product.image_url : "/placeholder.png"}


                alt={product?.data.product.name ?? "Ürün Görseli"}
                fill
                className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                priority
                
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
  
            <div className="w-full">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
                Ek Görseller
              </h3>
              <div className="flex gap-3 overflow-x-auto w-full justify-center pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {product?.data.product.image_urls?.length ? (
                  product?.data.product.image_urls.map((img: string, i: number) => (
                    <div
                      key={i}
                      className="w-24 h-24 md:w-28 md:h-28 relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 hover:ring-4 hover:ring-blue-200 dark:hover:ring-blue-900 hover:shadow-lg transition-all duration-300 cursor-pointer flex-shrink-0 group"
                    >
                      <Image
                        src={img}
                        alt={`Ürün görseli ${i + 1}`}
                        fill
                        onClick={() =>
                            openModal(
                              <div className="flex flex-col items-center justify-center">
                                <h2 className="text-xl font-semibold mb-2">Ürün Resmi</h2>
                                <div className="relative overflow-hidden group">
                                    <Image
                                        src={img}
                                        alt={`Ürün görseli ${i + 1}`}
                                        
                                        width={400}
                                        height={400}
                                        className="object-contain p-2  transition-transform duration-300"
                                    />
                                    </div>
                                <button
                                type='button'
                                  onClick={closeModal}
                                  className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                  Kapat
                                </button>
                              </div>
                            )}
                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 text-sm py-4 px-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    Ek görsel bulunamadı.
                  </div>
                )}
              </div>
            </div>
          </div>
  

          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-white leading-tight">
                  {product?.data.product.name ?? "Ürün Adı"}
                </h1>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                  {product?.data.product.description ?? "Bu ürün için açıklama bulunmamaktadır."}
                </p>
              </div>
              <Button type='button' className=' ml-2  flex items-center justify-center text-sm' onClick={() => openModal(

                <div className='flex flex-col gap-2'>
                  <h2 className="text-xl font-semibold mb-2">Ürün Adı ve Açıklama</h2>
                  <Input type="text" placeholder="Ürün Adı"  {...register("name")} />
                  <Input as="textarea" placeholder="Ürün Açıklama"  {...register("description")}/>
                  <Button type='button' onClick={closeModal}>Kaydet</Button>
                </div>
              )}> <PencilIcon></PencilIcon><p className='ml-2'>Ürün adını ve açıklamasını düzenle</p></Button>

            </div>

            {product?.data.attribute && product.data.attribute.length > 0 ? (
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 pb-12 md:p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ürün Özellikleri</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.data.attribute.length} özellik</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                  {product.data.attribute.map((attr, index) => (
                    <div
                      key={attr.id || index}
                      className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute pointer-events-none inset-0 bg-gradient-to-r from-blue-50/0 to-blue-50/0 dark:from-blue-900/0 dark:to-blue-900/0 group-hover:from-blue-50/50 group-hover:to-transparent dark:group-hover:from-blue-900/20 dark:group-hover:to-transparent transition-all duration-300"></div>
                      
                      <div className="relative flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                            {attr.attribute_name}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white break-words">
                            {attr.value}
                          </div>
                        </div>
                      </div>
                      <Button type='button' className='w-full mt-4' onClick={() => openModal( <div className='sticky top-0 bg-white z-10 p-2 flex items-center justify-between gap-8'>Ürünü silmek istediğinize emin misiniz? <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'> <Button type='button' onClick={closeModal}>Hayır</Button> <Button className=' bg-red-600 hover:bg-red-700'onClick={() => { handleDeleteAttribute(attr.id); closeModal(); }}>Evet</Button></div> </div> )}> Sil</Button>
                    </div>
                  ))}
                  
                </div>
                <div className='absolute bottom-0 right-0 w-48 '>
                <Button type='button'  onClick={() => openModal(
            
            product?.data.product && (<AttributeSelect data={product.data.product}></AttributeSelect>)
            )}>Özellik Ekle</Button>
                </div>
                
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ürün Özellikleri</h3>
                  </div>
                </div>
                 <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                Henüz özellik eklenmemiş. <Button type='button' className='mt-8' onClick={() => openModal(
            
            product?.data.product && (<AttributeSelect data={product.data.product}></AttributeSelect>)
            )}>Özellik Ekle</Button>
              </div>
              </div>
            )}
  
            {/* Düzenleme Formu */}
            <div className="space-y-5 bg-gray-50 dark:bg-gray-800 rounded-xl p-5 md:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ürün Bilgileri
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Fiyat (₺)
                  </label>
                  <Input
                  {...register("price")}
                    type="number"
                     step="0.01"
                  
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
  
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Stok Adedi
                  </label>
                  <Input
                  {...register("stock")}
                    type="number"
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
  
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Marka
                  </label>
                  <input
                    readOnly
                    type="text"
                    defaultValue={product?.data.product.brand_name ?? ""}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
  
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Kategori
                  </label>
                  <input
                    readOnly
                    type="text"
                    defaultValue={product?.data.product.category_name ?? ""}
                    className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
  
            {/* Kaydet Butonu */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Button type='button' onClick={()=> openModal(
              <div className='sticky top-0 bg-white z-10 p-2 flex items-center justify-between gap-8'>Ürünü silmek istediğinize emin misiniz? 
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Button type='button' onClick={closeModal}>Hayır</Button> <Button className=' bg-red-600  hover:bg-red-700'onClick={() => {
                handleDelete();
                closeModal();
              }}>Evet</Button></div>

                </div>
            )} className="flex items-center justify-center gap-8 mt-4 w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-base"> 
              <TrashIcon className='w-4 h-4' /> Ürünü Sil</Button>

            <Button type='button' onClick={() => openModal(
              <div className='sticky top-0 bg-white z-10 p-2 flex items-center justify-between gap-8'>Kaydetmek istediğinize emin misiniz?
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Button type='button' onClick={closeModal}>Hayır</Button> <Button  type='button' onClick={handleSubmit(async (data) => {
    await onsubmit(data)
    closeModal()
})} className=' bg-red-600  hover:bg-red-700'>Evet</Button></div>
              </div>
            )} className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-base">
              Değişiklikleri Kaydet
            </Button>
            </div>
            
          </div>
        </div>
      </form>
    )
}
