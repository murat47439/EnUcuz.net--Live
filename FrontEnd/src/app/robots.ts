import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://2pazar.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/login', '/admin'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
