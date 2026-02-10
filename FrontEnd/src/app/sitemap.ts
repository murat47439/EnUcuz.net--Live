import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/api/products/useGetProducts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'http://enucuz.net.tr'

    // Statik rotalar
    const routes = [
        '',
        '/login',
        // '/profile', // Robots.txt tarafından engellendiği için sitemap'e eklenmez
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    let productRoutes: MetadataRoute.Sitemap = []

    try {
        // API ile ürünleri çekmeye çalışıyoruz. 
        // Build sırasında API çalışmıyorsa bu kısım hata verebilir, bu yüzden try-catch bloğuna alındı.
        // İlk sayfadaki ürünleri alıyoruz. Daha fazlası için sayfalama mantığı eklenebilir.
        const productsData = await getProducts({ page: 1 })
        const products = productsData.products || []

        productRoutes = products.map((product) => ({
            url: `${baseUrl}/product/${product.id}`,
            lastModified: new Date(), // API'den gelen updated_at varsa onu kullanabilirsiniz: new Date(product.updated_at?.Time || new Date())
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }))
    } catch (error) {
        console.warn('Sitemap oluşturulurken ürünler çekilemedi. API çalışıyor mu?', error)
    }

    return [...routes, ...productRoutes]
}
