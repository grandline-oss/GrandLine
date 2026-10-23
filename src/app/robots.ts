import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://grand-line-red.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/menu', '/about', '/contact', '/privacy', '/terms'],
        disallow: ['/admin/', '/admin/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
