import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://enucuz.net.tr'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/login', '/admin'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
