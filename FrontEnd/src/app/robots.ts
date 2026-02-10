import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'http://enucuz.net.tr'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/profile/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
