import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/api/products/useGetProducts'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://enucuz.net.tr'

    // Statik rotalar
    const routes = [
        '',
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

        productRoutes = products.map((product) => {
            let lastModified = new Date()
            if (product.updated_at?.Valid && product.updated_at.Time) {
                lastModified = new Date(product.updated_at.Time)
            } else if (product.created_at?.Valid && product.created_at.Time) {
                lastModified = new Date(product.created_at.Time)
            }

            return {
                url: `${baseUrl}/product/${product.id}`,
                lastModified,
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }
        })
    } catch (error) {
        console.warn('Sitemap oluşturulurken ürünler çekilemedi. API çalışıyor mu?', error)
    }

    return [...routes, ...productRoutes]
}
